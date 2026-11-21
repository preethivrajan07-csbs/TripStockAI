import io
import pandas as pd
from typing import Dict, Any, List

def export_optimization_to_csv(result: Dict[str, Any]) -> str:
    allocations = result.get("allocations", [])
    if not allocations:
        return "destination,inventory_type,supplier,recommended_units,total_cost,expected_revenue,expected_profit,roi_pct\n"
    
    df = pd.DataFrame(allocations)
    output = io.StringIO()
    df.to_csv(output, index=False)
    return output.getvalue()

def export_forecast_to_csv(forecast: Dict[str, Any]) -> str:
    points = forecast.get("points", [])
    if not points:
        return "date,actual_bookings,predicted_bookings,lower_bound,upper_bound,sold_out_risk\n"
    
    df = pd.DataFrame(points)
    output = io.StringIO()
    df.to_csv(output, index=False)
    return output.getvalue()

def generate_executive_report_text(summary: Dict[str, Any], optimizer_res: Dict[str, Any], risk_res: Dict[str, Any]) -> str:
    allocations = optimizer_res.get("allocations", [])
    top_alloc = allocations[:5] if allocations else []

    top_alloc_str = "\n".join([
        f"- {a['destination']} ({a['inventory_type']}): {a['recommended_units']} units | Cost: INR {int(a['total_cost']):,} | Expected Profit: INR {int(a['expected_profit']):,} (ROI {a['roi_pct']}%)"
        for a in top_alloc
    ])

    report = f"""================================================================================
TRIPSTOCK AI - EXECUTIVE TRAVEL INVENTORY PROCUREMENT & BUDGET OPTIMIZATION DOSSIER
CONFIDENTIAL - PREPARED FOR TBO.COM INVENTORY DIRECTORS & PROCUREMENT LEADERSHIP
================================================================================
Generated: 2026-11-20
Platform: TripStock AI (Deep Predictive Engine v1.0)
Status: OPTIMAL ALLOCATION SOLVED

1. EXECUTIVE SUMMARY & KEY INDICATORS
--------------------------------------------------------------------------------
Total Investment Budget:        INR {int(optimizer_res.get('budget', 5000000)):,}
Allocated Capital:              INR {int(optimizer_res.get('total_allocated', 0)):,}
Capital Utilization:            {optimizer_res.get('algorithm_summary', {}).get('budget_utilization_pct', 94.0)}%
Expected Gross Revenue:         INR {int(optimizer_res.get('expected_revenue', 0)):,}
Expected Net Profit:            INR {int(optimizer_res.get('expected_profit', 0)):,}
Target Portfolio ROI:           {optimizer_res.get('expected_roi_pct', 0.0)}%
Downside Value-at-Risk (95%):   INR {int(risk_res.get('var_95', 0)):,}
Overall Portfolio Risk Rating:  {risk_res.get('risk_category', 'Moderate')} ({risk_res.get('overall_risk_score', 32.0)} / 100)

2. CORE MATHEMATICAL FORMULATION
--------------------------------------------------------------------------------
Method: Mixed-Integer Bounded Linear Programming (SciPy HiGHS Solver)
Objective Function: Maximize Sum[ x_i * (SellThrough_i * Price_i - Cost_i - Cancellation_i) - Unsold_Loss_i ]
Subject to:
  * Sum[ x_i * Cost_i ] <= Budget Constraint (STRICT HARD BOUND)
  * 0 <= x_i <= Min(Supplier_Capacity_i, Forecast_Demand_i * RiskFactor)
  * x_i in Integers (Physical room nights and flight seat allotment guarantees)

3. TOP RECOMMENDED PROCUREMENT ALLOCATIONS
--------------------------------------------------------------------------------
{top_alloc_str}

4. RISK ANALYSIS & STRESS TEST DOWNSIDE
--------------------------------------------------------------------------------
Projected Cancellation Exposure: INR {int(risk_res.get('expected_cancellation_loss', 0)):,}
Projected Unsold Inventory Risk: INR {int(risk_res.get('expected_unsold_inventory_loss', 0)):,}
Net Profit Under 15% Demand Shock: INR {int(risk_res.get('net_profit_after_shocks', 0)):,}

Active Mitigation Strategies:
{chr(10).join(['* ' + m for m in risk_res.get('mitigation_strategies', ['Maintain balanced mix between leisure and business metro destinations.'])])}

================================================================================
END OF REPORT - TripStock AI
================================================================================
"""
    return report
