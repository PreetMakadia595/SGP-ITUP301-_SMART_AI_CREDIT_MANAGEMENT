/**
 * AI Account Manager Page
 * Allows users to add, manage, edit, search, filter, and monitor AI platform subscriptions and accounts.
 */
import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Key,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Sparkles,
  IndianRupee,
  RefreshCw,
  Layers,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List as ListIcon,
  Bot,
  Zap,
  FileText,
} from "lucide-react";

import {
  getSupportedPlatforms,
  getUserPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
  revealPlatformApiKey,
} from "@/api/platforms";

import {
  SupportedPlatform,
  UserPlatform,
  PlatformUpdatePayload,
} from "@/types/platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Fallback catalog of 8 supported AI services
const FALLBACK_SUPPORTED: SupportedPlatform[] = [
  { name: "ChatGPT", slug: "chatgpt", color: "#10A37F", default_plan: "Plus", default_cost: 20.0, default_credits: 1000.0, description: "OpenAI conversational and reasoning models" },
  { name: "Claude", slug: "claude", color: "#D4A96A", default_plan: "Pro", default_cost: 20.0, default_credits: 1000.0, description: "Anthropic AI assistant for reasoning and code" },
  { name: "Gemini", slug: "gemini", color: "#4285F4", default_plan: "Advanced", default_cost: 19.99, default_credits: 1000.0, description: "Google multimodal AI ecosystem and APIs" },
  { name: "Cursor", slug: "cursor", color: "#7C3AED", default_plan: "Pro", default_cost: 20.0, default_credits: 500.0, description: "AI-first code editor and codebase indexing" },
  { name: "GitHub Copilot", slug: "github-copilot", color: "#6E7681", default_plan: "Individual", default_cost: 10.0, default_credits: 2000.0, description: "Real-time AI inline code completions" },
  { name: "Perplexity", slug: "perplexity", color: "#20B2AA", default_plan: "Pro", default_cost: 20.0, default_credits: 600.0, description: "AI answer engine with live web search citations" },
  { name: "Lovable", slug: "lovable", color: "#EC4899", default_plan: "Starter", default_cost: 20.0, default_credits: 100.0, description: "Full-stack web application builder" },
  { name: "Bolt", slug: "bolt", color: "#F59E0B", default_plan: "Pro", default_cost: 20.0, default_credits: 10000.0, description: "In-browser AI web development environment" },
];

