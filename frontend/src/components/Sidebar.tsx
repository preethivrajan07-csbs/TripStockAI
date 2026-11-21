import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  Cpu,
  ShieldAlert,
  Sliders,
  Building2,
  Database,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  collapsed,
  onToggleCollapse,
  user,
  onLogout
}) => {
  const menuItems = [
    { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { id: "forecast", label: "Demand Forecasting", icon: TrendingUp },
    { id: "opportunities", label: "Inventory Discovery", icon: Boxes },
    { id: "optimizer", label: "Budget Optimizer", icon: Cpu, badge: "CORE" },
    { id: "risk", label: "Risk & Exposure", icon: ShieldAlert },
    { id: "scenarios", label: "Scenario Simulator", icon: Sliders },
    { id: "suppliers", label: "Supplier Network", icon: Building2 },
    { id: "data", label: "Data Pipeline", icon: Database },
    { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet },
    { id: "settings", label: "Platform Settings", icon: Settings }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 flex flex-col justify-between border-r border-white/10 ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{ background: "#0a0e17" }}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center space-x-3 overflow-hidden cursor-pointer" onClick={() => onPageChange("dashboard")}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-black" style={{ background: "linear-gradient(135deg, #05d5aa 0%, #00f2fe 100%)" }}>
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  TripStock <span className="text-teal-400 font-mono text-xs px-1.5 py-0.5 rounded bg-teal-950/70 border border-teal-500/30">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">TBO.com Engine</span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Signal Feed Tag */}
        {!collapsed && (
          <div className="px-4 py-2.5 mx-3 mt-3 rounded-lg border border-teal-500/20 bg-teal-950/30 flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              LIVE SIGNAL FEED
            </span>
            <span className="text-slate-400 text-[10px]">06:14 EST</span>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? "bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-[0_0_15px_rgba(5,213,170,0.15)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                {!collapsed && (
                  <span className="ml-3 truncate font-normal tracking-wide flex-1 text-left">
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-300 border border-teal-400/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User / Logout Footer */}
      <div className="p-3 border-t border-white/10">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate font-mono">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="ml-3 font-semibold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
