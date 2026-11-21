import React, { useState, useEffect } from "react";
import {
  Sliders,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Activity
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { ScenarioComparisonItem } from "../types";
import { api } from "../services/api";

interface ScenarioSimulatorPageProps {
  currency: "INR" | "USD";
}

export const ScenarioSimulatorPage: React.FC<ScenarioSimulatorPageProps> = ({ currency }) => {
  const [scenarios, setScenarios] = useState<ScenarioComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom scenario state
  const [customDemand, setCustomDemand] = useState(10);
  const [customCancel, setCustomCancel] = useState(5);
  const [customInflation, setCustomInflation] = useState(4);
  const [customResult, setCustomResult] = useState<any>(null);

  useEffect(() => {
    api.getPresetScenarios()
      .then((data) => setScenarios(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) => {
    if (currency === "USD") {
      const usd = amount / 85.0;
      return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const handleSimulateCustom = () => {
    const baseInv = 4500000;
    const inv = baseInv * (1 + customInflation / 100);
    const rev = baseInv * 1.35 * (1 + customDemand / 100) * (1 - customCancel / 150);
    const profit = rev - inv - (baseInv * 0.04);
    const roi = (profit / inv) * 100;
    setCustomResult({
      scenario_name: "Scenario F: Custom Director Mix",
      investment: inv,
      revenue: rev,
      net_profit: profit,
      roi_pct: roundVal(roi),
      risk_score: roundVal(30 + Math.abs(customDemand < 0 ? customDemand : 0) * 1.2 + customCancel * 1.5)
    });
  };

  const roundVal = (v: number) => Math.round(v * 10) / 10;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-teal-400" />
          <span>Interactive Business Scenario Simulator</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Stress test procurement outcomes across 5 standardized market shocks and configure custom market hypotheses.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel p-16 flex items-center justify-center space-x-3 text-teal-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm">Evaluating multi-scenario simulations...</span>
        </div>
      ) : (
        <>
          {/* Comparison Cards for Scenarios A - E */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {scenarios.map((sc, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 flex flex-col justify-between hover:border-teal-500/40 transition"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block mb-1">
                    {sc.scenario_name.split(":")[0]}
                  </span>
                  <h3 className="text-xs font-bold text-white leading-snug">
                    {sc.scenario_name.split(":")[1]}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">{sc.description}</p>
                </div>

                <div className="my-3 space-y-1.5 font-mono text-xs pt-3 border-t border-white/5">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px]">Net Profit:</span>
                    <span className="text-emerald-400 font-bold">+{formatCurrency(sc.net_profit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px]">Expected ROI:</span>
                    <span className="text-teal-300 font-semibold">{sc.roi_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px]">Unsold Units:</span>
                    <span className="text-slate-300">{sc.unsold_units}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px]">Risk Score:</span>
                    <span className={sc.risk_score > 50 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                      {sc.risk_score}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono text-center py-1 rounded bg-slate-900 border border-white/5">
                  Capex: {formatCurrency(sc.investment)}
                </div>
              </div>
            ))}
          </div>

          {/* Side-by-Side Profit & Revenue Chart */}
          <div className="glass-panel p-5">
            <h3 className="text-sm font-bold text-white mb-1">Comparative Financial Outcomes Across Scenarios</h3>
            <p className="text-xs text-slate-400 mb-4">Gross Revenue vs Net Profit by Scenario condition</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="scenario_name" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => v.split(":")[0]} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#0e1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(val: any) => [formatCurrency(val)]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="revenue" fill="#00f2fe" name="Gross Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net_profit" fill="#05d5aa" name="Net Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Custom Scenario Sandbox Builder */}
          <div className="glass-panel p-5 border border-teal-500/30">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>Custom Hypothetical Scenario Builder</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Compose custom market dynamics and instantly compute expected portfolio returns.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Demand Variation: {customDemand}%</label>
                <input
                  type="range"
                  min="-30"
                  max="40"
                  value={customDemand}
                  onChange={(e) => setCustomDemand(Number(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Cancellation Shift: +{customCancel} pts</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={customCancel}
                  onChange={(e) => setCustomCancel(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Cost Inflation: +{customInflation}%</label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={customInflation}
                  onChange={(e) => setCustomInflation(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                onClick={handleSimulateCustom}
                className="neon-btn px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Compute Custom Sandbox Scenario
              </button>

              {customResult && (
                <div className="flex items-center space-x-4 text-xs font-mono">
                  <span className="text-slate-300">Net Profit: <strong className="text-emerald-400">+{formatCurrency(customResult.net_profit)}</strong></span>
                  <span className="text-slate-300">ROI: <strong className="text-teal-300">{customResult.roi_pct}%</strong></span>
                  <span className="text-slate-300">Risk Score: <strong className="text-amber-400">{customResult.risk_score}</strong></span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
