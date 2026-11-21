from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: Dict[str, Any]

class SupplierBase(BaseModel):
    name: str
    supplier_type: str
    destinations: str
    procurement_price_avg: float
    available_capacity: int
    reliability_score: float
    cancellation_conditions: str
    status: str
    contact_email: str

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    supplier_type: Optional[str] = None
    destinations: Optional[str] = None
    procurement_price_avg: Optional[float] = None
    available_capacity: Optional[int] = None
    reliability_score: Optional[float] = None
    cancellation_conditions: Optional[str] = None
    status: Optional[str] = None
    contact_email: Optional[str] = None

class SupplierOut(SupplierBase):
    id: int
    class Config:
        from_attributes = True

class ForecastRequest(BaseModel):
    destination: str = "Goa"
    inventory_type: str = "All" # Hotel, Flight, or All
    model_type: str = "ensemble" # "ensemble", "random_forest", "exponential_smoothing", "moving_average"
    forecast_days: int = 30

class ForecastPoint(BaseModel):
    date: str
    actual_bookings: Optional[float] = None
    predicted_bookings: float
    lower_bound: float
    upper_bound: float
    searches: Optional[int] = 0
    sold_out_risk: float

class ForecastResponse(BaseModel):
    destination: str
    inventory_type: str
    model_used: str
    mae: float
    rmse: float
    mape: float
    growth_pct: float
    points: List[ForecastPoint]
    key_drivers: List[Dict[str, Any]]
    model_comparison: Dict[str, Dict[str, float]]

class OpportunityItem(BaseModel):
    id: str
    destination: str
    inventory_type: str
    supplier: str
    travel_period: str
    forecast_demand: int
    available_inventory: int
    predicted_sell_through: float # percentage 0-100
    procurement_price: float
    expected_selling_price: float
    unit_margin: float
    estimated_profit: float
    risk_level: str # Low, Medium, High
    opportunity_score: float # 0 to 100
    rationale: str

class OptimizationRequest(BaseModel):
    budget: float = Field(default=5000000.0, ge=100000)
    risk_preference: str = "balanced" # "conservative", "balanced", "aggressive"
    preferred_destinations: List[str] = []
    inventory_type: str = "All"
    min_profit_margin_pct: float = 10.0
    max_inventory_per_dest: Optional[int] = None

class AllocationItem(BaseModel):
    destination: str
    inventory_type: str
    supplier: str
    recommended_units: int
    procurement_cost: float
    total_cost: float
    expected_selling_price: float
    expected_revenue: float
    expected_profit: float
    roi_pct: float
    sell_through_pct: float
    expected_unsold_units: int
    expected_unsold_loss: float
    expected_cancellations: int
    expected_cancellation_loss: float
    risk_level: str
    rationale: str

class OptimizationResult(BaseModel):
    budget: float
    total_allocated: float
    unused_budget: float
    expected_revenue: float
    expected_profit: float
    expected_roi_pct: float
    expected_unsold_quantity: int
    expected_unsold_loss: float
    expected_cancellation_loss: float
    allocations: List[AllocationItem]
    destination_breakdown: List[Dict[str, Any]]
    inventory_breakdown: List[Dict[str, Any]]
    algorithm_summary: Dict[str, Any]

class RiskSimulationRequest(BaseModel):
    budget: float = 5000000.0
    demand_shock_pct: float = 0.0 # e.g. -15.0 for 15% drop
    cancellation_surge_pct: float = 0.0 # e.g. +10.0 for 10% increase
    procurement_inflation_pct: float = 0.0 # e.g. +8.0
    selected_destinations: List[str] = []

class RiskSimulationResult(BaseModel):
    overall_risk_score: float # 0-100
    risk_category: str # Low, Moderate, High, Severe
    financial_exposure: float
    expected_cancellation_loss: float
    expected_unsold_inventory_loss: float
    net_profit_after_shocks: float
    var_95: float # Value at Risk at 95% confidence
    high_risk_destinations: List[Dict[str, Any]]
    mitigation_strategies: List[str]
    stress_curve: List[Dict[str, Any]]

class ScenarioComparisonItem(BaseModel):
    scenario_name: str
    description: str
    demand_change_pct: float
    cancellation_change_pct: float
    cost_change_pct: float
    investment: float
    revenue: float
    net_profit: float
    roi_pct: float
    unsold_units: int
    risk_score: float

class DataQualitySummary(BaseModel):
    total_rows: int
    valid_rows: int
    invalid_rows: int
    missing_values_count: int
    destinations_count: int
    date_range: Dict[str, str]
    columns_detected: List[str]
    quality_score: float
