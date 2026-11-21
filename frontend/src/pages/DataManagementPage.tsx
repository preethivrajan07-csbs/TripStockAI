import React, { useState } from "react";
import {
  Database,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";

export const DataManagementPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setValidationResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadCSV(file);
      setValidationResult(res.summary);
    } catch (err: any) {
      setError(err.message || "Failed to validate CSV dataset.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open("/api/data/sample-template", "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-teal-400" />
            <span>Travel Inventory Data Pipeline & Ingestion Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload custom partner booking feeds, validate look-to-book schemas, identify missing cells, and sync historical time-series.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2.5 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs font-semibold flex items-center space-x-2 self-start md:self-auto transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="glass-panel p-8 text-center border-dashed border-2 border-white/20 hover:border-teal-500/50 transition relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">
          {file ? file.name : "Drag and drop your Travel Inventory CSV feed"}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Supports standard booking, search volume, look-to-book ratios, and supplier procurement rate records.
        </p>

        {file && (
          <div className="mt-4 flex items-center justify-center space-x-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="neon-btn px-6 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer"
            >
              {uploading ? <Activity className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{uploading ? "Validating & Ingesting..." : "Validate and Ingest Dataset"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">Data Ingestion Rejected:</span>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Validation Summary Report */}
      {validationResult && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2 text-teal-300 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <span>Dataset Validated & Persisted into SQLite Database</span>
            </div>
            <div className="font-mono text-teal-400 font-bold">
              Quality Score: {validationResult.quality_score} / 100
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total Rows Detected</span>
              <div className="text-xl font-bold font-mono text-white mt-1">{validationResult.total_rows}</div>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Valid Ingested Records</span>
              <div className="text-xl font-bold font-mono text-teal-400 mt-1">{validationResult.valid_rows}</div>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Missing / Incomplete Values</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">{validationResult.missing_values_count}</div>
            </div>

            <div className="glass-panel p-4">
              <span className="text-[10px] font-mono uppercase text-slate-400">Destinations Identified</span>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{validationResult.destinations_count}</div>
            </div>
          </div>

          <div className="glass-panel p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 mb-2">Detected Column Schema</h4>
            <div className="flex flex-wrap gap-2">
              {validationResult.columns_detected.map((col: string, idx: number) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-mono text-xs">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Ingestion Specification Guide */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-400" />
          <span>Expected TBO Travel Inventory Schema Specification</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          TripStock AI requires key economic and demand metrics to solve the inventory optimization problem:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-teal-400 font-bold">date:</span>
            <span className="text-slate-400 block">YYYY-MM-DD time series anchor.</span>
            <span className="text-teal-400 font-bold block pt-1">destination & inventory_type:</span>
            <span className="text-slate-400 block">Location name (e.g. Goa, Dubai) and asset type (Hotel / Flight).</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-teal-400 font-bold">searches & look_to_book:</span>
            <span className="text-slate-400 block">Intent signals informing ML demand forecast.</span>
            <span className="text-teal-400 font-bold block pt-1">procurement_price & selling_price:</span>
            <span className="text-slate-400 block">Unit margins feeding the SciPy bounded linear optimizer.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
