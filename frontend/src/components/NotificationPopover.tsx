/**
 * In-App Notification Center Popover
 */
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  X,
  AlertTriangle,
  AlertOctagon,
  Zap,
  BarChart2,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
  Settings,
  ExternalLink,
  ShieldCheck,
  Mail,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  NotificationItem,
} from "@/api/notifications";

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (unreadCount: number) => void;
}

export default function NotificationPopover({
  isOpen,
  onClose,
  onCountChange,
}: NotificationPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      if (onCountChange) onCountChange(unread);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      const unread = notifications.filter((n) => n.id !== id && !n.is_read).length;
      if (onCountChange) onCountChange(unread);
    } catch {
      // Error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      if (onCountChange) onCountChange(0);
    } catch {
      // Error
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const unread = notifications.filter((n) => n.id !== id && !n.is_read).length;
      if (onCountChange) onCountChange(unread);
    } catch {
      // Error
    }
  };

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.is_read;
    if (activeFilter === "renewals") return n.type === "subscription_renewal" || n.type === "unused_subscription";
    if (activeFilter === "budget") return n.type === "budget_limit";
    if (activeFilter === "ai") return n.type === "better_ai_recommendation";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotifIcon = (type: string, severity: string) => {
    switch (type) {
      case "subscription_renewal":
        return <Calendar size={16} className="text-amber-400" />;
      case "unused_subscription":
        return <AlertOctagon size={16} className="text-red-400" />;
      case "budget_limit":
        return <AlertTriangle size={16} className="text-amber-400" />;
      case "better_ai_recommendation":
        return <Zap size={16} className="text-brand-400" />;
      case "daily_summary":
      case "weekly_report":
        return <BarChart2 size={16} className="text-emerald-400" />;
      case "usage_trend":
        return <TrendingUp size={16} className="text-cyan-400" />;
      default:
        return <Bell size={16} className="text-slate-400" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-12 w-[380px] sm:w-[440px] glass-card border border-white/10 shadow-2xl z-50 rounded-2xl overflow-hidden animate-fade-in flex flex-col max-h-[560px]"
    >
      {/* ── Popover Header ── */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-800/90">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">
            <Bell size={15} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand-500 text-white">
                  {unreadCount} new
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Quick Filter Tabs ── */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-surface-900/60 overflow-x-auto text-[11px]">
        {[
          { id: "all", label: "All" },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "renewals", label: "Renewals" },
          { id: "budget", label: "Budget" },
          { id: "ai", label: "AI Suggestions" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeFilter === tab.id
                ? "bg-brand-600/30 text-white border border-brand-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Notifications List ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-white/5">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl transition-all relative group pt-3 ${
                item.is_read
                  ? "bg-surface-900/30 opacity-75 hover:opacity-100"
                  : "bg-surface-800/80 border border-brand-500/20 shadow-glow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-surface-700/60 shrink-0 mt-0.5">
                  {getNotifIcon(item.type, item.severity)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-xs font-bold leading-tight ${item.is_read ? "text-slate-300" : "text-white"}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between pt-1.5">
                    {item.action_url ? (
                      <Link
                        to={item.action_url}
                        onClick={() => {
                          handleMarkRead(item.id);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                      >
                        {item.action_label || "View Details"}
                        <ArrowRight size={11} />
                      </Link>
                    ) : <span />}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!item.is_read && (
                        <button
                          onClick={() => handleMarkRead(item.id)}
                          className="p-1 text-[10px] text-slate-400 hover:text-emerald-400"
                          title="Mark as read"
                        >
                          <CheckCheck size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-[10px] text-slate-400 hover:text-red-400"
                        title="Dismiss alert"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center space-y-2">
            <ShieldCheck size={28} className="mx-auto text-slate-500 opacity-60" />
            <p className="text-xs font-semibold text-slate-400">All caught up!</p>
            <p className="text-[11px] text-slate-500">No active alerts in this category.</p>
          </div>
        )}
      </div>

      {/* ── Popover Footer ── */}
      <div className="p-3 border-t border-white/5 bg-surface-900/80 flex items-center justify-between text-xs">
        <Link
          to="/notifications"
          onClick={onClose}
          className="font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
        >
          <span>View All Notifications Hub</span>
          <ArrowRight size={12} />
        </Link>

        <Link
          to="/settings"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          title="Notification Preferences"
        >
          <Settings size={13} />
          <span>Preferences</span>
        </Link>
      </div>
    </div>
  );
}
