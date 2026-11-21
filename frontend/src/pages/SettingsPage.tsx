import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  DollarSign,
  Database,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { User } from "../types";
import { api } from "../services/api";

interface SettingsPageProps {
  user: User | null;
  currency: "INR" | "USD";
  onCurrencyChange: (c: "INR" | "USD") => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  currency,
  onCurrencyChange,
  onLogout
}) => {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [horizon, setHorizon] = useState("30");
  const [defaultRisk, setDefaultRisk] = useState("balanced");

  const handleResetDemoData = async () => {
    if (!confirm("Are you sure you want to reset and re-seed the demo database with original historical travel records?")) return;
    setResetting(true);
    setResetSuccess(false);
    try {
      await api.resetDemoDatabase();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-teal-400" />
          <span>Platform Settings & System Controls</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage procurement governance parameters, solver horizons, default currency display, and test datasets.
        </p>
      </div>

      {/* User Profile */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-teal-400" />
          <span>Authenticated Officer Profile</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase block">Officer Name</span>
            <span className="text-white font-bold text-sm mt-1 block">{user?.name || "Arjun Sharma"}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase block">Assigned Role</span>
            <span className="text-teal-400 font-bold text-sm mt-1 block">{user?.role || "Director of Travel Inventory & Yield"}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase block">Work Email</span>
            <span className="text-slate-200 mt-1 block">{user?.email || "inventory.director@tbo.com"}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase block">Organization / Unit</span>
            <span className="text-slate-200 mt-1 block">{user?.organization || "TBO.com Global Procurement"}</span>
          </div>
        </div>
      </div>

      {/* Economic & Solver Preferences */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-teal-400" />
          <span>Procurement & Solver Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1.5 font-mono uppercase text-[10px]">Currency Representation</label>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none"
            >
              <option value="INR">Indian Rupee (INR ₹)</option>
              <option value="USD">US Dollar (USD $)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-mono uppercase text-[10px]">Default Forecast Horizon</label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none"
            >
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-mono uppercase text-[10px]">Default Risk Hurdle</label>
            <select
              value={defaultRisk}
              onChange={(e) => setDefaultRisk(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none"
            >
              <option value="conservative">Conservative</option>
              <option value="balanced">Balanced</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database Maintenance & Re-seed */}
      <div className="glass-panel p-5 border border-rose-500/20">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-rose-400" />
          <span>Hackathon Sandbox Database Reset</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Re-seed the SQLite database with fresh 90-day multi-destination travel records across 10 destinations, 12 suppliers, and seasonal look-to-book ratios.
        </p>

        {resetSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 text-xs text-teal-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Database successfully refreshed with pristine demonstration dataset!</span>
          </div>
        )}

        <button
          onClick={handleResetDemoData}
          disabled={resetting}
          className="px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
          <span>{resetting ? "Re-seeding Database..." : "Reset Demo Data"}</span>
        </button>
      </div>

      {/* Logout */}
      <div className="glass-panel p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Sign Out</h3>
          <p className="text-xs text-slate-400">Clear session credentials from local storage</p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 text-xs font-semibold flex items-center space-x-2 cursor-pointer transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
