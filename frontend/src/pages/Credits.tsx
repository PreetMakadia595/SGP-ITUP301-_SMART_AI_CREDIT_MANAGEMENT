/**
 * Credits History & Tracking Page
 */
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  Edit,
  Layers,
  MessageSquare,
  Cpu,
  FileText,
  Calendar,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import CreditLogModal from "@/components/CreditLogModal";
import CreditUsageCharts from "@/components/CreditUsageCharts";
import {
  fetchCreditLogs,
  createCreditLog,
  updateCreditLog,
  deleteCreditLog,
  fetchCreditCharts,
} from "@/api/creditLogs";
import {
  CreditUsageLog,
  CreditUsageLogCreate,
  CreditLogFilters,
  CreditChartsResponse,
  PRESET_PLATFORMS,
  PRESET_TASK_TYPES,
} from "@/types/credit";
import clsx from "clsx";

export default function Credits() {
  // State
  const [logs, setLogs] = useState<CreditUsageLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [chartsData, setChartsData] = useState<CreditChartsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedTaskType, setSelectedTaskType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modal & Edit State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CreditUsageLog | null>(null);

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Fetch Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams: CreditLogFilters = {
        search: search.trim() || undefined,
        platform: selectedPlatform !== "All" ? selectedPlatform : undefined,
        task_type: selectedTaskType !== "All" ? selectedTaskType : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        skip: (page - 1) * limit,
        limit,
      };

      const [logRes, chartRes] = await Promise.all([
        fetchCreditLogs(filterParams),
        fetchCreditCharts(),
      ]);

      setLogs(logRes.items);
      setTotalCount(logRes.total);
      setChartsData(chartRes);
    } catch (err: unknown) {
      setError("Failed to load credit logs and analytics. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedPlatform, selectedTaskType, startDate, endDate, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Add/Edit Save
  const handleSaveLog = async (data: CreditUsageLogCreate) => {
    if (editingLog) {
      await updateCreditLog(editingLog.id, data);
    } else {
      await createCreditLog(data);
    }
    await loadData();
  };

  // Handle Delete
  const ConfirmDelete = async () => {
    if (!deletingId) return;
    setDeletingLoading(true);
    try {
      await deleteCreditLog(deletingId);
      setDeletingId(null);
      await loadData();
    } catch (err: unknown) {
      setError("Failed to delete record.");
    } finally {
      setDeletingLoading(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setSelectedPlatform("All");
    setSelectedTaskType("All");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters =
    search !== "" ||
    selectedPlatform !== "All" ||
    selectedTaskType !== "All" ||
    startDate !== "" ||
    endDate !== "";

  // Summary Metrics
  const totalCredits = chartsData?.total_credits ?? 0;
  const totalPrompts = chartsData?.total_prompts ?? 0;
  const totalTokens = chartsData?.total_tokens ?? 0;
  const totalLogsCount = chartsData?.total_logs ?? totalCount;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Credit Tracking & History</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              Live
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manually log, filter, analyze, and manage your AI service credit consumption
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="refresh-credits-btn"
            onClick={loadData}
            className="btn-secondary text-sm flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            id="add-credit-btn"
            onClick={() => {
              setEditingLog(null);
              setModalOpen(true);
            }}
            className="btn-primary text-sm flex items-center gap-2 shadow-glow"
          >
            <Plus size={16} />
            Add Usage Record
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          id="stat-credits-tracked"
          label="Total Credits Tracked"
          value={totalCredits.toFixed(2)}
          icon={Layers}
          iconColor="#7c3aed"
          loading={loading}
        />
        <StatCard
          id="stat-prompts-sent"
          label="Prompts Logged"
          value={totalPrompts.toLocaleString()}
          icon={MessageSquare}
          iconColor="#06b6d4"
          loading={loading}
        />
        <StatCard
          id="stat-tokens-used"
          label="Tokens Consumed"
          value={totalTokens.toLocaleString()}
          icon={Cpu}
          iconColor="#10b981"
          loading={loading}
        />
        <StatCard
          id="stat-total-records"
          label="Total History Entries"
          value={totalLogsCount}
          icon={FileText}
          iconColor="#f59e0b"
          loading={loading}
        />
      </div>

      {/* ── Daily / Weekly / Monthly Charts Section ── */}
      <CreditUsageCharts data={chartsData} loading={loading} />

      {/* ── Filter & Search Toolbar Card ── */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Filter size={16} className="text-brand-400" />
            <span>Filter & Search History</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium"
            >
              <X size={14} /> Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search project, model, notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field text-sm pl-9"
            />
          </div>

          {/* Platform */}
          <div>
            <select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                setPage(1);
              }}
              className="input-field text-sm"
            >
              <option value="All" className="bg-surface-800 text-white">
                All Platforms
              </option>
              {PRESET_PLATFORMS.map((p) => (
                <option key={p} value={p} className="bg-surface-800 text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Task Type */}
          <div>
            <select
              value={selectedTaskType}
              onChange={(e) => {
                setSelectedTaskType(e.target.value);
                setPage(1);
              }}
              className="input-field text-sm"
            >
              <option value="All" className="bg-surface-800 text-white">
                All Task Types
              </option>
              {PRESET_TASK_TYPES.map((t) => (
                <option key={t} value={t} className="bg-surface-800 text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start & End */}
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              title="From Date"
              className="input-field text-xs py-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              title="To Date"
              className="input-field text-xs py-2"
            />
          </div>
        </div>
      </div>

      {/* ── Usage Records History Table ── */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Usage Log History</h3>
          <span className="text-xs text-slate-400 font-medium">
            Showing {logs.length} of {totalCount} records
          </span>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-surface-700/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-700/50 flex items-center justify-center text-slate-500 mb-3">
              <Sparkles size={28} />
            </div>
            <p className="text-white text-base font-bold">No credit usage logs found</p>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              {hasActiveFilters
                ? "Try adjusting or clearing your filters to view more records."
                : "You haven't added any credit usage records yet. Click 'Add Usage Record' to get started."}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={() => {
                  setEditingLog(null);
                  setModalOpen(true);
                }}
                className="btn-primary text-xs mt-4 flex items-center gap-2"
              >
                <Plus size={14} /> Add First Record
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-surface-700/30 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4">Model</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Task Type</th>
                  <th className="py-3.5 px-4 text-right">Credits Used</th>
                  <th className="py-3.5 px-4 text-right">Prompts</th>
                  <th className="py-3.5 px-4 text-right">Tokens</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => {
                  let timeDisplay = "";
                  if (log.created_at) {
                    try {
                      const dt = new Date(log.created_at);
                      if (!isNaN(dt.getTime())) {
                        timeDisplay = " " + dt.toLocaleTimeString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        });
                      }
                    } catch (e) {
                      timeDisplay = "";
                    }
                  }

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3.5 px-6 text-slate-300 font-medium whitespace-nowrap font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-500" />
                          <span>{log.usage_date}{timeDisplay}</span>
                        </div>
                      </td>
                    <td className="py-3.5 px-4 text-white font-semibold whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-700 text-xs border border-white/5">
                        {log.platform}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-300 font-mono text-xs font-medium whitespace-nowrap">
                      {log.model}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">
                      <div className="max-w-[140px] truncate" title={log.project_name}>
                        {log.project_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {log.task_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-400 font-bold whitespace-nowrap">
                      {log.credits_used.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300 whitespace-nowrap">
                      {log.prompt_count}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-xs whitespace-nowrap">
                      {log.token_usage.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingLog(log);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                          title="Edit record"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingId(log.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalCount > limit && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 font-medium">
              Page {page} of {Math.ceil(totalCount / limit)}
            </span>
            <button
              onClick={() => setPage((p) => (p * limit < totalCount ? p + 1 : p))}
              disabled={page * limit >= totalCount}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <CreditLogModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingLog(null);
        }}
        onSave={handleSaveLog}
        initialData={editingLog}
      />

      {/* ── Delete Confirmation Dialog ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface-800 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Delete Credit Log</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this credit usage record? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="btn-secondary text-xs px-4 py-2"
                disabled={deletingLoading}
              >
                Cancel
              </button>
              <button
                onClick={ConfirmDelete}
                className="btn-danger text-xs px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold flex items-center gap-2"
                disabled={deletingLoading}
              >
                {deletingLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Delete Record"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
