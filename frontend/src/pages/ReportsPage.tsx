import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Share2,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";

export const ReportsPage: React.FC = () => {
  const [reportText, setReportText] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExecutiveReport()
      .then((res) => setReportText(res.report_text))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "optimization", budget: 5000000 })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tripstock_budget_optimization.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-teal-400" />
            <span>Executive Audit Reports & Export Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete executive procurement dossier with mathematical audit trail, risk limits, and allocation breakdowns.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export Allocations (CSV)</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="neon-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Executive Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-20 flex items-center justify-center space-x-3 text-teal-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm">Compiling mathematical audit reports from live solver...</span>
        </div>
      ) : (
        /* Formatted Dossier View */
        <div className="glass-panel p-6 sm:p-8 font-mono text-xs text-slate-300 border border-teal-500/30 shadow-2xl overflow-x-auto subtle-scroll">
          <pre className="whitespace-pre-wrap leading-relaxed font-mono">
            {reportText}
          </pre>
        </div>
      )}
    </div>
  );
};
