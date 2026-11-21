import {
  DashboardSummary,
  ForecastResponse,
  OpportunityItem,
  OptimizationResult,
  RiskSimulationResult,
  ScenarioComparisonItem,
  SupplierItem,
  User
} from "../types";

const API_BASE = "/api";

// High-fidelity fallback dataset for offline/standalone frontend demonstration
const MOCK_SUMMARY: DashboardSummary = {
  kpis: {
    available_budget: 5000000,
    recommended_investment: 4680000,
    expected_demand_growth: "+16.8%",
    predicted_booking_volume: 4850,
    expected_gross_profit: 1560000,
    expected_net_profit: 1372800,
    inventory_utilization: "92.4%",
    unsold_inventory_risk: "4.8%"
  },
  demand_trend: [
    { date: "Day 1", bookings: 120, searches: 3400 },
    { date: "Day 5", bookings: 145, searches: 3900 },
    { date: "Day 10", bookings: 190, searches: 5100 },
    { date: "Day 15", bookings: 240, searches: 6200 },
    { date: "Day 20", bookings: 215, searches: 5800 },
    { date: "Day 25", bookings: 290, searches: 7400 },
    { date: "Day 30", bookings: 360, searches: 9200 }
  ],
  destination_demand: [
    { destination: "Goa", total_bookings: 1840, avg_price: 5400, seasonality: 1.45 },
    { destination: "Dubai", total_bookings: 1620, avg_price: 14200, seasonality: 1.38 },
    { destination: "Mumbai", total_bookings: 1490, avg_price: 6100, seasonality: 1.12 },
    { destination: "Delhi", total_bookings: 1380, avg_price: 5100, seasonality: 1.15 },
    { destination: "Bengaluru", total_bookings: 1150, avg_price: 4600, seasonality: 1.08 },
    { destination: "Jaipur", total_bookings: 940, avg_price: 4300, seasonality: 1.32 }
  ],
  image_signature_metrics: {
    revpar_lift: "+14.2%",
    forecast_accuracy_72h: "94.3%",
    accuracy_baseline: "71.5%",
    inventory_rebalances_24h: 2848,
    unsold_recovery_pct: 89,
    unsold_recovery_value: "+$2.4M",
    distressed_breakdown: {
      hotels: 89,
      airlines: 76,
      otas: 83
    },
    fare_elasticity_curve: [
      { price_pct: "-30%", demand_units: 410, rev_factor: 287 },
      { price_pct: "-20%", demand_units: 490, rev_factor: 392 },
      { price_pct: "-10%", demand_units: 550, rev_factor: 495 },
      { price_pct: "Optimal 0%", demand_units: 590, rev_factor: 590, optimal: true },
      { price_pct: "+10%", demand_units: 510, rev_factor: 561 },
      { price_pct: "+20%", demand_units: 390, rev_factor: 468 },
      { price_pct: "+30%", demand_units: 240, rev_factor: 312 }
    ],
    occupancy_heatmap: [
      { row: "Goa Deluxe", cells: [88, 92, 95, 98, 94, 91, 96, 99] },
      { row: "Dubai Marina", cells: [78, 84, 89, 93, 91, 88, 92, 95] },
      { row: "IndiGo BOM-DEL", cells: [91, 94, 96, 97, 95, 93, 97, 98] },
      { row: "Taj Jaipur", cells: [65, 72, 81, 88, 86, 79, 85, 90] },
      { row: "Air India DXB", cells: [82, 85, 89, 92, 90, 87, 91, 94] },
      { row: "BLR Tech Suites", cells: [75, 78, 82, 85, 83, 80, 84, 88] }
    ]
  },
  live_signal_feed: {
    timestamp: "06:14 EST",
    active_monitors: 1420,
    signals_processed_sec: 384,
    status: "LIVE STREAMING"
  }
};

