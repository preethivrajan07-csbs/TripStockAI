import React, { useState, useEffect } from "react";
import { User, DashboardSummary } from "./types";
import { api } from "./services/api";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ForecastPage } from "./pages/ForecastPage";
import { OpportunitiesPage } from "./pages/OpportunitiesPage";
import { BudgetOptimizerPage } from "./pages/BudgetOptimizerPage";
import { RiskAnalysisPage } from "./pages/RiskAnalysisPage";
import { ScenarioSimulatorPage } from "./pages/ScenarioSimulatorPage";
import { SupplierManagementPage } from "./pages/SupplierManagementPage";
import { DataManagementPage } from "./pages/DataManagementPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("tripstock_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [optimizerInitialDest, setOptimizerInitialDest] = useState<string | undefined>(undefined);

  const loadSummary = async () => {
    try {
      const data = await api.getDashboardSummary();
      setDashboardSummary(data);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadSummary();
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("tripstock_user", JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("tripstock_user");
  };

  const navigateToOptimizerWithDest = (dest?: string) => {
    setOptimizerInitialDest(dest);
    setCurrentPage("optimizer");
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex">
      {/* Fixed Collapsible Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={(page) => {
          if (page !== "optimizer") setOptimizerInitialDest(undefined);
          setCurrentPage(page);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Top Navigation Bar */}
      <Navbar
        collapsed={sidebarCollapsed}
        onRunForecastClick={() => setCurrentPage("forecast")}
        currency={currency}
        onCurrencyToggle={() => setCurrency(currency === "INR" ? "USD" : "INR")}
        onRefreshData={loadSummary}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 px-6 sm:px-8 max-w-7xl mx-auto ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {currentPage === "dashboard" && (
          <DashboardPage
            summary={dashboardSummary}
            onNavigate={(page) => setCurrentPage(page)}
            currency={currency}
          />
        )}

        {currentPage === "forecast" && <ForecastPage />}

        {currentPage === "opportunities" && (
          <OpportunitiesPage
            onNavigateToOptimizer={navigateToOptimizerWithDest}
            currency={currency}
          />
        )}

        {currentPage === "optimizer" && (
          <BudgetOptimizerPage
            initialDestination={optimizerInitialDest}
            currency={currency}
          />
        )}

        {currentPage === "risk" && <RiskAnalysisPage currency={currency} />}

        {currentPage === "scenarios" && <ScenarioSimulatorPage currency={currency} />}

        {currentPage === "suppliers" && <SupplierManagementPage currency={currency} />}

        {currentPage === "data" && <DataManagementPage />}

        {currentPage === "reports" && <ReportsPage />}

        {currentPage === "settings" && (
          <SettingsPage
            user={user}
            currency={currency}
            onCurrencyChange={(c) => setCurrency(c)}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
};

export default App;
