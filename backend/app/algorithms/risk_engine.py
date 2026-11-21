import numpy as np
from typing import Dict, List, Any

def run_risk_simulation(
    allocations: List[Dict[str, Any]],
    budget: float,
    demand_shock_pct: float = 0.0,
    cancellation_surge_pct: float = 0.0,
    procurement_inflation_pct: float = 0.0,
    selected_destinations: List[str] = None
) -> Dict[str, Any]:
    if not allocations:
        return {
            "overall_risk_score": 35.0,
            "risk_category": "Moderate",
            "financial_exposure": 0.0,
            "expected_cancellation_loss": 0.0,
            "expected_unsold_inventory_loss": 0.0,
            "net_profit_after_shocks": 0.0,
            "var_95": 0.0,
            "high_risk_destinations": [],
            "mitigation_strategies": [],
            "stress_curve": []
        }

    total_exposure = 0.0
    stressed_cancel_loss = 0.0
    stressed_unsold_loss = 0.0
    stressed_revenue = 0.0
    dest_risks = {}

    for item in allocations:
        if selected_destinations and len(selected_destinations) > 0:
            if item["destination"] not in selected_destinations:
                continue

        units = item["recommended_units"]
        base_cost = item["procurement_cost"] * (1.0 + procurement_inflation_pct / 100.0)
        total_item_cost = units * base_cost
        total_exposure += total_item_cost

        # Stressed sell through
        base_st = item["sell_through_pct"] / 100.0
        stressed_st = max(0.15, min(0.99, base_st * (1.0 + demand_shock_pct / 100.0)))
        units_sold = int(round(units * stressed_st))
        unsold_u = max(0, units - units_sold)

        # Stressed cancellation
        base_cancel_rate = 0.12 + (cancellation_surge_pct / 100.0)
        base_cancel_rate = max(0.02, min(0.45, base_cancel_rate))
        cancellations = int(round(units_sold * base_cancel_rate))

        selling_p = item["expected_selling_price"]
        item_rev = units_sold * selling_p
        item_cancel_loss = cancellations * (selling_p * 0.25)
        item_unsold_loss = unsold_u * (base_cost * 0.85)

        stressed_revenue += item_rev
        stressed_cancel_loss += item_cancel_loss
        stressed_unsold_loss += item_unsold_loss

        # Track per destination
        d = item["destination"]
        if d not in dest_risks:
            dest_risks[d] = {"destination": d, "exposure": 0.0, "unsold_units": 0, "cancellations": 0, "risk_score": 0.0}
        dest_risks[d]["exposure"] += total_item_cost
        dest_risks[d]["unsold_units"] += unsold_u
        dest_risks[d]["cancellations"] += cancellations

    stressed_net_profit = stressed_revenue - total_exposure - stressed_cancel_loss - stressed_unsold_loss

    # Risk Score calculation (0-100)
    loss_ratio = (stressed_unsold_loss + stressed_cancel_loss) / max(total_exposure, 1)
    shock_impact = abs(min(0.0, demand_shock_pct)) * 1.2 + max(0.0, cancellation_surge_pct) * 1.5
    raw_risk_score = min(100.0, max(10.0, (loss_ratio * 120.0) + shock_impact + 20.0))

    if raw_risk_score < 40:
        risk_cat = "Low"
    elif raw_risk_score < 65:
        risk_cat = "Moderate"
    elif raw_risk_score < 80:
        risk_cat = "High"
    else:
        risk_cat = "Severe"

    # Parametric Value at Risk (VaR 95%)
    volatility = 0.14 + (abs(demand_shock_pct) / 200.0)
    var_95 = total_exposure * 1.645 * volatility

    # Rank high risk destinations
    high_risk_list = []
    for d, d_val in dest_risks.items():
        d_loss_ratio = (d_val["unsold_units"] * 4000) / max(d_val["exposure"], 1)
        d_score = min(99.0, max(15.0, d_loss_ratio * 100.0 + 30.0))
        d_val["risk_score"] = round(d_score, 1)
        d_val["exposure"] = round(d_val["exposure"], 2)
        high_risk_list.append(d_val)
    high_risk_list.sort(key=lambda x: x["risk_score"], reverse=True)

    # Dynamic Mitigation Strategies
    mitigations = []
    if demand_shock_pct < -5:
        mitigations.append(f"Demand is projected to soften by {abs(demand_shock_pct)}%. Enable dynamic flash sale distribution on TBO partner API to accelerate inventory offloading.")
    if cancellation_surge_pct > 5:
        mitigations.append("Tighten non-refundable fare rules and request 48-hour advance re-allotment swaps with suppliers to curtail cancellation losses.")
    if loss_ratio > 0.20:
        mitigations.append("Unsold risk exceeds 20% threshold: Cap batch size at 60% of forecast and request on-demand consignment replenishment.")
    if len(mitigations) < 3:
        mitigations.append("Implement automated look-to-book alert thresholds: When look-to-book surpasses 35:1 without conversion, trigger dynamic price downshift.")
        mitigations.append("Diversify supplier commitments between hotel bedbanks and direct airline corporate channel allotments to mitigate single-partner default risk.")

    # Generate Stress Test Curve (-30% to +30% demand)
    stress_curve = []
    for d_shift in range(-30, 35, 5):
        s_st = np.clip(0.85 * (1.0 + d_shift / 100.0), 0.2, 0.99)
        s_rev = total_exposure * 1.28 * s_st
        s_unsold = total_exposure * (1.0 - s_st) * 0.75
        s_profit = s_rev - total_exposure - s_unsold - (s_rev * 0.03)
        stress_curve.append({
            "demand_shift_pct": d_shift,
            "projected_profit": round(float(s_profit), 2),
            "projected_unsold_loss": round(float(s_unsold), 2),
            "roi_pct": round(float((s_profit / max(total_exposure, 1)) * 100.0), 1)
        })

    return {
        "overall_risk_score": round(raw_risk_score, 1),
        "risk_category": risk_cat,
        "financial_exposure": round(total_exposure, 2),
        "expected_cancellation_loss": round(stressed_cancel_loss, 2),
        "expected_unsold_inventory_loss": round(stressed_unsold_loss, 2),
        "net_profit_after_shocks": round(stressed_net_profit, 2),
        "var_95": round(var_95, 2),
        "high_risk_destinations": high_risk_list,
        "mitigation_strategies": mitigations,
        "stress_curve": stress_curve
    }

