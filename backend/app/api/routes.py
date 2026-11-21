import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.connection import get_db
from app.models.models import HistoricalRecord, Supplier, OptimizationScenarioRecord
from app.schemas.schemas import (
    LoginRequest, LoginResponse,
    SupplierCreate, SupplierUpdate, SupplierOut,
    ForecastRequest, ForecastResponse,
    OptimizationRequest, OptimizationResult,
    RiskSimulationRequest, RiskSimulationResult
)
from app.services.travel_service import (
    get_dashboard_summary, get_opportunity_list,
    validate_and_ingest_csv, generate_sample_csv_template
)
from app.algorithms.forecasting import run_demand_forecast
from app.algorithms.optimizer import run_budget_optimization
from app.algorithms.risk_engine import run_risk_simulation, get_preset_scenarios
from app.services.export_service import (
    export_optimization_to_csv, export_forecast_to_csv, generate_executive_report_text
)
from app.core.config import settings
from app.database.seed_data import seed_database_if_empty

router = APIRouter()

# 1. AUTH
@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    if payload.email.strip().lower() == settings.DEMO_USER_EMAIL.lower() and payload.password == settings.DEMO_USER_PASSWORD:
        return {
            "token": "demo-jwt-token-tripstock-2026",
            "user": {
                "name": "Arjun Sharma",
                "role": "Director of Travel Inventory & Yield",
                "email": settings.DEMO_USER_EMAIL,
                "organization": "TBO.com Global Procurement"
            }
        }
    # Allow demo bypass for hackathon judges if they click Demo Login
    if "demo" in payload.email.lower() or payload.password == "demo":
        return {
            "token": "demo-jwt-token-tripstock-2026",
            "user": {
                "name": "Demo Reviewer",
                "role": "Hackathon Evaluation Panel",
                "email": "judge@hackathon.org",
                "organization": "TBO.com Jury"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials. Use demo credentials provided.")

# 2. DASHBOARD
@router.get("/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    return get_dashboard_summary(db)

# 3. DEMAND FORECASTING
@router.get("/forecast", response_model=ForecastResponse)
def get_default_forecast(destination: str = "Goa", inventory_type: str = "All", db: Session = Depends(get_db)):
    query = db.query(HistoricalRecord).filter(HistoricalRecord.destination == destination)
    if inventory_type != "All":
        query = query.filter(HistoricalRecord.inventory_type == inventory_type)
    records = [r.__dict__ for r in query.order_by(HistoricalRecord.date.asc()).all()]
    res = run_demand_forecast(records, forecast_days=30, model_choice="ensemble")
    return {
        "destination": destination,
        "inventory_type": inventory_type,
        **res
    }

@router.post("/forecast/run", response_model=ForecastResponse)
def run_custom_forecast(payload: ForecastRequest, db: Session = Depends(get_db)):
    query = db.query(HistoricalRecord).filter(HistoricalRecord.destination == payload.destination)
    if payload.inventory_type != "All":
        query = query.filter(HistoricalRecord.inventory_type == payload.inventory_type)
    records = [r.__dict__ for r in query.order_by(HistoricalRecord.date.asc()).all()]
    res = run_demand_forecast(records, forecast_days=payload.forecast_days, model_choice=payload.model_type)
    return {
        "destination": payload.destination,
        "inventory_type": payload.inventory_type,
        **res
    }

# 4. OPPORTUNITIES
@router.get("/opportunities")
def list_opportunities(db: Session = Depends(get_db)):
    return get_opportunity_list(db)

# 5. BUDGET OPTIMIZATION
@router.post("/optimization/run", response_model=OptimizationResult)
def optimize_budget(payload: OptimizationRequest, db: Session = Depends(get_db)):
    opps = get_opportunity_list(db)
    result = run_budget_optimization(
        opportunities=opps,
        budget=payload.budget,
        risk_preference=payload.risk_preference,
        preferred_destinations=payload.preferred_destinations,
        inventory_type_filter=payload.inventory_type,
        min_profit_margin_pct=payload.min_profit_margin_pct,
        max_inventory_per_dest=payload.max_inventory_per_dest
    )
    return result

@router.get("/optimization/scenarios")
def get_saved_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(OptimizationScenarioRecord).order_by(OptimizationScenarioRecord.created_at.desc()).all()
    out = []
    for s in scenarios:
        out.append({
            "id": s.id,
            "name": s.name,
            "created_at": s.created_at.isoformat(),
            "budget": s.budget,
            "risk_preference": s.risk_preference,
            "total_allocated": s.total_allocated,
            "expected_revenue": s.expected_revenue,
            "expected_profit": s.expected_profit,
            "expected_roi": s.expected_roi,
            "rationale": s.rationale,
            "allocations_count": len(json.loads(s.allocations_json or "[]"))
        })
    return out

@router.post("/optimization/scenarios")
def save_scenario(payload: Dict[str, Any], db: Session = Depends(get_db)):
    sc = OptimizationScenarioRecord(
        name=payload.get("name", "Strategic Budget Scenario"),
        budget=float(payload.get("budget", 5000000.0)),
        risk_preference=str(payload.get("risk_preference", "balanced")),
        total_allocated=float(payload.get("total_allocated", 0.0)),
        unused_budget=float(payload.get("unused_budget", 0.0)),
        expected_revenue=float(payload.get("expected_revenue", 0.0)),
        expected_profit=float(payload.get("expected_profit", 0.0)),
        expected_roi=float(payload.get("expected_roi_pct", 0.0)),
        expected_unsold_loss=float(payload.get("expected_unsold_loss", 0.0)),
        expected_cancellation_loss=float(payload.get("expected_cancellation_loss", 0.0)),
        allocations_json=json.dumps(payload.get("allocations", [])),
        rationale=str(payload.get("rationale", "Saved by inventory director"))
    )
    db.add(sc)
    db.commit()
    db.refresh(sc)
    return {"success": True, "id": sc.id, "message": "Optimization scenario persisted successfully."}

# 6. RISK ANALYSIS
@router.get("/risk/summary", response_model=RiskSimulationResult)
def get_risk_summary(db: Session = Depends(get_db)):
    opps = get_opportunity_list(db)
    opt = run_budget_optimization(opps, budget=5000000.0, risk_preference="balanced")
    return run_risk_simulation(opt["allocations"], budget=5000000.0)

@router.post("/risk/simulate", response_model=RiskSimulationResult)
def simulate_risk(payload: RiskSimulationRequest, db: Session = Depends(get_db)):
    opps = get_opportunity_list(db)
    opt = run_budget_optimization(opps, budget=payload.budget, risk_preference="balanced")
    return run_risk_simulation(
        allocations=opt["allocations"],
        budget=payload.budget,
        demand_shock_pct=payload.demand_shock_pct,
        cancellation_surge_pct=payload.cancellation_surge_pct,
        procurement_inflation_pct=payload.procurement_inflation_pct,
        selected_destinations=payload.selected_destinations
    )

# 7. SCENARIO SIMULATOR
@router.get("/scenarios/presets")
def get_preset_scenario_list(budget: float = 5000000.0, db: Session = Depends(get_db)):
    opps = get_opportunity_list(db)
    opt = run_budget_optimization(opps, budget=budget, risk_preference="balanced")
    return get_preset_scenarios(opt)

# 8. SUPPLIERS CRUD
@router.get("/suppliers", response_model=List[SupplierOut])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).order_by(Supplier.reliability_score.desc()).all()

@router.post("/suppliers", response_model=SupplierOut)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    sup = Supplier(**payload.dict())
    db.add(sup)
    db.commit()
    db.refresh(sup)
    return sup

@router.put("/suppliers/{supplier_id}", response_model=SupplierOut)
def update_supplier(supplier_id: int, payload: SupplierUpdate, db: Session = Depends(get_db)):
    sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
    update_data = payload.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(sup, k, v)
    db.commit()
    db.refresh(sup)
    return sup

@router.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
    db.delete(sup)
    db.commit()
    return {"success": True, "message": f"Supplier '{sup.name}' deleted successfully."}

# 9. DATA MANAGEMENT
@router.post("/data/upload")
async def upload_csv_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    result = validate_and_ingest_csv(db, contents)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@router.get("/data/sample-template")
def download_sample_template():
    csv_content = generate_sample_csv_template()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tripstock_inventory_template.csv"}
    )

# 10. REPORTS & EXPORTS
@router.get("/reports/executive")
def get_executive_report(db: Session = Depends(get_db)):
    summary = get_dashboard_summary(db)
    opps = get_opportunity_list(db)
    opt = run_budget_optimization(opps, budget=5000000.0)
    risk = run_risk_simulation(opt["allocations"], budget=5000000.0)
    report_text = generate_executive_report_text(summary, opt, risk)
    return {"report_text": report_text}

@router.post("/reports/export")
def export_data(payload: Dict[str, Any], db: Session = Depends(get_db)):
    export_type = payload.get("type", "optimization")
    if export_type == "optimization":
        opps = get_opportunity_list(db)
        opt = run_budget_optimization(opps, budget=float(payload.get("budget", 5000000.0)))
        csv_str = export_optimization_to_csv(opt)
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=tripstock_budget_optimization.csv"}
        )
    elif export_type == "forecast":
        dest = payload.get("destination", "Goa")
        query = db.query(HistoricalRecord).filter(HistoricalRecord.destination == dest)
        records = [r.__dict__ for r in query.order_by(HistoricalRecord.date.asc()).all()]
        forecast = run_demand_forecast(records, forecast_days=30)
        csv_str = export_forecast_to_csv(forecast)
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=tripstock_forecast_{dest}.csv"}
        )
    return {"error": "Invalid export type"}

# 11. SETTINGS / DEMO RESET
@router.post("/settings/reset-demo")
def reset_demo_database(db: Session = Depends(get_db)):
    db.query(HistoricalRecord).delete()
    db.query(Supplier).delete()
    db.query(OptimizationScenarioRecord).delete()
    db.commit()
    seed_database_if_empty(db)
    return {"success": True, "message": "Demo database successfully reset and re-seeded with pristine travel dataset."}
