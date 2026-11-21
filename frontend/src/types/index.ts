export interface User {
  name: string;
  role: string;
  email: string;
  organization: string;
}

export interface DashboardSummary {
  kpis: {
    available_budget: number;
    recommended_investment: number;
    expected_demand_growth: string;
    predicted_booking_volume: number;
    expected_gross_profit: number;
    expected_net_profit: number;
    inventory_utilization: string;
    unsold_inventory_risk: string;
  };
  demand_trend: Array<{
    date: string;
    bookings: number;
    searches: number;
  }>;
  destination_demand: Array<{
    destination: string;
    total_bookings: number;
    avg_price: number;
    seasonality: number;
  }>;
  image_signature_metrics: {
    revpar_lift: string;
    forecast_accuracy_72h: string;
    accuracy_baseline: string;
    inventory_rebalances_24h: number;
    unsold_recovery_pct: number;
    unsold_recovery_value: string;
    distressed_breakdown: {
      hotels: number;
      airlines: number;
      otas: number;
    };
    fare_elasticity_curve: Array<{
      price_pct: string;
      demand_units: number;
      rev_factor: number;
      optimal?: boolean;
    }>;
    occupancy_heatmap: Array<{
      row: string;
      cells: number[];
    }>;
  };
  live_signal_feed: {
    timestamp: string;
    active_monitors: number;
    signals_processed_sec: number;
    status: string;
  };
}

export interface ForecastPoint {
  date: string;
  actual_bookings?: number | null;
  predicted_bookings: number;
  lower_bound: number;
  upper_bound: number;
  searches: number;
  sold_out_risk: number;
}

export interface ForecastResponse {
  destination: string;
  inventory_type: string;
  model_used: string;
  mae: number;
  rmse: number;
  mape: number;
  growth_pct: number;
  points: ForecastPoint[];
  key_drivers: Array<{
    name: string;
    importance_pct: number;
    impact: string;
  }>;
  model_comparison: Record<string, { mae: number; rmse: number; mape: number }>;
}

export interface OpportunityItem {
  id: string;
  destination: string;
  inventory_type: string;
  supplier: string;
  travel_period: string;
  forecast_demand: number;
  available_inventory: number;
  predicted_sell_through: number;
  procurement_price: number;
  expected_selling_price: number;
  unit_margin: number;
  estimated_profit: number;
  risk_level: "Low" | "Medium" | "High";
  opportunity_score: number;
  rationale: string;
}

export interface AllocationItem {
  destination: string;
  inventory_type: string;
  supplier: string;
  recommended_units: number;
  procurement_cost: number;
  total_cost: number;
  expected_selling_price: number;
  expected_revenue: number;
  expected_profit: number;
  roi_pct: number;
  sell_through_pct: number;
  expected_unsold_units: number;
  expected_unsold_loss: number;
  expected_cancellations: number;
  expected_cancellation_loss: number;
  risk_level: string;
  rationale: string;
}

export interface OptimizationResult {
  budget: number;
  total_allocated: number;
  unused_budget: number;
  expected_revenue: number;
  expected_profit: number;
  expected_roi_pct: number;
  expected_unsold_quantity: number;
  expected_unsold_loss: number;
  expected_cancellation_loss: number;
  allocations: AllocationItem[];
  destination_breakdown: Array<{
    destination: string;
    allocated_budget: number;
    expected_profit: number;
    units: number;
  }>;
  inventory_breakdown: Array<{
    inventory_type: string;
    allocated_budget: number;
    expected_profit: number;
    units: number;
  }>;
  algorithm_summary: {
    method: string;
    risk_profile: string;
    objective: string;
    decision_variables: number;
    budget_utilization_pct: number;
  };
}

export interface RiskSimulationResult {
  overall_risk_score: number;
  risk_category: string;
  financial_exposure: number;
  expected_cancellation_loss: number;
  expected_unsold_inventory_loss: number;
  net_profit_after_shocks: number;
  var_95: number;
  high_risk_destinations: Array<{
    destination: string;
    exposure: number;
    unsold_units: number;
    cancellations: number;
    risk_score: number;
  }>;
  mitigation_strategies: string[];
  stress_curve: Array<{
    demand_shift_pct: number;
    projected_profit: number;
    projected_unsold_loss: number;
    roi_pct: number;
  }>;
}

export interface ScenarioComparisonItem {
  scenario_name: string;
  description: string;
  demand_change_pct: number;
  cancellation_change_pct: number;
  cost_change_pct: number;
  investment: number;
  revenue: number;
  net_profit: number;
  roi_pct: number;
  unsold_units: number;
  risk_score: number;
}

export interface SupplierItem {
  id: number;
  name: string;
  supplier_type: string;
  destinations: string;
  procurement_price_avg: number;
  available_capacity: number;
  reliability_score: number;
  cancellation_conditions: string;
  status: string;
  contact_email: string;
}