export default function Platforms() {
  const [platforms, setPlatforms] = useState<UserPlatform[]>([]);
  const [supportedCatalog, setSupportedCatalog] = useState<SupportedPlatform[]>(FALLBACK_SUPPORTED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<UserPlatform | null>(null);

  // Reveal Key Modal State
  const [revealKeyData, setRevealKeyData] = useState<{ id: number; name: string; key: string | null } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    platform_name: string;
    subscription_plan: string;
    monthly_credits: number;
    remaining_credits: number;
    renewal_date: string;
    monthly_cost: number;
    api_key: string;
    status: string;
    notes: string;
  }>({
    platform_name: "ChatGPT",
    subscription_plan: "Pro",
    monthly_credits: 1000,
    remaining_credits: 1000,
    renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    monthly_cost: 20.0,
    api_key: "",
    status: "Active",
    notes: "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load Platforms Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userPlats, catalog] = await Promise.all([
        getUserPlatforms(searchQuery, selectedStatusFilter),
        getSupportedPlatforms().catch(() => FALLBACK_SUPPORTED),
      ]);
      setPlatforms(userPlats);
      if (catalog && catalog.length > 0) setSupportedCatalog(catalog);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load AI platform subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedStatusFilter]);

  // Preset Selection Helper
  const handleSelectSupportedPlatform = (sup: SupportedPlatform) => {
    const defaultRenewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setFormData((prev) => ({
      ...prev,
      platform_name: sup.name,
      subscription_plan: sup.default_plan,
      monthly_credits: sup.default_credits,
      remaining_credits: sup.default_credits,
      monthly_cost: sup.default_cost,
      renewal_date: defaultRenewal,
    }));
  };

  // Client Filtered Platforms fallback
  const filteredPlatforms = useMemo(() => {
    return platforms.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.platform_name.toLowerCase().includes(query) ||
        p.subscription_plan.toLowerCase().includes(query) ||
        (p.notes && p.notes.toLowerCase().includes(query));

      const matchesStatus =
        selectedStatusFilter === "all" ||
        p.status.toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [platforms, searchQuery, selectedStatusFilter]);

  // Key Summary Stats
  const stats = useMemo(() => {
    const totalCount = platforms.length;
    const activeCount = platforms.filter((p) => p.status.toLowerCase() === "active").length;
    const inactiveCount = platforms.filter((p) => p.status.toLowerCase() === "inactive").length;
    const totalCost = platforms.reduce((acc, p) => acc + (p.monthly_cost || 0), 0);
    return { totalCount, activeCount, inactiveCount, totalCost };
  }, [platforms]);

  // Open Add Modal
  const openAddModal = () => {
    const defaultSup = supportedCatalog[0] || FALLBACK_SUPPORTED[0];
    handleSelectSupportedPlatform(defaultSup);
    setFormData((prev) => ({ ...prev, api_key: "", status: "Active", notes: "" }));
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p: UserPlatform) => {
    setSelectedPlatform(p);
    setFormData({
      platform_name: p.platform_name,
      subscription_plan: p.subscription_plan,
      monthly_credits: p.monthly_credits,
      remaining_credits: p.remaining_credits,
      renewal_date: p.renewal_date,
      monthly_cost: p.monthly_cost,
      api_key: "",
      status: p.status,
      notes: p.notes || "",
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (p: UserPlatform) => {
    setSelectedPlatform(p);
    setIsDeleteModalOpen(true);
  };

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await createPlatform(formData);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to create subscription entry");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const payload: PlatformUpdatePayload = {
        platform_name: formData.platform_name,
        subscription_plan: formData.subscription_plan,
        monthly_credits: formData.monthly_credits,
        remaining_credits: formData.remaining_credits,
        renewal_date: formData.renewal_date,
        monthly_cost: formData.monthly_cost,
        status: formData.status,
        notes: formData.notes,
      };
      if (formData.api_key.trim() !== "") {
        payload.api_key = formData.api_key;
      }
      await updatePlatform(selectedPlatform.id, payload);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to update subscription entry");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!selectedPlatform) return;
    setSubmitting(true);
    try {
      await deletePlatform(selectedPlatform.id);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete platform");
    } finally {
      setSubmitting(false);
    }
  };

  // Reveal API Key Action
  const handleRevealKey = async (p: UserPlatform) => {
    try {
      const data = await revealPlatformApiKey(p.id);
      setRevealKeyData({ id: p.id, name: p.platform_name, key: data.api_key || null });
      setCopiedKey(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to decrypt API key");
    }
  };

  const handleCopyKey = () => {
    if (revealKeyData?.key) {
      navigator.clipboard.writeText(revealKeyData.key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const getPlatformMeta = (name: string): SupportedPlatform => {
    return (
      supportedCatalog.find((s) => s.name.toLowerCase() === name.toLowerCase()) || {
        name,
        slug: name.toLowerCase(),
        color: "#6366F1",
        default_plan: "Pro",
        default_cost: 20,
        default_credits: 1000,
        description: "AI Platform",
      }
    );
  };

  const getStatusBadge = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    if (s === "active") {
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 size={12} /> Active
        </Badge>
      );
    }
    if (s === "inactive" || s === "expired" || s === "paused") {
      return (
        <Badge variant="secondary" className="gap-1 text-slate-400">
          <XCircle size={12} /> Inactive
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="gap-1">
        <AlertTriangle size={12} /> {statusStr}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Layers className="text-white" size={22} />
            </div>
            AI Account Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your AI tool subscriptions, monthly costs, renewal dates, and status (ChatGPT, Claude, Gemini, Cursor, Copilot, Perplexity, Lovable, Bolt).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} />
            Refresh
          </Button>

          <Button id="add-platform-btn" onClick={openAddModal}>
            <Plus size={16} className="mr-1.5" />
            Add AI Subscription
          </Button>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-surface-800/80 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Managed AI Tools</span>
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Bot size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.totalCount}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> {stats.activeCount} Active Subscriptions
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface-800/80 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Monthly Cost</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <IndianRupee size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            ₹{stats.totalCost.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ mo</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across all registered AI tools</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface-800/80 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Subscriptions</span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Zap size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.activeCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">{stats.inactiveCount} Inactive or Paused</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface-800/80 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Supported Providers</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">8 Catalog Tools</p>
          <p className="text-[11px] text-amber-300 mt-1">ChatGPT, Claude, Gemini, Cursor, etc.</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-800/80 border border-white/10 backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            id="search-platforms-input"
            placeholder="Search platform name, plan, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "active", "inactive"].map((filter) => (
            <button
              key={filter}
              id={`filter-${filter}-btn`}
              onClick={() => setSelectedStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                selectedStatusFilter === filter
                  ? "bg-brand-600 text-white shadow-glow"
                  : "bg-surface-700/50 text-slate-400 hover:bg-surface-700 hover:text-white"
              }`}
            >
              {filter === "all" ? "All Statuses" : filter}
            </button>
          ))}

          <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface-900/80 p-1 rounded-xl border border-white/5">
            <button
              id="view-grid-btn"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-surface-700 text-brand-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              id="view-table-btn"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-surface-700 text-brand-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Subscriptions Display ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-surface-800/80 p-6 animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-700 rounded w-2/3" />
                  <div className="h-3 bg-surface-700/60 rounded w-1/3" />
                </div>
              </div>
              <div className="h-10 bg-surface-700 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredPlatforms.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-surface-800/60 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-brand flex items-center justify-center mx-auto shadow-glow opacity-80">
            <Bot size={32} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">No AI Subscriptions Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || selectedStatusFilter !== "all"
              ? "No platform subscription matches your search query or status filter. Try clearing filters."
              : "Get started by adding your AI tool subscriptions (ChatGPT, Claude, Gemini, Cursor, Copilot, Perplexity, Lovable, Bolt)."}
          </p>
          <Button onClick={openAddModal}>
            <Plus size={16} className="mr-1.5" /> Add AI Subscription
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlatforms.map((p) => {
            const meta = getPlatformMeta(p.platform_name);

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-surface-800/90 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0"
                        style={{ backgroundColor: meta.color }}
                      >
                        {p.platform_name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">
                          {p.platform_name}
                        </h3>
                        <Badge variant="outline" className="text-[11px] mt-0.5">
                          {p.subscription_plan}
                        </Badge>
                      </div>
                    </div>

                    <div>{getStatusBadge(p.status)}</div>
                  </div>

                  {/* Pricing & Renewal Details */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-900/60 border border-white/5 text-xs">
                    <div>
                      <span className="block text-slate-500 font-medium">Monthly Cost</span>
                      <span className="font-bold text-white text-sm">₹{p.monthly_cost.toFixed(2)}/mo</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-medium">Renewal Date</span>
                      <span className="font-semibold text-slate-200">{p.renewal_date}</span>
                    </div>
                  </div>

                  {/* Notes Snippet if present */}
                  {p.notes && (
                    <div className="p-3 rounded-xl bg-surface-900/40 border border-white/5 text-xs text-slate-300 space-y-1">
                      <span className="font-semibold text-slate-400 flex items-center gap-1">
                        <FileText size={12} /> Notes:
                      </span>
                      <p className="line-clamp-2 text-slate-300 leading-relaxed">{p.notes}</p>
                    </div>
                  )}

                  {/* API Key Box */}
                  <div className="p-2.5 rounded-xl bg-surface-900/80 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <Key size={14} className="text-slate-500 flex-shrink-0" />
                      <span className="text-xs font-mono text-slate-300 truncate">
                        {p.masked_api_key || "No API key attached"}
                      </span>
                    </div>
                    {p.masked_api_key && (
                      <button
                        onClick={() => handleRevealKey(p)}
                        className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 flex-shrink-0 ml-2"
                      >
                        <Eye size={12} /> Reveal
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(p)}
                    className="flex-1"
                  >
                    <Edit2 size={13} className="mr-1.5" /> Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openDeleteModal(p)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table View ── */
        <div className="rounded-2xl border border-white/10 bg-surface-800/80 backdrop-blur-xl overflow-x-auto shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-surface-900/60 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Platform Name</th>
                <th className="py-3.5 px-4">Subscription Type</th>
                <th className="py-3.5 px-4">Monthly Cost</th>
                <th className="py-3.5 px-4">Renewal Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredPlatforms.map((p) => {
                const meta = getPlatformMeta(p.platform_name);

                return (
                  <tr key={p.id} className="hover:bg-surface-700/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: meta.color }}
                        >
                          {p.platform_name[0]}
                        </div>
                        <span>{p.platform_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <Badge variant="outline">{p.subscription_plan}</Badge>
                    </td>
                    <td className="py-4 px-4 text-white font-bold">₹{p.monthly_cost.toFixed(2)}</td>
                    <td className="py-4 px-4 text-slate-300">{p.renewal_date}</td>
                    <td className="py-4 px-4">{getStatusBadge(p.status)}</td>
                    <td className="py-4 px-4 text-slate-400 max-w-xs truncate">{p.notes || "—"}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(p)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => openDeleteModal(p)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD PLATFORM MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-surface-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-surface-900/60">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="text-brand-400" size={18} /> Add AI Service Subscription
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  {formError}
                </div>
              )}

              {/* Supported Platforms Preset Selector */}
              <div>
                <label className="block font-semibold text-slate-300 mb-2">
                  Select AI Service Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {supportedCatalog.map((sup) => {
                    const isSelected = formData.platform_name === sup.name;
                    return (
                      <button
                        key={sup.name}
                        type="button"
                        onClick={() => handleSelectSupportedPlatform(sup)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-brand-600/20 border-brand-500 text-white shadow-glow-sm"
                            : "bg-surface-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-lg mx-auto flex items-center justify-center text-white font-bold text-xs mb-1"
                          style={{ backgroundColor: sup.color }}
                        >
                          {sup.name[0]}
                        </div>
                        <span className="font-semibold block truncate">{sup.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Platform Name
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.platform_name}
                    onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                    placeholder="e.g. ChatGPT, Claude, Cursor"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Subscription Type / Plan
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.subscription_plan}
                    onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                    placeholder="Free, Pro, Team, Enterprise"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Monthly Cost (₹ INR)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.monthly_cost}
                    onChange={(e) => setFormData({ ...formData, monthly_cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Renewal Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.renewal_date}
                    onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Subscription Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-surface-900/60 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Optional API Key
                  </label>
                  <Input
                    type="password"
                    placeholder="e.g. sk-proj-..."
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Custom Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Shared team key, auto-renews on corporate card..."
                  className="flex w-full rounded-xl border border-white/10 bg-surface-900/60 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save AI Subscription"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PLATFORM MODAL ── */}
      {isEditModalOpen && selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-surface-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-surface-900/60">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="text-brand-400" size={18} /> Edit {selectedPlatform.platform_name}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Platform Name
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.platform_name}
                    onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Subscription Type / Plan
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.subscription_plan}
                    onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Monthly Cost (₹ INR)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.monthly_cost}
                    onChange={(e) => setFormData({ ...formData, monthly_cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Renewal Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.renewal_date}
                    onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Subscription Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-surface-900/60 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Update API Key
                  </label>
                  <Input
                    type="password"
                    placeholder="Leave blank to keep existing key"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Custom Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Custom subscription notes..."
                  className="flex w-full rounded-xl border border-white/10 bg-surface-900/60 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Updating..." : "Update Subscription"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {isDeleteModalOpen && selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface-800 p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-rose-400" size={18} /> Delete Subscription
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{selectedPlatform.platform_name}</strong> ({selectedPlatform.subscription_plan}) from your workspace?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteSubmit} disabled={submitting}>
                {submitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVEAL API KEY MODAL ── */}
      {revealKeyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface-800 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="text-brand-400" size={18} /> {revealKeyData.name} API Key
              </h3>
              <button onClick={() => setRevealKeyData(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-surface-900 border border-white/10 flex items-center justify-between gap-2 font-mono text-slate-200">
              <span className="truncate">{revealKeyData.key || "No key stored"}</span>
              {revealKeyData.key && (
                <Button size="sm" variant="ghost" onClick={handleCopyKey}>
                  {copiedKey ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