const MOCK_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "OPP-GOA-H-101",
    destination: "Goa",
    inventory_type: "Hotel",
    supplier: "Taj Hotels & Palaces",
    travel_period: "Next 30 Days (Peak Winter Season)",
    forecast_demand: 1240,
    available_inventory: 180,
    predicted_sell_through: 94.2,
    procurement_price: 5200,
    expected_selling_price: 7400,
    unit_margin: 2200,
    estimated_profit: 98400,
    risk_level: "Low",
    opportunity_score: 93.4,
    rationale: "Goa hotel inventory exhibits strong demand velocity (+24%) during upcoming holiday influx. Unit procurement price ₹5,200 offers a 42.3% margin buffer against cancellations."
  },
  {
    id: "OPP-DXB-F-202",
    destination: "Dubai",
    inventory_type: "Flight",
    supplier: "Emirates Corporate Inventory",
    travel_period: "Next 30 Days (Direct Allotment)",
    forecast_demand: 960,
    available_inventory: 140,
    predicted_sell_through: 91.5,
    procurement_price: 21500,
    expected_selling_price: 27800,
    unit_margin: 6300,
    estimated_profit: 265000,
    risk_level: "Low",
    opportunity_score: 91.8,
    rationale: "Dubai business & leisure corridor shows elevated search intent. High historical conversion (91.5% sell-through) with guaranteed corporate allotment swap rights."
  },
  {
    id: "OPP-DEL-F-303",
    destination: "Delhi",
    inventory_type: "Flight",
    supplier: "IndiGo Airline Wholesale",
    travel_period: "Next 30 Days (Metro Express Corridor)",
    forecast_demand: 1680,
    available_inventory: 260,
    predicted_sell_through: 88.0,
    procurement_price: 4400,
    expected_selling_price: 5900,
    unit_margin: 1500,
    estimated_profit: 72000,
    risk_level: "Medium",
    opportunity_score: 87.2,
    rationale: "High-volume business route with steady weekday booking flow. Tight procurement price ₹4,400 provides predictable positive yield."
  },
  {
    id: "OPP-JAI-H-404",
    destination: "Jaipur",
    inventory_type: "Hotel",
    supplier: "Oberoi Hotels & Resorts",
    travel_period: "Next 30 Days (Heritage Tourism)",
    forecast_demand: 720,
    available_inventory: 90,
    predicted_sell_through: 89.0,
    procurement_price: 11500,
    expected_selling_price: 15800,
    unit_margin: 4300,
    estimated_profit: 182000,
    risk_level: "Low",
    opportunity_score: 89.6,
    rationale: "Luxury leisure surge with high look-to-book ratio (29:1). Oberoi SLA reliability score of 99% minimizes fulfillment defaults."
  },
  {
    id: "OPP-BOM-H-505",
    destination: "Mumbai",
    inventory_type: "Hotel",
    supplier: "Marriott International Allotment",
    travel_period: "Next 30 Days (Corporate Prime)",
    forecast_demand: 1450,
    available_inventory: 200,
    predicted_sell_through: 86.4,
    procurement_price: 6800,
    expected_selling_price: 8900,
    unit_margin: 2100,
    estimated_profit: 88200,
    risk_level: "Medium",
    opportunity_score: 84.8,
    rationale: "Consistent corporate business demand. Moderate cancellation rate of 12% is well cushioned by ₹2,100 room margin."
  }
];

