import React from "react";
import { Bell, Play, PhoneCall, RefreshCw } from "lucide-react";

interface NavbarProps {
  collapsed: boolean;
  onRunForecastClick: () => void;
  currency: "INR" | "USD";
  onCurrencyToggle: () => void;
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  collapsed,
  onRunForecastClick,
  currency,
  onCurrencyToggle,
  onRefreshData
}) => {
  return (
    <header
      className={`fixed top-0 right-0 h-16 z-30 transition-all duration-300 border-b border-white/10 px-6 flex items-center justify-between ${
        collapsed ? "left-20" : "left-64"
      }`}
      style={{ background: "rgba(10, 14, 23, 0.85)", backdropFilter: "blur(14px)" }}
    >
      {/* Brand Header Nav Links (as in the reference image) */}
      <div className="flex items-center space-x-6">
        <span className="text-xs uppercase tracking-widest text-slate-400 font-mono hidden md:inline">
          Autonomous Inventory Yield Intelligence
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* Currency Switcher */}
        <button
          onClick={onCurrencyToggle}
          className="px-2.5 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-slate-300 hover:border-teal-500/40 hover:text-white transition"
          title="Toggle Currency Display"
        >
          Currency: <span className="font-bold text-teal-400">{currency}</span>
        </button>

        {/* Refresh button */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Reload live feeds"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Reference Image Signature Button: "Run a Sample Forecast" */}
        <button
          onClick={onRunForecastClick}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 neon-btn cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run a Sample Forecast</span>
        </button>

        {/* Reference Image Link: "Talk to Revenue Engineering" */}
        <a
          href="#revenue-eng"
          onClick={(e) => {
            e.preventDefault();
            alert("Direct communication channel with TBO Revenue Engineering Desk: yield@tbo.com | Ext: 4421");
          }}
          className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 hover:text-teal-400 transition font-medium px-2 py-1"
        >
          <PhoneCall className="w-3 h-3" />
          <span>Talk to Revenue Engineering</span>
        </a>

        {/* Alert notification badge */}
        <div className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-950"></span>
        </div>
      </div>
    </header>
  );
};
