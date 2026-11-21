import React, { useState, useEffect } from "react";
import {
  Cpu,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertOctagon,
  Save,
  CheckCircle,
  HelpCircle,
  Layers,
  PieChart as PieChartIcon,
  Sparkles,
  ArrowRight,
  Activity
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { OptimizationResult, AllocationItem } from "../types";
import { api } from "../services/api";

const DESTINATIONS = ["Goa", "Dubai", "Delhi", "Mumbai", "Bengaluru", "Jaipur", "Kochi", "Singapore", "Hyderabad", "Chennai"];

interface BudgetOptimizerPageProps {
  initialDestination?: string;
  currency: "INR" | "USD";
}

export const BudgetOptimizerPage: React.FC<BudgetOptimizerPageProps> = ({
  initialDestination,
  currency
}) => {
  const [budget, setBudget] = useState<number>(5000000);
  const [riskPreference, setRiskPreference] = useState<string>("balanced");
  const [inventoryType, setInventoryType] = useState<string>("All");
  const [minMargin, setMinMargin] = useState<number>(12);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    initialDestination ? [initialDestination] : []
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const [scenarioName, setScenarioName] = useState("Q4 High-Yield Travel Allocation");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await api.runOptimization({
        budget,
        risk_preference: riskPreference,
        inventory_type: inventoryType,
        min_profit_margin_pct: minMargin,
        preferred_destinations: selectedDestinations.length > 0 ? selectedDestinations : undefined
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedScenarios = async () => {
    try {
      const list = await api.getSavedScenarios();
      setSavedScenarios(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    runOptimization();
    loadSavedScenarios();
  }, []);

  const handleSaveScenario = async () => {
    if (!result) return;
    try {
      await api.saveScenario({
        name: scenarioName,
        budget: result.budget,
        risk_preference: riskPreference,
        total_allocated: result.total_allocated,
        unused_budget: result.unused_budget,
        expected_revenue: result.expected_revenue,
        expected_profit: result.expected_profit,
        expected_roi_pct: result.expected_roi_pct,
        expected_unsold_loss: result.expected_unsold_loss,
        expected_cancellation_loss: result.expected_cancellation_loss,
        allocations: result.allocations,
        rationale: `Optimal SciPy integer allocation for budget ${result.budget} with ${riskPreference} risk profile.`
      });
      setSaveSuccess(true);
      loadSavedScenarios();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    if (currency === "USD") {
      const usd = amount / 85.0;
      return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const COLORS = ["#05d5aa", "#00f2fe", "#8b5cf6", "#ec4899", "#f59e0b", "#3b82f6", "#10b981", "#6366f1"];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-950/40 border border-teal-500/30 text-[10px] font-mono text-teal-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>SciPy Mixed-Integer Bounded Linear Programming (HiGHS Solver)</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-teal-400" />
            <span>Intelligent Budget & Inventory Optimization Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mathematically maximizes expected risk-adjusted net profit under strict investment budget bounds and supplier allotment capacities.
          </p>
        </div>

        <button
          onClick={runOptimization}
          disabled={loading}
          className="neon-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer self-start md:self-auto"
        >
          {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
          <span>{loading ? "Optimizing Portfolio..." : "Execute Optimizer"}</span>
        </button>
      </div>

      {/* Constraints & Settings Card */}
      <div className="glass-panel p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Maximum Investment Budget Input */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Investment Budget Limit</span>
            <span className="text-teal-400 font-bold">{formatCurrency(budget)}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="250000"
              min="500000"
              max="50000000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-teal-500/30 text-white font-mono text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Hard budget cap: solver never exceeds this value</span>
        </div>

        {/* Risk Preference */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5">Risk Profile</label>
          <select
            value={riskPreference}
            onChange={(e) => setRiskPreference(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none font-mono"
          >
            <option value="conservative">Conservative (High Unsold Penalty, Stricter Caps)</option>
            <option value="balanced">Balanced (Optimal Mean-Variance Sharpe Yield)</option>
            <option value="aggressive">Aggressive (High Return, Full Capacity Allocation)</option>
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block">Affects sell-through multipliers and downside penalties</span>
        </div>

        {/* Inventory Scope */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5">Inventory Category</label>
          <select
            value={inventoryType}
            onChange={(e) => setInventoryType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none font-mono"
          >
            <option value="All">All Travel Portfolios (Hotels + Flights)</option>
            <option value="Hotel">Hotels & Bedbanks Only</option>
            <option value="Flight">Airline Seat Blocks Only</option>
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block">Cross-category diversification</span>
        </div>

        {/* Minimum Margin Hurdle */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Minimum Margin Hurdle</span>
            <span className="text-teal-400 font-bold">{minMargin}%</span>
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={minMargin}
            onChange={(e) => setMinMargin(Number(e.target.value))}
            className="w-full accent-teal-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Filters opportunities below this unit margin %</span>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-20 flex flex-col items-center justify-center space-y-3 text-teal-400">
          <Activity className="w-8 h-8 animate-spin" />
          <span className="font-mono text-sm">Solving bounded integer linear program via SciPy HiGHS...</span>
        </div>
      ) : result ? (
        <>
          {/* Key Outcome Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Allocated Capital</span>
              <div className="text-lg font-bold text-white font-mono mt-1">{formatCurrency(result.total_allocated)}</div>
              <span className="text-[10px] text-teal-400 mt-0.5 block font-mono">
                {result.algorithm_summary.budget_utilization_pct}% of Budget
              </span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Unused Budget Reserve</span>
              <div className="text-lg font-bold text-slate-300 font-mono mt-1">{formatCurrency(result.unused_budget)}</div>
              <span className="text-[10px] text-emerald-400 mt-0.5 block font-mono">Zero Budget Overrun</span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Expected Gross Revenue</span>
              <div className="text-lg font-bold text-cyan-300 font-mono mt-1">{formatCurrency(result.expected_revenue)}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">Projected Sell-Through</span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Expected Net Profit</span>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-1">+{formatCurrency(result.expected_profit)}</div>
              <span className="text-[10px] text-emerald-300 mt-0.5 block font-mono">Risk-Adjusted</span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Target Return (ROI)</span>
              <div className="text-lg font-bold text-teal-400 font-mono mt-1">+{result.expected_roi_pct}%</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">Net Yield</span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Unsold & Cancel Buffer</span>
              <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                {formatCurrency(result.expected_unsold_loss + result.expected_cancellation_loss)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                {result.expected_unsold_quantity} unsold units
              </span>
            </div>
          </div>

          {/* Allocation Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Destination Distribution */}
            <div className="glass-panel p-5 lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-1">Destination Capital Allocation</h3>
              <p className="text-xs text-slate-400 mb-4">Capital assigned per destination based on forecast demand and margins</p>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.destination_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="destination" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "#0e1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(val: any) => [formatCurrency(val), "Allocated Budget"]}
                    />
                    <Bar dataKey="allocated_budget" fill="#05d5aa" radius={[4, 4, 0, 0]} name="Allocated Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory Type Split */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-bold text-white mb-1">Inventory Asset Allocation</h3>
              <p className="text-xs text-slate-400 mb-4">Capital split across hotels vs flights</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={result.inventory_breakdown}
                      dataKey="allocated_budget"
                      nameKey="inventory_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={38}
                      paddingAngle={4}
                    >
                      {result.inventory_breakdown.map((_, idx) => (
                        <Cell key={idx} fill={idx === 0 ? "#8b5cf6" : "#05d5aa"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0e1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(val: any) => [formatCurrency(val), "Budget"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {result.inventory_breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? "bg-purple-400" : "bg-teal-400"}`}></span>
                      {item.inventory_type} ({item.units} units)
                    </span>
                    <span className="text-white font-bold">{formatCurrency(item.allocated_budget)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Inventory Items Table with "Why did the optimizer select this inventory?" */}
          <div className="glass-panel overflow-hidden">
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>Recommended Inventory Procurement Decisions ({result.allocations.length} Assets)</span>
                </h3>
                <p className="text-xs text-slate-400">Strict integer allotment quantities with mathematical explainability</p>
              </div>

              {/* Save Scenario Bar */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="Scenario name..."
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
                />
                <button
                  onClick={handleSaveScenario}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {saveSuccess ? <CheckCircle className="w-3.5 h-3.5 text-teal-400" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saveSuccess ? "Saved!" : "Save Scenario"}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase font-mono text-slate-400 bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Asset / Destination</th>
                    <th className="py-3 px-4">Supplier Partner</th>
                    <th className="py-3 px-4 text-center">Allocated Units</th>
                    <th className="py-3 px-4 text-right">Procure Capital</th>
                    <th className="py-3 px-4 text-right">Expected Revenue</th>
                    <th className="py-3 px-4 text-right">Net Profit</th>
                    <th className="py-3 px-4 text-center">ROI</th>
                    <th className="py-3 px-4">Why Selected by Optimizer?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.allocations.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            item.inventory_type === "Hotel" ? "bg-purple-950 text-purple-300 border border-purple-500/30" : "bg-teal-950 text-teal-300 border border-teal-500/30"
                          }`}>
                            {item.inventory_type}
                          </span>
                          <span className="font-semibold text-white">{item.destination}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        {item.supplier}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-teal-400 font-extrabold text-sm px-2.5 py-1 rounded-lg bg-teal-950/60 border border-teal-500/30">
                          {item.recommended_units}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(item.total_cost)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-white">
                        {formatCurrency(item.expected_revenue)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                        +{formatCurrency(item.expected_profit)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                          +{item.roi_pct}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 max-w-xs text-[11px] leading-relaxed">
                        <div className="p-2 rounded-lg bg-slate-900/70 border border-white/5 text-slate-300">
                          {item.rationale}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
