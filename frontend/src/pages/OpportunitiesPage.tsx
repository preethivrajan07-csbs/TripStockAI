import React, { useState, useEffect } from "react";
import {
  Boxes,
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { OpportunityItem } from "../types";
import { api } from "../services/api";

interface OpportunitiesPageProps {
  onNavigateToOptimizer: (selectedDest?: string) => void;
  currency: "INR" | "USD";
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  onNavigateToOptimizer,
  currency
}) => {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"score" | "profit" | "margin">("score");
  const [selectedOpp, setSelectedOpp] = useState<OpportunityItem | null>(null);

  useEffect(() => {
    api.getOpportunities()
      .then((data) => setOpportunities(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) => {
    if (currency === "USD") {
      const usd = amount / 85.0;
      return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const filtered = opportunities.filter((opp) => {
    const matchesSearch = opp.destination.toLowerCase().includes(search.toLowerCase()) ||
                          opp.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || opp.inventory_type === typeFilter;
    const matchesRisk = riskFilter === "All" || opp.risk_level === riskFilter;
    return matchesSearch && matchesType && matchesRisk;
  }).sort((a, b) => {
    if (sortBy === "score") return b.opportunity_score - a.opportunity_score;
    if (sortBy === "profit") return b.estimated_profit - a.estimated_profit;
    if (sortBy === "margin") return b.unit_margin - a.unit_margin;
    return 0;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-teal-400" />
            <span>Inventory Opportunity Discovery Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Scored procurement opportunities evaluated across undersupply gaps, projected sell-through, supplier reliability, and margin cushion.
          </p>
        </div>

        <button
          onClick={() => onNavigateToOptimizer()}
          className="neon-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 self-start md:self-auto cursor-pointer"
        >
          <span>Feed All Opportunities to Optimizer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search destination or supplier partner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Inventory Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Hotel">Hotels Only</option>
            <option value="Flight">Flights Only</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="All">All Risk Profiles</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none font-mono"
          >
            <option value="score">Sort by Opportunity Score</option>
            <option value="profit">Sort by Estimated Profit</option>
            <option value="margin">Sort by Unit Margin</option>
          </select>
        </div>
      </div>

      {/* Opportunities Data Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase font-mono text-slate-400 bg-white/5 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Procure Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Unit Margin</th>
                <th className="py-3 px-4 text-right">Sell-Through</th>
                <th className="py-3 px-4 text-center">Risk</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-mono">
                    Scoring current market inventory allotments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No procurement opportunities match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((opp) => {
                  const isLowRisk = opp.risk_level === "Low";
                  const isMedRisk = opp.risk_level === "Medium";
                  return (
                    <tr key={opp.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            opp.inventory_type === "Hotel" ? "bg-purple-950 text-purple-300 border border-purple-500/30" : "bg-teal-950 text-teal-300 border border-teal-500/30"
                          }`}>
                            {opp.inventory_type}
                          </span>
                          <span className="font-semibold text-white">{opp.destination}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{opp.travel_period}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="truncate max-w-[140px] block">{opp.supplier}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Allotment Block</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(opp.procurement_price)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-white font-medium">
                        {formatCurrency(opp.expected_selling_price)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                        +{formatCurrency(opp.unit_margin)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className="text-teal-300 font-bold">{opp.predicted_sell_through}%</span>
                        <div className="w-16 ml-auto bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                          <div style={{ width: `${opp.predicted_sell_through}%` }} className="h-full bg-teal-400 rounded-full" />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          isLowRisk ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30" :
                          isMedRisk ? "bg-amber-950/80 text-amber-300 border border-amber-500/30" :
                          "bg-rose-950/80 text-rose-300 border border-rose-500/30"
                        }`}>
                          {opp.risk_level}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-sm font-mono text-teal-400">
                          {opp.opportunity_score}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOpp(opp)}
                          className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-teal-500/40 text-slate-300 hover:text-white transition text-[11px]"
                          title="Inspect ML rationale"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onNavigateToOptimizer(opp.destination)}
                          className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 transition text-[11px] font-semibold"
                        >
                          Optimize
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Opportunity Detail Drawer / Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl p-6 relative border border-teal-500/40 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-300">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedOpp.destination} — {selectedOpp.inventory_type} Opportunity
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">ID: {selectedOpp.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-teal-200">
                <span className="font-mono font-bold text-[11px] uppercase block mb-1">Explainable AI Rationale:</span>
                <p className="leading-relaxed">{selectedOpp.rationale}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase block">Supplier Contract</span>
                  <span className="text-white font-semibold text-xs mt-1 block">{selectedOpp.supplier}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase block">Opportunity Score</span>
                  <span className="text-teal-400 font-bold text-base mt-1 block">{selectedOpp.opportunity_score} / 100</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase block">Unit Economics</span>
                  <span className="text-slate-200 text-xs mt-1 block">
                    Cost: {formatCurrency(selectedOpp.procurement_price)} | Price: {formatCurrency(selectedOpp.expected_selling_price)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase block">Projected 30-Day Profit</span>
                  <span className="text-emerald-400 font-bold text-xs mt-1 block">
                    +{formatCurrency(selectedOpp.estimated_profit)} (50-unit lot)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedOpp(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  const dest = selectedOpp.destination;
                  setSelectedOpp(null);
                  onNavigateToOptimizer(dest);
                }}
                className="neon-btn px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Apply In Budget Optimizer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
