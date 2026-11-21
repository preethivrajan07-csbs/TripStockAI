import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Sliders,
  DollarSign,
  Activity,
  ArrowRight,
  TrendingDown,
  Percent,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import { RiskSimulationResult } from "../types";
import { api } from "../services/api";

interface RiskAnalysisPageProps {
  currency: "INR" | "USD";
}

export const RiskAnalysisPage: React.FC<RiskAnalysisPageProps> = ({ currency }) => {
  const [demandShock, setDemandShock] = useState<number>(-15);
  const [cancellationSurge, setCancellationSurge] = useState<number>(10);
  const [procurementInflation, setProcurementInflation] = useState<number>(0);
  const [budget, setBudget] = useState<number>(5000000);

  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<RiskSimulationResult | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.simulateRisk({
        budget,
        demand_shock_pct: demandShock,
        cancellation_surge_pct: cancellationSurge,
        procurement_inflation_pct: procurementInflation
      });
      setRiskData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [demandShock, cancellationSurge, procurementInflation]);

  const formatCurrency = (amount: number) => {
    if (currency === "USD") {
      const usd = amount / 85.0;
      return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Downside Risk & Sensitivity Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic stress testing analyzing demand shocks, cancellation surges, unsold inventory exposure, and Value-at-Risk (VaR 95%).
          </p>
        </div>

        <button
          onClick={runSimulation}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate Stress Test</span>
        </button>
      </div>

      {/* Interactive What-If Simulation Controls */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          <span>Interactive What-If Scenario Stress Controls</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Adjust macro assumptions to observe real-time portfolio resilience and downside financial exposure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Demand Shock */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-slate-300">Demand Shock:</span>
              <span className={`font-bold ${demandShock < 0 ? "text-rose-400" : "text-teal-400"}`}>
                {demandShock > 0 ? `+${demandShock}%` : `${demandShock}%`}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="30"
              step="5"
              value={demandShock}
              onChange={(e) => setDemandShock(Number(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Test travel demand contraction (e.g. -15%)</span>
          </div>

          {/* Slider 2: Cancellation Surge */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-slate-300">Cancellation Surge:</span>
              <span className="font-bold text-amber-400">+{cancellationSurge} percentage pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="2"
              value={cancellationSurge}
              onChange={(e) => setCancellationSurge(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Test unexpected cancellations / itinerary changes</span>
          </div>

          {/* Slider 3: Procurement Inflation */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-slate-300">Procurement Inflation:</span>
              <span className="font-bold text-purple-400">+{procurementInflation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="2"
              value={procurementInflation}
              onChange={(e) => setProcurementInflation(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Supplier fuel surcharges & peak allotment premiums</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-16 flex items-center justify-center space-x-3 text-rose-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm">Simulating Monte Carlo downside risk and recalculating exposures...</span>
        </div>
      ) : riskData ? (
        <>
          {/* Risk KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4">
              <span className="text-[11px] font-mono uppercase text-slate-400">Portfolio Risk Score</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {riskData.overall_risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <span className="text-[10px] text-rose-300 font-mono mt-1 block font-semibold">
                Category: {riskData.risk_category}
              </span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[11px] font-mono uppercase text-slate-400">Capital at Risk (Exposure)</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {formatCurrency(riskData.financial_exposure)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Total deployed procurement</span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[11px] font-mono uppercase text-slate-400">Unsold & Cancel Losses</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {formatCurrency(riskData.expected_unsold_inventory_loss + riskData.expected_cancellation_loss)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Under simulated shocks</span>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[11px] font-mono uppercase text-slate-400">Net Profit After Shocks</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${riskData.net_profit_after_shocks >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                {riskData.net_profit_after_shocks >= 0 ? "+" : ""}{formatCurrency(riskData.net_profit_after_shocks)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Resilient margin buffer</span>
            </div>
          </div>

          {/* Stress Curve Chart & High Risk Assets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stress Curve */}
            <div className="glass-panel p-5 lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-1">Downside Sensitivity Curve (-30% to +30% Demand Shift)</h3>
              <p className="text-xs text-slate-400 mb-4">Projected net profit vs unsold inventory loss as demand contracts or expands</p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskData.stress_curve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="demand_shift_pct" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "#0e1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(val: any) => [formatCurrency(val)]}
                    />
                    <Line type="monotone" dataKey="projected_profit" stroke="#05d5aa" strokeWidth={2.5} name="Projected Net Profit" dot />
                    <Line type="monotone" dataKey="projected_unsold_loss" stroke="#f43f5e" strokeWidth={2} name="Unsold Loss" strokeDasharray="3 3" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* High-Risk Destinations */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-bold text-white mb-1">Destinations by Risk Exposure</h3>
              <p className="text-xs text-slate-400 mb-4">Ranked by potential downside</p>

              <div className="space-y-3 font-mono text-xs">
                {riskData.high_risk_destinations.slice(0, 5).map((d, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-sans font-semibold">{d.destination}</span>
                      <span className={`text-[11px] font-bold ${d.risk_score > 70 ? "text-rose-400" : "text-amber-400"}`}>
                        Risk: {d.risk_score}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Exposure: {formatCurrency(d.exposure)}</span>
                      <span>Unsold: {d.unsold_units} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prescribed Mitigation Strategies */}
          <div className="glass-panel p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Recommended Tactical Risk Mitigations for Procurement Team</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {riskData.mitigation_strategies.map((strat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/20 text-slate-300 flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400 mt-1 flex-shrink-0"></div>
                  <span className="leading-relaxed">{strat}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
