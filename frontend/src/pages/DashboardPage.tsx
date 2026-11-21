import React from "react";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Play,
  Activity,
  Percent,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import { DashboardSummary } from "../types";

interface DashboardPageProps {
  summary: DashboardSummary | null;
  onNavigate: (page: string) => void;
  currency: "INR" | "USD";
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  onNavigate,
  currency
}) => {
  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-teal-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm">Aggregating live travel inventory feeds...</span>
        </div>
      </div>
    );
  }

  const { kpis, demand_trend, destination_demand, image_signature_metrics, live_signal_feed } = summary;

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
    <div className="space-y-8 pb-12">
      {/* 1. HERO SECTION DIRECTLY FROM USER'S REFERENCE IMAGE */}
      <div className="text-center pt-2 pb-4 relative">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-950/40 text-[11px] font-mono text-teal-300 mb-4 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span>LIVE SIGNAL FEED — {live_signal_feed.timestamp}</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          See demand <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
            before it books.
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto mt-4 font-normal">
          Predictive inventory intelligence for hotels and airlines — 72 hours ahead of every demand shift.
        </p>
      </div>

      {/* 2. THE SIGNATURE 7 CARDS DIRECTLY FROM THE REFERENCE IMAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: REVPAR LIFT */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-teal-500/30 transition">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 tracking-wider">
            <span>REVPAR LIFT</span>
            <span className="text-slate-400 text-[10px]">1 YTD avg</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">
            {image_signature_metrics.revpar_lift}
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-[11px] text-slate-400 font-mono">last 12 weeks</span>
            {/* Mini bar chart */}
            <div className="flex items-end space-x-1 h-8">
              {[30, 45, 40, 55, 65, 50, 70, 85, 75, 90, 80, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1.5 rounded-t-sm ${i >= 8 ? "bg-teal-400" : "bg-slate-700"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: 72-HR ACCURACY */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-cyan-500/30 transition">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 tracking-wider">
            <span>72-HR ACCURACY</span>
            <span className="text-teal-400 text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> VERIFIED
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">
            {image_signature_metrics.forecast_accuracy_72h}
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "94.3%", background: "linear-gradient(90deg, #05d5aa, #00f2fe)" }}
              />
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              vs. {image_signature_metrics.accuracy_baseline} industry baseline
            </div>
          </div>
        </div>

        {/* Card 3: OCCUPANCY MAP (Matrix Heatmap) */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-purple-500/30 transition">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 tracking-wider">
            <span>OCCUPANCY MAP</span>
            <span className="text-[10px] text-slate-400 font-mono">S M T W T F S</span>
          </div>
          <div className="mt-3 grid grid-rows-4 gap-1.5">
            {image_signature_metrics.occupancy_heatmap.slice(0, 4).map((r, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-8 gap-1">
                {r.cells.map((val, cellIdx) => {
                  const isHigh = val >= 92;
                  const isMed = val >= 80;
                  return (
                    <div
                      key={cellIdx}
                      title={`${r.row}: ${val}%`}
                      className={`h-3 rounded-xs transition-colors ${
                        isHigh ? "bg-teal-400" : isMed ? "bg-teal-700" : "bg-purple-900/60"
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Low</span>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-xs bg-purple-900"></span>
              <span className="w-2 h-2 rounded-xs bg-teal-700"></span>
              <span className="w-2 h-2 rounded-xs bg-teal-400"></span>
            </div>
            <span>High</span>
          </div>
        </div>

        {/* Card 4: Glowing Action Card "Run a Sample Forecast" */}
        <div
          onClick={() => onNavigate("forecast")}
          className="glass-panel-glow p-5 flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-300">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
          </div>
          <div>
            <div className="text-base font-bold text-white group-hover:text-teal-300 transition">
              Run a Sample Forecast
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Select property type or airline route, input dates... watch live ML forecast render.
            </p>
          </div>
        </div>
      </div>

      {/* Row 2 of Image Signature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 5: FARE ELASTICITY CURVE */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>FARE ELASTICITY</span>
            <span className="text-[11px] text-teal-400 font-mono">BOM_DXB • Thu-Mon</span>
          </div>
          <div className="h-36 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={image_signature_metrics.fare_elasticity_curve}>
                <defs>
                  <linearGradient id="elasticityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#05d5aa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#05d5aa" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: "#0e1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(val: any) => [`Revenue Index: ${val}`, "Yield"]}
                />
                <Area type="monotone" dataKey="rev_factor" stroke="#05d5aa" strokeWidth={2.5} fill="url(#elasticityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
            <span>Yield</span>
            <span className="text-teal-400 font-bold">Optimal: 0% Markup Delta</span>
            <span>Price</span>
          </div>
        </div>

        {/* Card 6: INVENTORY REBALANCES */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>INVENTORY REBALANCES</span>
            <span className="flex items-center gap-1.5 text-[10px] text-purple-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
              Live rebalancing
            </span>
          </div>
          <div className="my-3">
            <div className="text-4xl font-extrabold text-purple-300 font-mono">
              {image_signature_metrics.inventory_rebalances_24h.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">across active hotel rooms & airline seat blocks</p>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-white/5">
            across active properties — last 24h
          </div>
        </div>

        {/* Card 7: UNSOLD RECOVERY */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>UNSOLD RECOVERY</span>
            <span className="text-emerald-400 font-bold font-mono text-xs">
              {image_signature_metrics.unsold_recovery_value}
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-white font-mono">
              {image_signature_metrics.unsold_recovery_pct}%{" "}
              <span className="text-sm font-normal text-slate-400">of distressed</span>
            </div>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Hotels</span>
                <span className="text-purple-300">{image_signature_metrics.distressed_breakdown.hotels}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: "89%" }} className="h-full bg-purple-400 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Airlines</span>
                <span className="text-teal-300">{image_signature_metrics.distressed_breakdown.airlines}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: "76%" }} className="h-full bg-teal-400 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>OTAs / Channels</span>
                <span className="text-cyan-300">{image_signature_metrics.distressed_breakdown.otas}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: "83%" }} className="h-full bg-cyan-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE TBO INVENTORY PROCUREMENT METRICS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <span>Procurement Capital & Yield Overview</span>
          </h2>
          <button
            onClick={() => onNavigate("optimizer")}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition"
          >
            <span>Launch Budget Optimizer Engine</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4">
            <div className="text-[11px] text-slate-400 font-mono uppercase">Max Investment Budget</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{formatCurrency(kpis.available_budget)}</div>
            <div className="text-[10px] text-teal-400 mt-1 flex items-center gap-1">
              <span>Allocated: {formatCurrency(kpis.recommended_investment)}</span>
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="text-[11px] text-slate-400 font-mono uppercase">Expected Net Profit</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{formatCurrency(kpis.expected_net_profit)}</div>
            <div className="text-[10px] text-slate-400 mt-1">Gross: {formatCurrency(kpis.expected_gross_profit)}</div>
          </div>

          <div className="glass-panel p-4">
            <div className="text-[11px] text-slate-400 font-mono uppercase">Projected Demand Surge</div>
            <div className="text-xl font-bold text-teal-300 mt-1 font-mono">{kpis.expected_demand_growth}</div>
            <div className="text-[10px] text-slate-400 mt-1">Volume: {kpis.predicted_booking_volume.toLocaleString()} units</div>
          </div>

          <div className="glass-panel p-4">
            <div className="text-[11px] text-slate-400 font-mono uppercase">Unsold Stock Risk</div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{kpis.unsold_inventory_risk}</div>
            <div className="text-[10px] text-slate-400 mt-1">Utilization: {kpis.inventory_utilization}</div>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE CHARTS: DEMAND TIMELINE & DESTINATION DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Trend Line */}
        <div className="glass-panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Historical & Live Demand Trajectory</h3>
              <p className="text-xs text-slate-400">Searches intent velocity vs confirmed bookings across all routes</p>
            </div>
            <span className="text-xs font-mono text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded bg-teal-950/40">
              30-Day Window
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demand_trend}>
                <defs>
                  <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#05d5aa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#05d5aa" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#0e1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#05d5aa" strokeWidth={2} fill="url(#bookGrad)" name="Confirmed Bookings" />
                <Area type="monotone" dataKey="searches" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#searchGrad)" name="Search Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Destination-Wise Demand */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Top Destinations</h3>
              <p className="text-xs text-slate-400">Volume ranking by demand</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destination_demand.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="destination" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={70} />
                <Tooltip
                  contentStyle={{ background: "#0e1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                />
                <Bar dataKey="total_bookings" fill="#00f2fe" radius={[0, 4, 4, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
