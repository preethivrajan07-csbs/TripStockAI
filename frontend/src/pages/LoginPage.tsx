import React, { useState } from "react";
import { Sparkles, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { User } from "../types";
import { api } from "../services/api";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("inventory.director@tbo.com");
  const [password, setPassword] = useState("TripStock@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Try the Demo Login option.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login("inventory.director@tbo.com", "TripStock@2026");
      onLoginSuccess(res.user);
    } catch {
      // Fallback
      onLoginSuccess({
        name: "Arjun Sharma",
        role: "Director of Travel Inventory & Yield",
        email: "inventory.director@tbo.com",
        organization: "TBO.com Global Procurement"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#07090e]">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand identity header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-xl" style={{ background: "linear-gradient(135deg, #05d5aa 0%, #00f2fe 100%)" }}>
            <Sparkles className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">TripStock <span className="text-teal-400 font-mono text-xl">AI</span></h1>
          <p className="text-sm text-slate-400 mt-2">Intelligent Travel Inventory & Budget Optimization Platform</p>
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-[11px] font-mono text-teal-300">
            Official TBO.com Hackathon Challenge Solution
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Sign In to Command Center</h2>
            <p className="text-xs text-slate-400 mt-1">Access yield forecasting, inventory discovery, and budget optimization.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@tbo.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-teal-400 focus:ring-0"
                />
                <span>Remember session</span>
              </label>
              <span className="text-teal-400/80 cursor-pointer hover:underline">Forgot password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl neon-btn flex items-center justify-center space-x-2 font-semibold text-sm cursor-pointer mt-2"
            >
              <span>{loading ? "Authenticating..." : "Authorize Access"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <span className="relative px-3 bg-[#0e1320] text-[11px] text-slate-400 uppercase font-mono">Or Quick Evaluation</span>
          </div>

          {/* 1-Click Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Instant Demo Sign-In (Director Role)</span>
          </button>

          {/* Credentials helper */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 font-mono">
            <div className="text-teal-400 font-semibold mb-1">Demo Credentials:</div>
            <div>Email: <span className="text-slate-200">inventory.director@tbo.com</span></div>
            <div>Password: <span className="text-slate-200">TripStock@2026</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
