/**
 * Notifications Hub Page
 * Centralized notification management, email simulation viewer, channel filtering, and alert actions.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  Zap,
  BarChart2,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
  Settings,
  Mail,
  RefreshCw,
  Search,
  Check,
  X,
  Eye,
  Sliders,
  ShieldCheck,
  Layers,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  triggerNotificationScan,
  getEmailPreview,
  NotificationItem,
  EmailPreviewResponse,
} from "@/api/notifications";

const NOTIF_TYPES = [
  { id: "all", label: "All Alerts" },
  { id: "subscription_renewal", label: "Renewals", icon: "📅" },
  { id: "unused_subscription", label: "Unused Tools", icon: "⚠️" },
  { id: "budget_limit", label: "Budget Limits", icon: "💰" },
  { id: "better_ai_recommendation", label: "Better AI", icon: "⚡" },
  { id: "daily_summary", label: "Daily Summary", icon: "📊" },
  { id: "weekly_report", label: "Weekly Report", icon: "📈" },
  { id: "usage_trend", label: "Usage Trends", icon: "🔥" },
];

const CHANNELS = [
  { id: "all", label: "All Channels" },
  { id: "in_app", label: "In-App", icon: Bell },
  { id: "dashboard_alert", label: "Dashboard", icon: Layers },
  { id: "email", label: "Email", icon: Mail },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string>("all");
  const [activeType, setActiveType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [emailPreview, setEmailPreview] = useState<EmailPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScan = async () => {
    setRefreshing(true);
    try {
      await triggerNotificationScan();
      await loadData();
    } catch {
      setRefreshing(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Error
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Error
    }
  };

  const handleOpenEmailPreview = async (notif: NotificationItem) => {
    setPreviewLoading(true);
    setPreviewModalOpen(true);
    try {
      const preview = await getEmailPreview(notif.id, notif.type);
      setEmailPreview(preview);
    } catch {
      // Error
    } finally {
      setPreviewLoading(false);
    }
  };

  // Filter items
  const filtered = notifications.filter((item) => {
    const matchesChannel =
      activeChannel === "all" || item.channel === activeChannel || item.channel === "all";
    const matchesType = activeType === "all" || item.type === activeType;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const criticalCount = notifications.filter((n) => n.severity === "critical" || n.severity === "warning").length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "subscription_renewal":
        return <Calendar size={18} className="text-amber-400" />;
      case "unused_subscription":
        return <AlertOctagon size={18} className="text-red-400" />;
      case "budget_limit":
        return <AlertTriangle size={18} className="text-amber-400" />;
      case "better_ai_recommendation":
        return <Zap size={18} className="text-brand-400" />;
      case "daily_summary":
      case "weekly_report":
        return <BarChart2 size={18} className="text-emerald-400" />;
      case "usage_trend":
        return <TrendingUp size={18} className="text-cyan-400" />;
      default:
        return <Bell size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* ── Page Title Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
              <Bell size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Smart Notification Center
                {unreadCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-500 text-white">
                    {unreadCount} Unread
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Proactive alerts for subscription renewals, unused tools, budget thresholds, and weekly AI reports.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleScan}
            disabled={refreshing}
            className="text-xs border-white/10"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin mr-1.5" : "mr-1.5"} />
            Re-scan Alerts
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs border-white/10"
            >
              <CheckCheck size={13} className="mr-1.5 text-emerald-400" />
              Mark All Read
            </Button>
          )}

          <Link to="/settings">
            <Button size="sm" className="btn-primary text-xs">
              <Sliders size={13} className="mr-1.5" />
              Notification Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border border-white/10 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Active Notifications</span>
          <p className="text-2xl font-black text-white mt-1">{notifications.length}</p>
          <p className="text-[11px] text-slate-400">{unreadCount} requiring review</p>
        </div>

        <div className="glass-card p-5 border border-amber-500/30 bg-amber-950/10 space-y-1">
          <span className="text-xs font-semibold text-amber-300">Action Required & Warnings</span>
          <p className="text-2xl font-black text-amber-300 mt-1">{criticalCount}</p>
          <p className="text-[11px] text-amber-400/80">Renewals & budget thresholds</p>
        </div>

        <div className="glass-card p-5 border border-brand-500/30 bg-brand-950/10 space-y-1">
          <span className="text-xs font-semibold text-brand-300">Supported Channels</span>
          <p className="text-2xl font-black text-brand-300 mt-1">3 Delivery Modes</p>
          <p className="text-[11px] text-brand-400">In-App, Dashboard & Email</p>
        </div>

        <div className="glass-card p-5 border border-emerald-500/30 bg-emerald-950/10 space-y-1">
          <span className="text-xs font-semibold text-emerald-300">Smart Scan Engine</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">Automated</p>
          <p className="text-[11px] text-emerald-400/80">24/7 background credit monitoring</p>
        </div>
      </div>

      {/* ── Filter Bar & Channel Selector ── */}
      <div className="glass-card p-5 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Channel Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-900/80 rounded-xl border border-white/5 overflow-x-auto">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeChannel === ch.id
                      ? "bg-brand-600 text-white shadow-glow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {Icon && <Icon size={13} />}
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-2 bg-surface-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        {/* Topic Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/5 text-xs">
          {NOTIF_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`px-3 py-1 rounded-lg font-medium border transition-all whitespace-nowrap ${
                activeType === t.id
                  ? "bg-surface-700 border-brand-500/40 text-white"
                  : "bg-surface-900/40 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {t.icon && <span className="mr-1">{t.icon}</span>}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Notifications List ── */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const isCritical = item.severity === "critical";
            const isWarning = item.severity === "warning";
            const isSuccess = item.severity === "success";

            return (
              <div
                key={item.id}
                className={`glass-card p-5 border transition-all duration-200 relative group ${
                  item.is_read
                    ? "border-white/5 opacity-80 hover:opacity-100"
                    : isCritical
                    ? "border-red-500/30 bg-red-950/5 shadow-glow-red"
                    : isWarning
                    ? "border-amber-500/30 bg-amber-950/5"
                    : "border-brand-500/30 bg-brand-950/5"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Icon & Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-surface-800 border border-white/10 shrink-0 mt-0.5">
                      {getNotifIcon(item.type)}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Channel Badge */}
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 border border-white/5">
                          {item.channel}
                        </span>

                        {/* Severity Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            isCritical
                              ? "bg-red-500/20 text-red-300 border-red-500/30"
                              : isWarning
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : isSuccess
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-brand-500/20 text-brand-300 border-brand-500/30"
                          }`}
                        >
                          {item.severity}
                        </span>

                        <h3 className={`text-sm font-extrabold ${item.is_read ? "text-slate-300" : "text-white"}`}>
                          {item.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Email Preview Trigger */}
                    <button
                      type="button"
                      onClick={() => handleOpenEmailPreview(item)}
                      className="px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      title="Preview email delivery format"
                    >
                      <Mail size={13} className="text-brand-400" />
                      <span>Email View</span>
                    </button>

                    {/* Primary Action */}
                    {item.action_url && (
                      <Link to={item.action_url} onClick={() => handleMarkRead(item.id)}>
                        <Button size="sm" variant="outline" className="text-xs border-white/10">
                          {item.action_label || "View Details"}
                          <ArrowRight size={12} className="ml-1" />
                        </Button>
                      </Link>
                    )}

                    {!item.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-card p-12 text-center space-y-3 border border-white/10">
            <Inbox size={36} className="mx-auto text-slate-500 opacity-60" />
            <h3 className="text-base font-bold text-white">No notifications found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no active alerts matching your current filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* ── Email Preview Modal ── */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl glass-card border border-white/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">HTML Email Delivery Preview</h3>
                  <p className="text-[11px] text-slate-400">
                    Recipient: <span className="text-slate-200">{emailPreview?.recipient_email || "user@example.com"}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Email Body Frame */}
            <div className="flex-1 overflow-y-auto p-4 bg-surface-950">
              {previewLoading ? (
                <div className="py-20 text-center space-y-2">
                  <RefreshCw size={24} className="animate-spin mx-auto text-brand-400" />
                  <p className="text-xs text-slate-400">Rendering responsive email template...</p>
                </div>
              ) : emailPreview ? (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0f172a] shadow-inner p-2">
                  <div
                    dangerouslySetInnerHTML={{ __html: emailPreview.html_content }}
                    className="email-render-container"
                  />
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-white/10 bg-surface-800 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                <ShieldCheck size={14} /> Ready for SMTP & Webhook Dispatch
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewModalOpen(false)}
                className="text-xs border-white/10"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