def get_preset_scenarios(base_optimizer_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    allocations = base_optimizer_result.get("allocations", [])
    base_inv = base_optimizer_result.get("total_allocated", 4500000.0)
    base_rev = base_optimizer_result.get("expected_revenue", 5900000.0)
    base_profit = base_optimizer_result.get("expected_profit", 1400000.0)

    scenarios = [
        {
            "scenario_name": "Scenario A: Baseline (Normal Demand)",
            "description": "Historical seasonal demand trend with standard look-to-book and normal cancellation rates.",
            "demand_change_pct": 0.0,
            "cancellation_change_pct": 0.0,
            "cost_change_pct": 0.0,
            "investment": base_inv,
            "revenue": base_rev,
            "net_profit": base_profit,
            "roi_pct": round((base_profit / max(base_inv, 1)) * 100.0, 1),
            "unsold_units": base_optimizer_result.get("expected_unsold_quantity", 42),
            "risk_score": 28.5
        },
        {
            "scenario_name": "Scenario B: Demand Surge (+20%)",
            "description": "High seasonal holiday influx, premium corporate travel rebound, higher conversion velocity.",
            "demand_change_pct": 20.0,
            "cancellation_change_pct": -2.0,
            "cost_change_pct": 0.0,
            "investment": base_inv,
            "revenue": round(base_rev * 1.21, 2),
            "net_profit": round(base_profit * 1.48, 2),
            "roi_pct": round(((base_profit * 1.48) / max(base_inv, 1)) * 100.0, 1),
            "unsold_units": max(5, int(base_optimizer_result.get("expected_unsold_quantity", 42) * 0.3)),
            "risk_score": 15.2
        },
        {
            "scenario_name": "Scenario C: Demand Drop (-15%)",
            "description": "Macroeconomic travel slowdown, adverse monsoon/weather alerts or off-season softening.",
            "demand_change_pct": -15.0,
            "cancellation_change_pct": 4.0,
            "cost_change_pct": 0.0,
            "investment": base_inv,
            "revenue": round(base_rev * 0.82, 2),
            "net_profit": round(base_profit * 0.58, 2),
            "roi_pct": round(((base_profit * 0.58) / max(base_inv, 1)) * 100.0, 1),
            "unsold_units": int(base_optimizer_result.get("expected_unsold_quantity", 42) * 1.9),
            "risk_score": 58.4
        },
        {
            "scenario_name": "Scenario D: Cancellation Surge (+10pp)",
            "description": "Flight rescheduling waves, itinerary changes, flexible policy exploitation.",
            "demand_change_pct": 0.0,
            "cancellation_change_pct": 10.0,
            "cost_change_pct": 0.0,
            "investment": base_inv,
            "revenue": round(base_rev * 0.91, 2),
            "net_profit": round(base_profit * 0.72, 2),
            "roi_pct": round(((base_profit * 0.72) / max(base_inv, 1)) * 100.0, 1),
            "unsold_units": int(base_optimizer_result.get("expected_unsold_quantity", 42) * 1.4),
            "risk_score": 64.0
        },
        {
            "scenario_name": "Scenario E: Procurement Inflation (+8%)",
            "description": "Supplier fuel surcharges, peak-season allotment premium and airline yield increases.",
            "demand_change_pct": 0.0,
            "cancellation_change_pct": 0.0,
            "cost_change_pct": 8.0,
            "investment": round(base_inv * 1.08, 2),
            "revenue": base_rev,
            "net_profit": round(base_profit - (base_inv * 0.08), 2),
            "roi_pct": round(((base_profit - (base_inv * 0.08)) / max(base_inv * 1.08, 1)) * 100.0, 1),
            "unsold_units": base_optimizer_result.get("expected_unsold_quantity", 42),
            "risk_score": 49.0
        }
    ]
    return scenarios