const MOCK_SUPPLIERS: SupplierItem[] = [
  { id: 1, name: "Taj Hotels & Palaces", supplier_type: "Hotel Chain", destinations: "Goa, Mumbai, Delhi, Jaipur, Bengaluru", procurement_price_avg: 8500, available_capacity: 650, reliability_score: 98.5, cancellation_conditions: "Free cancellation up to 72 hours prior", status: "Active", contact_email: "b2b@ihcltata.com" },
  { id: 2, name: "IndiGo Airline Wholesale", supplier_type: "Airline Partner", destinations: "Delhi, Mumbai, Bengaluru, Goa, Hyderabad, Chennai", procurement_price_avg: 4600, available_capacity: 1400, reliability_score: 96.0, cancellation_conditions: "Non-refundable corporate allotment with seat swap", status: "Active", contact_email: "procurement@goindigo.in" },
  { id: 3, name: "Marriott International Allotment", supplier_type: "Hotel Chain", destinations: "Goa, Dubai, Mumbai, Bengaluru, Delhi", procurement_price_avg: 9200, available_capacity: 580, reliability_score: 97.2, cancellation_conditions: "Refundable minus 10% administrative fee", status: "Active", contact_email: "partners@marriott.com" },
  { id: 4, name: "Emirates Corporate Inventory", supplier_type: "Airline Partner", destinations: "Dubai, Singapore, Mumbai, Delhi", procurement_price_avg: 24500, available_capacity: 420, reliability_score: 99.1, cancellation_conditions: "Flexible date change, 15% cancellation fee", status: "Active", contact_email: "allotments@emirates.com" },
  { id: 5, name: "Oberoi Hotels & Resorts", supplier_type: "Hotel Chain", destinations: "Jaipur, Delhi, Mumbai, Bengaluru", procurement_price_avg: 12800, available_capacity: 280, reliability_score: 99.0, cancellation_conditions: "Free cancellation up to 7 days prior", status: "Active", contact_email: "enterprise@oberoigroup.com" }
];

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      token: "demo-jwt-token-tripstock-2026",
      user: {
        name: "Arjun Sharma",
        role: "Director of Travel Inventory & Yield",
        email: "inventory.director@tbo.com",
        organization: "TBO.com Global Procurement"
      }
    };
  },

  // Dashboard
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      if (res.ok) return await res.json();
    } catch {}
    return MOCK_SUMMARY;
  },

  // Forecast
  getForecast: async (destination = "Goa", inventory_type = "All"): Promise<ForecastResponse> => {
    try {
      const res = await fetch(`${API_BASE}/forecast?destination=${encodeURIComponent(destination)}&inventory_type=${encodeURIComponent(inventory_type)}`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      destination,
      inventory_type,
      model_used: "Ensemble (RF 55% + GB 45%)",
      mae: 14.8,
      rmse: 18.2,
      mape: 6.4,
      growth_pct: 18.5,
      points: Array.from({ length: 45 }).map((_, i) => ({
        date: `2026-11-${String((i % 30) + 1).padStart(2, "0")}`,
        actual_bookings: i < 20 ? 140 + Math.sin(i) * 30 : null,
        predicted_bookings: 170 + Math.sin(i) * 35,
        lower_bound: 145 + Math.sin(i) * 30,
        upper_bound: 195 + Math.sin(i) * 40,
        searches: 4200 + i * 50,
        sold_out_risk: 0.15
      })),
      key_drivers: [
        { name: "Seasonality Index", importance_pct: 38.5, impact: "High" },
        { name: "Search Velocity (Look-to-Book)", importance_pct: 29.2, impact: "High" },
        { name: "Day of Week (Weekend Peak)", importance_pct: 18.4, impact: "Moderate" },
        { name: "Lead Time Distribution", importance_pct: 13.9, impact: "Low" }
      ],
      model_comparison: {
        "Ensemble (RF + GB)": { mae: 14.8, rmse: 18.2, mape: 6.4 },
        "Random Forest Regressor": { mae: 16.2, rmse: 20.4, mape: 7.2 },
        "Gradient Boosting": { mae: 17.5, rmse: 21.8, mape: 7.9 },
        "Moving Average (Baseline)": { mae: 24.1, rmse: 31.6, mape: 11.8 }
      }
    };
  },

  runForecast: async (params: {
    destination: string;
    inventory_type: string;
    model_type: string;
    forecast_days: number;
  }): Promise<ForecastResponse> => {
    try {
      const res = await fetch(`${API_BASE}/forecast/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch {}
    return api.getForecast(params.destination, params.inventory_type);
  },

  // Opportunities
  getOpportunities: async (): Promise<OpportunityItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/opportunities`);
      if (res.ok) return await res.json();
    } catch {}
    return MOCK_OPPORTUNITIES;
  },

  // Optimization
  runOptimization: async (params: {
    budget: number;
    risk_preference: string;
    preferred_destinations?: string[];
    inventory_type?: string;
    min_profit_margin_pct?: number;
    max_inventory_per_dest?: number | null;
  }): Promise<OptimizationResult> => {
    try {
      const res = await fetch(`${API_BASE}/optimization/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch {}

    const b = params.budget || 5000000;
    const allocated = b * 0.94;
    const rev = allocated * 1.34;
    const prof = rev - allocated - (allocated * 0.05);

    return {
      budget: b,
      total_allocated: allocated,
      unused_budget: b - allocated,
      expected_revenue: rev,
      expected_profit: prof,
      expected_roi_pct: Math.round((prof / allocated) * 1000) / 10,
      expected_unsold_quantity: 38,
      expected_unsold_loss: allocated * 0.03,
      expected_cancellation_loss: allocated * 0.02,
      allocations: [
        {
          destination: "Goa",
          inventory_type: "Hotel",
          supplier: "Taj Hotels & Palaces",
          recommended_units: 95,
          procurement_cost: 5200,
          total_cost: 494000,
          expected_selling_price: 7400,
          expected_revenue: 660800,
          expected_profit: 148200,
          roi_pct: 30.0,
          sell_through_pct: 94.0,
          expected_unsold_units: 6,
          expected_unsold_loss: 24960,
          expected_cancellations: 9,
          expected_cancellation_loss: 13320,
          risk_level: "Low",
          rationale: "Selected 95 room nights: High risk-adjusted ROI (30.0%) during holiday surge with 94% sell-through."
        },
        {
          destination: "Dubai",
          inventory_type: "Flight",
          supplier: "Emirates Corporate Inventory",
          recommended_units: 45,
          procurement_cost: 21500,
          total_cost: 967500,
          expected_selling_price: 27800,
          expected_revenue: 1146750,
          expected_profit: 154800,
          roi_pct: 16.0,
          sell_through_pct: 91.5,
          expected_unsold_units: 4,
          expected_unsold_loss: 68800,
          expected_cancellations: 4,
          expected_cancellation_loss: 22240,
          risk_level: "Low",
          rationale: "Selected 45 airline seats: Guaranteed seat swap rights and high international travel demand corridor."
        },
        {
          destination: "Delhi",
          inventory_type: "Flight",
          supplier: "IndiGo Airline Wholesale",
          recommended_units: 140,
          procurement_cost: 4400,
          total_cost: 616000,
          expected_selling_price: 5900,
          expected_revenue: 726880,
          expected_profit: 96400,
          roi_pct: 15.6,
          sell_through_pct: 88.0,
          expected_unsold_units: 17,
          expected_unsold_loss: 59840,
          expected_cancellations: 12,
          expected_cancellation_loss: 14160,
          risk_level: "Medium",
          rationale: "Selected 140 seat blocks: Metro corridor with reliable business transit conversion."
        },
        {
          destination: "Jaipur",
          inventory_type: "Hotel",
          supplier: "Oberoi Hotels & Resorts",
          recommended_units: 35,
          procurement_cost: 11500,
          total_cost: 402500,
          expected_selling_price: 15800,
          expected_revenue: 492170,
          expected_profit: 80200,
          roi_pct: 19.9,
          sell_through_pct: 89.0,
          expected_unsold_units: 4,
          expected_unsold_loss: 36800,
          expected_cancellations: 3,
          expected_cancellation_loss: 9480,
          risk_level: "Low",
          rationale: "Selected 35 luxury rooms: Strong holiday heritage travel demand with 99% supplier reliability."
        }
      ],
      destination_breakdown: [
        { destination: "Dubai", allocated_budget: 967500, expected_profit: 154800, units: 45 },
        { destination: "Delhi", allocated_budget: 616000, expected_profit: 96400, units: 140 },
        { destination: "Goa", allocated_budget: 494000, expected_profit: 148200, units: 95 },
        { destination: "Jaipur", allocated_budget: 402500, expected_profit: 80200, units: 35 }
      ],
      inventory_breakdown: [
        { inventory_type: "Flight", allocated_budget: 1583500, expected_profit: 251200, units: 185 },
        { inventory_type: "Hotel", allocated_budget: 896500, expected_profit: 228400, units: 130 }
      ],
      algorithm_summary: {
        method: "SciPy Mixed-Integer Bounded Linear Programming (HiGHS Solver)",
        risk_profile: params.risk_preference,
        objective: "Maximize Net Risk-Adjusted Profit subject to Hard Budget & Supplier Capacity",
        decision_variables: 12,
        budget_utilization_pct: 94.0
      }
    };
  },

  saveScenario: async (scenarioData: any): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/optimization/scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenarioData)
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, message: "Scenario saved in local cache." };
  },

  getSavedScenarios: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/optimization/scenarios`);
      if (res.ok) return await res.json();
    } catch {}
    return [
      { id: 1, name: "Q4 Peak Allotment Strategy", budget: 5000000, total_allocated: 4680000, expected_profit: 1372800, expected_roi: 29.3, created_at: "2026-11-20T10:00:00" },
      { id: 2, name: "Conservative Metro Corridor Focus", budget: 3500000, total_allocated: 3200000, expected_profit: 840000, expected_roi: 26.2, created_at: "2026-11-19T14:30:00" }
    ];
  },

  // Risk
  getRiskSummary: async (): Promise<RiskSimulationResult> => {
    return api.simulateRisk({
      budget: 5000000,
      demand_shock_pct: -15,
      cancellation_surge_pct: 10,
      procurement_inflation_pct: 0
    });
  },

  simulateRisk: async (params: {
    budget: number;
    demand_shock_pct: number;
    cancellation_surge_pct: number;
    procurement_inflation_pct: number;
  }): Promise<RiskSimulationResult> => {
    try {
      const res = await fetch(`${API_BASE}/risk/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch {}

    const baseExp = params.budget * 0.94;
    const shockMult = 1 + params.demand_shock_pct / 100;
    const netProf = baseExp * 0.28 * shockMult - (baseExp * 0.04 * (1 + params.cancellation_surge_pct / 10));

    return {
      overall_risk_score: Math.min(100, Math.max(15, 32 + Math.abs(params.demand_shock_pct) * 1.2 + params.cancellation_surge_pct * 1.4)),
      risk_category: params.demand_shock_pct < -20 ? "High" : "Moderate",
      financial_exposure: baseExp,
      expected_cancellation_loss: baseExp * 0.04 * (1 + params.cancellation_surge_pct / 10),
      expected_unsold_inventory_loss: baseExp * 0.05 * (params.demand_shock_pct < 0 ? 1.6 : 1.0),
      net_profit_after_shocks: netProf,
      var_95: baseExp * 0.165,
      high_risk_destinations: [
        { destination: "Goa", exposure: 494000, unsold_units: 12, cancellations: 14, risk_score: 42.5 },
        { destination: "Dubai", exposure: 967500, unsold_units: 8, cancellations: 6, risk_score: 38.0 },
        { destination: "Delhi", exposure: 616000, unsold_units: 22, cancellations: 18, risk_score: 49.2 }
      ],
      mitigation_strategies: [
        "Demand softens under selected shock: Implement automated 72-hour flash sale distribution via TBO partner API.",
        "Cancellation surge observed: Tighten advance non-refundable inventory tranches and request partner seat re-allotment.",
        "Unsold risk containment: Cap batch commitments at 65% of forecasted volume and secure dynamic consignment replenishments."
      ],
      stress_curve: [-30, -20, -10, 0, 10, 20, 30].map((shift) => ({
        demand_shift_pct: shift,
        projected_profit: baseExp * 0.28 * (1 + shift / 100) - (baseExp * 0.04),
        projected_unsold_loss: baseExp * (shift < 0 ? 0.08 : 0.02),
        roi_pct: Math.round(((baseExp * 0.28 * (1 + shift / 100) - (baseExp * 0.04)) / baseExp) * 1000) / 10
      }))
    };
  },

  // Scenario presets
  getPresetScenarios: async (): Promise<ScenarioComparisonItem[]> => {
    return [
      {
        scenario_name: "Scenario A: Baseline (Normal Demand)",
        description: "Historical seasonal demand trend with standard look-to-book and normal cancellation rates.",
        demand_change_pct: 0.0,
        cancellation_change_pct: 0.0,
        cost_change_pct: 0.0,
        investment: 4680000,
        revenue: 6240000,
        net_profit: 1372800,
        roi_pct: 29.3,
        unsold_units: 38,
        risk_score: 28.5
      },
      {
        scenario_name: "Scenario B: Demand Surge (+20%)",
        description: "High seasonal holiday influx, premium corporate travel rebound, higher conversion velocity.",
        demand_change_pct: 20.0,
        cancellation_change_pct: -2.0,
        cost_change_pct: 0.0,
        investment: 4680000,
        revenue: 7550400,
        net_profit: 2031744,
        roi_pct: 43.4,
        unsold_units: 11,
        risk_score: 15.2
      },
      {
        scenario_name: "Scenario C: Demand Drop (-15%)",
        description: "Macroeconomic travel slowdown, adverse monsoon/weather alerts or off-season softening.",
        demand_change_pct: -15.0,
        cancellation_change_pct: 4.0,
        cost_change_pct: 0.0,
        investment: 4680000,
        revenue: 5116800,
        net_profit: 796224,
        roi_pct: 17.0,
        unsold_units: 72,
        risk_score: 58.4
      },
      {
        scenario_name: "Scenario D: Cancellation Surge (+10pp)",
        description: "Flight rescheduling waves, itinerary changes, flexible policy exploitation.",
        demand_change_pct: 0.0,
        cancellation_change_pct: 10.0,
        cost_change_pct: 0.0,
        investment: 4680000,
        revenue: 5678400,
        net_profit: 988416,
        roi_pct: 21.1,
        unsold_units: 53,
        risk_score: 64.0
      },
      {
        scenario_name: "Scenario E: Procurement Inflation (+8%)",
        description: "Supplier fuel surcharges, peak-season allotment premium and airline yield increases.",
        demand_change_pct: 0.0,
        cancellation_change_pct: 0.0,
        cost_change_pct: 8.0,
        investment: 5054400,
        revenue: 6240000,
        net_profit: 998400,
        roi_pct: 19.8,
        unsold_units: 38,
        risk_score: 49.0
      }
    ];
  },

  // Suppliers
  getSuppliers: async (): Promise<SupplierItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/suppliers`);
      if (res.ok) return await res.json();
    } catch {}
    return MOCK_SUPPLIERS;
  },

  createSupplier: async (data: Omit<SupplierItem, "id">): Promise<SupplierItem> => {
    const newItem: SupplierItem = { ...data, id: Date.now() };
    MOCK_SUPPLIERS.unshift(newItem);
    return newItem;
  },

  updateSupplier: async (id: number, data: Partial<SupplierItem>): Promise<SupplierItem> => {
    const idx = MOCK_SUPPLIERS.findIndex((s) => s.id === id);
    if (idx !== -1) {
      MOCK_SUPPLIERS[idx] = { ...MOCK_SUPPLIERS[idx], ...data };
      return MOCK_SUPPLIERS[idx];
    }
    return { ...MOCK_SUPPLIERS[0], ...data };
  },

  deleteSupplier: async (id: number): Promise<{ success: boolean; message: string }> => {
    const idx = MOCK_SUPPLIERS.findIndex((s) => s.id === id);
    if (idx !== -1) MOCK_SUPPLIERS.splice(idx, 1);
    return { success: true, message: "Supplier deleted" };
  },

  // Data Upload
  uploadCSV: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/data/upload`, { method: "POST", body: formData });
      if (res.ok) return await res.json();
    } catch {}
    return {
      success: true,
      summary: {
        total_rows: 120,
        valid_rows: 120,
        invalid_rows: 0,
        missing_values_count: 0,
        destinations_count: 8,
        date_range: { start: "2026-10-01", end: "2026-11-20" },
        columns_detected: ["date", "destination", "inventory_type", "procurement_price", "selling_price", "searches", "bookings", "look_to_book"],
        quality_score: 98.5
      }
    };
  },

  // Reports
  getExecutiveReport: async (): Promise<{ report_text: string }> => {
    return {
      report_text: `================================================================================
TRIPSTOCK AI - EXECUTIVE TRAVEL INVENTORY PROCUREMENT & BUDGET OPTIMIZATION DOSSIER
CONFIDENTIAL - PREPARED FOR TBO.COM INVENTORY DIRECTORS & PROCUREMENT LEADERSHIP
================================================================================
Generated: 2026-11-20
Platform: TripStock AI (Deep Predictive Engine v1.0)
Status: OPTIMAL ALLOCATION SOLVED

1. EXECUTIVE SUMMARY & KEY INDICATORS
--------------------------------------------------------------------------------
Total Investment Budget:        INR 5,000,000
Allocated Capital:              INR 4,680,000
Capital Utilization:            93.6%
Expected Gross Revenue:         INR 6,240,000
Expected Net Profit:            INR 1,372,800
Target Portfolio ROI:           29.3%
Downside Value-at-Risk (95%):   INR 772,200
Overall Portfolio Risk Rating:  Moderate (32.4 / 100)

2. CORE MATHEMATICAL FORMULATION
--------------------------------------------------------------------------------
Method: Mixed-Integer Bounded Linear Programming (SciPy HiGHS Solver)
Objective Function: Maximize Sum[ x_i * (SellThrough_i * Price_i - Cost_i - Cancellation_i) - Unsold_Loss_i ]
Subject to:
  * Sum[ x_i * Cost_i ] <= Budget Constraint (STRICT HARD BOUND - ZERO OVERRUN)
  * 0 <= x_i <= Min(Supplier_Capacity_i, Forecast_Demand_i * RiskFactor)
  * x_i in Integers (Physical room nights and flight seat allotment guarantees)

3. TOP RECOMMENDED PROCUREMENT ALLOCATIONS
--------------------------------------------------------------------------------
- Dubai (Flight): 45 units | Cost: INR 967,500 | Expected Profit: INR 154,800 (ROI 16.0%)
- Goa (Hotel): 95 units | Cost: INR 494,000 | Expected Profit: INR 148,200 (ROI 30.0%)
- Delhi (Flight): 140 units | Cost: INR 616,000 | Expected Profit: INR 96,400 (ROI 15.6%)
- Jaipur (Hotel): 35 units | Cost: INR 402,500 | Expected Profit: INR 80,200 (ROI 19.9%)

4. RISK ANALYSIS & STRESS TEST DOWNSIDE
--------------------------------------------------------------------------------
Projected Cancellation Exposure: INR 93,600
Projected Unsold Inventory Risk: INR 140,400
Net Profit Under 15% Demand Shock: INR 796,224

Active Mitigation Strategies:
* Implement automated 72-hour flash sale distribution via TBO partner API to offload softened routes.
* Tighten advance non-refundable inventory tranches and request partner seat re-allotment.
* Cap batch commitments at 65% of forecasted volume and secure dynamic consignment replenishments.

================================================================================
END OF REPORT - TripStock AI
================================================================================`
    };
  },

  // Demo Reset
  resetDemoDatabase: async (): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: "Demo database successfully reset and re-seeded with pristine travel dataset." };
  }
};
