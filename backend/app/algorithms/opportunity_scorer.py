from typing import List, Dict, Any

def score_inventory_opportunities(records_summary: List[Dict[str, Any]], suppliers_map: Dict[str, Any]) -> List[Dict[str, Any]]:
    opportunities = []

    for item in records_summary:
        dest = item["destination"]
        inv_type = item["inventory_type"]
        supplier_name = item.get("supplier_name", "Allotment Partner")
        procurement_p = float(item["procurement_price"])
        selling_p = float(item["selling_price"])
        avg_demand = float(item["avg_bookings"])
        available_inv = max(int(item["avg_available_inventory"]), 1)
        sold_out_freq = float(item.get("sold_out_freq", 0.15))
        cancellation_rate = float(item.get("cancellation_rate", 0.12))

        supplier = suppliers_map.get(supplier_name, {})
        supplier_rel = float(supplier.get("reliability_score", 95.0)) / 100.0

        # Margin
        unit_margin = max(selling_p - procurement_p, 100.0)
        margin_pct = (unit_margin / procurement_p) * 100.0

        # Targeted procurement sell-through projection (typically 84% - 96% for targeted batches)
        demand_supply_ratio = avg_demand / available_inv
        sell_through_est = min(96.5, max(82.0, 88.0 + (demand_supply_ratio - 1.0) * 18.0 + (sold_out_freq * 25.0)))

        # Multi-factor Opportunity Score (0 - 100)
        # Weights: Margin (25%), Sell-through (30%), Sold-out risk/undersupply (20%), Supplier reliability (15%), Cancellation penalty (-10%)
        margin_score = min(100.0, (margin_pct / 30.0) * 100.0)
        demand_score = min(100.0, (avg_demand / 400.0) * 100.0)
        undersupply_score = min(100.0, sold_out_freq * 200.0)
        rel_score = supplier_rel * 100.0
        cancellation_penalty = cancellation_rate * 50.0

        raw_score = (
            margin_score * 0.25 +
            sell_through_est * 0.30 +
            undersupply_score * 0.20 +
            rel_score * 0.15 +
            demand_score * 0.10 -
            cancellation_penalty
        )
        opp_score = round(max(10.0, min(99.0, raw_score)), 1)

        # Risk Classification
        if opp_score >= 80 and cancellation_rate < 0.15:
            risk_level = "Low"
        elif opp_score >= 65 and cancellation_rate < 0.22:
            risk_level = "Medium"
        else:
            risk_level = "High"

        # Estimated profit on full typical lot (50 units)
        sample_lot = 50
        est_sold = int(sample_lot * (sell_through_est / 100.0))
        est_rev = est_sold * selling_p
        est_cost = sample_lot * procurement_p
        cancellation_loss = int(est_sold * cancellation_rate) * (selling_p * 0.20)
        unsold_salvage = (sample_lot - est_sold) * (procurement_p * 0.65) # 65% distressed recovery
        est_profit = round(est_rev + unsold_salvage - est_cost - cancellation_loss, 2)

        # Explainable Rationale
        rationale = (
            f"{dest} {inv_type.lower()} shows robust demand ({int(avg_demand)} units/day) with {round(sell_through_est, 1)}% projected "
            f"sell-through and ₹{int(unit_margin):,} unit margin ({round(margin_pct, 1)}% markup). "
            f"Supplier '{supplier_name}' provides {round(supplier_rel*100, 1)}% reliability score, minimizing stockout and fulfillment risk."
        )

        opportunities.append({
            "id": f"OPP-{dest[:3].upper()}-{inv_type[:1]}-{abs(hash(supplier_name)) % 1000}",
            "destination": dest,
            "inventory_type": inv_type,
            "supplier": supplier_name,
            "travel_period": "Next 30 Days (Immediate Peak)",
            "forecast_demand": int(avg_demand * 30),
            "available_inventory": int(available_inv * 15),
            "predicted_sell_through": round(sell_through_est, 1),
            "procurement_price": round(procurement_p, 2),
            "expected_selling_price": round(selling_p, 2),
            "unit_margin": round(unit_margin, 2),
            "estimated_profit": est_profit,
            "risk_level": risk_level,
            "opportunity_score": opp_score,
            "rationale": rationale
        })

    opportunities.sort(key=lambda x: x["opportunity_score"], reverse=True)
    return opportunities
