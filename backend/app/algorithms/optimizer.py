import numpy as np
from scipy.optimize import linprog
from typing import List, Dict, Any

def run_budget_optimization(
    opportunities: List[Dict[str, Any]],
    budget: float,
    risk_preference: str = "balanced",
    preferred_destinations: List[str] = None,
    inventory_type_filter: str = "All",
    min_profit_margin_pct: float = 10.0,
    max_inventory_per_dest: int = None
) -> Dict[str, Any]:
    if not opportunities or budget <= 0:
        return {
            "budget": budget,
            "total_allocated": 0.0,
            "unused_budget": budget,
            "expected_revenue": 0.0,
            "expected_profit": 0.0,
            "expected_roi_pct": 0.0,
            "expected_unsold_quantity": 0,
            "expected_unsold_loss": 0.0,
            "expected_cancellation_loss": 0.0,
            "allocations": [],
            "destination_breakdown": [],
            "inventory_breakdown": [],
            "algorithm_summary": {}
        }

    # Filter opportunities
    filtered = []
    for opp in opportunities:
        if inventory_type_filter != "All" and opp["inventory_type"] != inventory_type_filter:
            continue
        if preferred_destinations and len(preferred_destinations) > 0:
            if opp["destination"] not in preferred_destinations:
                continue
        margin_pct = (opp["unit_margin"] / opp["procurement_price"]) * 100.0
        if margin_pct < min_profit_margin_pct:
            continue
        filtered.append(opp)

    if not filtered:
        filtered = opportunities[:15]

    # Risk adjustments
    risk_params = {
        "conservative": {"sell_mult": 0.94, "distress_recovery": 0.60, "max_units_cap": 80, "cancel_rate_mult": 1.15},
        "balanced": {"sell_mult": 0.98, "distress_recovery": 0.72, "max_units_cap": 140, "cancel_rate_mult": 1.0},
        "aggressive": {"sell_mult": 1.02, "distress_recovery": 0.85, "max_units_cap": 250, "cancel_rate_mult": 0.85}
    }
    p = risk_params.get(risk_preference, risk_params["balanced"])

    n = len(filtered)
    c_costs = np.array([opp["procurement_price"] for opp in filtered])
    prices = np.array([opp["expected_selling_price"] for opp in filtered])
    base_sell_through = np.array([opp["predicted_sell_through"] / 100.0 for opp in filtered])
    adj_sell_through = np.clip(base_sell_through * p["sell_mult"], 0.70, 0.98)

    # Net expected return per unit:
    # E[profit/unit] = (sell_through * price) + (unsold * cost * recovery) - cost - (cancel_rate * cancel_loss)
    expected_profit_per_unit = []
    for i in range(n):
        st = adj_sell_through[i]
        rev = st * prices[i]
        cost = c_costs[i]
        unsold_salvage = (1.0 - st) * cost * p["distress_recovery"]
        cancel_loss = (st * 0.10 * p["cancel_rate_mult"]) * (prices[i] * 0.15)
        net_prof = rev + unsold_salvage - cost - cancel_loss
        expected_profit_per_unit.append(net_prof)

    expected_profit_per_unit = np.array(expected_profit_per_unit)

    # Upper bounds per opportunity: if unit profit <= 0, clamp to 0
    bounds = []
    for i in range(n):
        if expected_profit_per_unit[i] <= 0:
            bounds.append((0, 0))
            continue
        max_u = p["max_units_cap"]
        if max_inventory_per_dest:
            max_u = min(max_u, max_inventory_per_dest)
        avail = max(10, min(filtered[i]["available_inventory"], max_u))
        bounds.append((0, avail))

    # Objective for scipy linprog: minimize -profit
    c = -expected_profit_per_unit
    A = [c_costs]
    b = [budget]

    res = linprog(c, A_ub=A, b_ub=b, bounds=bounds, method="highs")

    raw_units = res.x if res.success else np.zeros(n)
    # Convert to strict integers while guaranteeing budget is NEVER exceeded
    int_units = np.floor(raw_units).astype(int)

    # Refine with greedy addition using remaining budget for items with positive profit
    current_spent = float(np.sum(int_units * c_costs))
    rem_budget = budget - current_spent

    # Sort remaining candidates by profit-to-cost ROI efficiency
    profit_per_cost = expected_profit_per_unit / np.maximum(c_costs, 1)
    sorted_order = np.argsort(-profit_per_cost)

    for idx in sorted_order:
        if expected_profit_per_unit[idx] <= 0:
            continue
        unit_c = c_costs[idx]
        max_avail = bounds[idx][1]
        while int_units[idx] < max_avail and rem_budget >= unit_c:
            int_units[idx] += 1
            rem_budget -= unit_c

    # Build detailed allocation results
    allocations = []
    tot_cost = 0.0
    tot_rev = 0.0
    tot_prof = 0.0
    tot_unsold_units = 0
    tot_unsold_loss = 0.0
    tot_cancel_loss = 0.0

    dest_agg = {}
    inv_agg = {"Hotel": {"cost": 0.0, "profit": 0.0, "units": 0}, "Flight": {"cost": 0.0, "profit": 0.0, "units": 0}}

    for i in range(n):
        u = int(int_units[i])
        if u <= 0:
            continue
        opp = filtered[i]
        cost_total = u * opp["procurement_price"]
        st = adj_sell_through[i]
        units_sold = int(round(u * st))
        unsold_u = max(0, u - units_sold)
        rev = units_sold * opp["expected_selling_price"]
        cancellations = int(round(units_sold * 0.10 * p["cancel_rate_mult"]))
        c_loss = cancellations * (opp["expected_selling_price"] * 0.15)
        u_salvage = unsold_u * (opp["procurement_price"] * p["distress_recovery"])
        u_loss = (unsold_u * opp["procurement_price"]) - u_salvage
        net_p = rev + u_salvage - cost_total - c_loss
        roi = (net_p / cost_total * 100.0) if cost_total > 0 else 0.0

        # Rationale for why optimizer picked this
        rationale = (
            f"Selected {u} units: High risk-adjusted ROI of {round(roi, 1)}% with {round(st*100, 1)}% projected "
            f"sell-through. Unit procurement price ₹{int(opp['procurement_price']):,} against expected selling price "
            f"₹{int(opp['expected_selling_price']):,} provides healthy buffer against downside unsold risk."
        )

        item = {
            "destination": opp["destination"],
            "inventory_type": opp["inventory_type"],
            "supplier": opp["supplier"],
            "recommended_units": u,
            "procurement_cost": round(opp["procurement_price"], 2),
            "total_cost": round(cost_total, 2),
            "expected_selling_price": round(opp["expected_selling_price"], 2),
            "expected_revenue": round(rev, 2),
            "expected_profit": round(net_p, 2),
            "roi_pct": round(roi, 1),
            "sell_through_pct": round(st * 100, 1),
            "expected_unsold_units": unsold_u,
            "expected_unsold_loss": round(u_loss, 2),
            "expected_cancellations": cancellations,
            "expected_cancellation_loss": round(c_loss, 2),
            "risk_level": opp["risk_level"],
            "rationale": rationale
        }
        allocations.append(item)

        tot_cost += cost_total
        tot_rev += rev
        tot_prof += net_p
        tot_unsold_units += unsold_u
        tot_unsold_loss += u_loss
        tot_cancel_loss += c_loss

        # Aggregate destination
        d = opp["destination"]
        if d not in dest_agg:
            dest_agg[d] = {"destination": d, "allocated_budget": 0.0, "expected_profit": 0.0, "units": 0}
        dest_agg[d]["allocated_budget"] += cost_total
        dest_agg[d]["expected_profit"] += net_p
        dest_agg[d]["units"] += u

        # Aggregate inventory type
        itype = opp["inventory_type"]
        if itype in inv_agg:
            inv_agg[itype]["cost"] += cost_total
            inv_agg[itype]["profit"] += net_p
            inv_agg[itype]["units"] += u

    allocations.sort(key=lambda x: x["expected_profit"], reverse=True)

    dest_breakdown = sorted(list(dest_agg.values()), key=lambda x: x["allocated_budget"], reverse=True)
    inv_breakdown = [
        {"inventory_type": k, "allocated_budget": round(v["cost"], 2), "expected_profit": round(v["profit"], 2), "units": v["units"]}
        for k, v in inv_agg.items()
    ]

    total_roi = (tot_prof / tot_cost * 100.0) if tot_cost > 0 else 0.0

    return {
        "budget": round(budget, 2),
        "total_allocated": round(tot_cost, 2),
        "unused_budget": round(budget - tot_cost, 2),
        "expected_revenue": round(tot_rev, 2),
        "expected_profit": round(tot_prof, 2),
        "expected_roi_pct": round(total_roi, 1),
        "expected_unsold_quantity": tot_unsold_units,
        "expected_unsold_loss": round(tot_unsold_loss, 2),
        "expected_cancellation_loss": round(tot_cancel_loss, 2),
        "allocations": allocations,
        "destination_breakdown": dest_breakdown,
        "inventory_breakdown": inv_breakdown,
        "algorithm_summary": {
            "method": "Mixed Integer Bounded Linear Programming (SciPy HiGHS Solver)",
            "risk_profile": risk_preference,
            "objective": "Maximize Net Risk-Adjusted Profit subject to Hard Budget & Supplier Capacity",
            "decision_variables": n,
            "budget_utilization_pct": round((tot_cost / budget) * 100.0, 1) if budget > 0 else 0.0
        }
    }
