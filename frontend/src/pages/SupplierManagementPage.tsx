import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Activity
} from "lucide-react";
import { SupplierItem } from "../types";
import { api } from "../services/api";

interface SupplierManagementPageProps {
  currency: "INR" | "USD";
}

export const SupplierManagementPage: React.FC<SupplierManagementPageProps> = ({ currency }) => {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("Hotel Chain");
  const [formDestinations, setFormDestinations] = useState("");
  const [formPrice, setFormPrice] = useState(5000);
  const [formCapacity, setFormCapacity] = useState(400);
  const [formReliability, setFormReliability] = useState(96);
  const [formConditions, setFormConditions] = useState("Free cancellation up to 48 hours");
  const [formStatus, setFormStatus] = useState("Active");
  const [formEmail, setFormEmail] = useState("");

  const loadSuppliers = async () => {
    try {
      const data = await api.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormName("");
    setFormType("Hotel Chain");
    setFormDestinations("Goa, Mumbai, Delhi");
    setFormPrice(5200);
    setFormCapacity(500);
    setFormReliability(96.5);
    setFormConditions("Free cancellation up to 48 hours prior");
    setFormStatus("Active");
    setFormEmail("partner@travelallotment.com");
    setIsModalOpen(true);
  };

  const openEditModal = (s: SupplierItem) => {
    setEditingSupplier(s);
    setFormName(s.name);
    setFormType(s.supplier_type);
    setFormDestinations(s.destinations);
    setFormPrice(s.procurement_price_avg);
    setFormCapacity(s.available_capacity);
    setFormReliability(s.reliability_score);
    setFormConditions(s.cancellation_conditions);
    setFormStatus(s.status);
    setFormEmail(s.contact_email);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, {
          name: formName,
          supplier_type: formType,
          destinations: formDestinations,
          procurement_price_avg: Number(formPrice),
          available_capacity: Number(formCapacity),
          reliability_score: Number(formReliability),
          cancellation_conditions: formConditions,
          status: formStatus,
          contact_email: formEmail
        });
      } else {
        await api.createSupplier({
          name: formName,
          supplier_type: formType,
          destinations: formDestinations,
          procurement_price_avg: Number(formPrice),
          available_capacity: Number(formCapacity),
          reliability_score: Number(formReliability),
          cancellation_conditions: formConditions,
          status: formStatus,
          contact_email: formEmail
        });
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteSupplier(id);
      setConfirmDeleteId(null);
      loadSuppliers();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    if (currency === "USD") {
      const usd = amount / 85.0;
      return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const filtered = suppliers.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.destinations.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || s.supplier_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-400" />
            <span>Supplier & Allotment Partner Network</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain contracts, negotiated procurement rates, room/seat capacities, and SLA reliability scores.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="neon-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier Contract</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search supplier name or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="All">All Partner Types</option>
            <option value="Hotel Chain">Hotel Chain</option>
            <option value="Airline Partner">Airline Partner</option>
            <option value="Bedbank Wholesaler">Bedbank Wholesaler</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase font-mono text-slate-400 bg-white/5 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Partner Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Coverage</th>
                <th className="py-3 px-4 text-right">Avg Procure Price</th>
                <th className="py-3 px-4 text-center">Capacity</th>
                <th className="py-3 px-4 text-center">Reliability</th>
                <th className="py-3 px-4">Cancellation Terms</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-mono">
                    Loading supplier database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No suppliers match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition group">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{s.contact_email}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {s.supplier_type}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate text-[11px]">
                      {s.destinations}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-white font-medium">
                      {formatCurrency(s.procurement_price_avg)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-teal-400 font-bold">
                      {s.available_capacity} units
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {s.reliability_score}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-[200px] truncate text-[11px]">
                      {s.cancellation_conditions}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {s.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg border border-white/10 hover:border-teal-500/40 text-slate-300 hover:text-white transition"
                        title="Edit supplier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(s.id)}
                        className="p-1.5 rounded-lg border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 transition"
                        title="Delete supplier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 border border-rose-500/40">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>Confirm Supplier Contract Deletion</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Are you sure you want to remove this supplier from the active procurement network? This action will persist in the database.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Delete Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl p-6 border border-teal-500/40 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingSupplier ? "Edit Supplier Allotment Contract" : "Register New Supplier Contract"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Supplier Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="Hotel Chain">Hotel Chain</option>
                    <option value="Airline Partner">Airline Partner</option>
                    <option value="Bedbank Wholesaler">Bedbank Wholesaler</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Destination Coverage (comma separated)</label>
                <input
                  type="text"
                  required
                  value={formDestinations}
                  onChange={(e) => setFormDestinations(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Avg Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Allotment Capacity</label>
                  <input
                    type="number"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Reliability (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="100"
                    required
                    value={formReliability}
                    onChange={(e) => setFormReliability(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Cancellation Conditions</label>
                <input
                  type="text"
                  value={formConditions}
                  onChange={(e) => setFormConditions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Contact Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase text-[10px]">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Review">Under Review</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neon-btn px-5 py-2 rounded-xl font-semibold cursor-pointer"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
