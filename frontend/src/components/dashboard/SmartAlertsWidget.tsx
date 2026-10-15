/**
 * Dashboard Smart Alerts Banner Widget
 * Displays proactive, actionable alerts on the Dashboard for high-priority events.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  AlertOctagon,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getNotifications,
  markNotificationRead,
  NotificationItem,
} from "@/api/notifications";

export default function SmartAlertsWidget() {
  const [alerts, setAlerts] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const data = await getNotifications({ unread_only: true, limit: 3 });
      // Prioritize critical and warning notifications for dashboard display
      const priorityAlerts = data.filter(
        (n) => n.severity === "critical" || n.severity === "warning" || n.type === "better_ai_recommendation"
      );
      setAlerts(priorityAlerts.slice(0, 2));
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleDismiss = async (id: number) => {
    try {
      await markNotificationRead(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // Ignore
    }
  };

  if (loading || alerts.length === 0) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      {alerts.map((alert) => {
        const isCritical = alert.severity === "critical";
        const isWarning = alert.severity === "warning";

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${
              isCritical
                ? "bg-gradient-to-r from-red-950/40 via-surface-900 to-surface-900 border-red-500/40 shadow-glow-red"
                : isWarning
                ? "bg-gradient-to-r from-amber-950/40 via-surface-900 to-surface-900 border-amber-500/40"
                : "bg-gradient-to-r from-brand-950/40 via-surface-900 to-surface-900 border-brand-500/40 shadow-glow"
            }`}
          >
            {/* Left Content */}
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isCritical
                    ? "bg-red-500/20 text-red-400"
                    : isWarning
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-brand-500/20 text-brand-300"
                }`}
              >
                {isCritical ? (
                  <AlertOctagon size={20} />
                ) : isWarning ? (
                  <AlertTriangle size={20} />
                ) : (
                  <Sparkles size={20} />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                        : isWarning
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-brand-500/20 text-brand-300 border-brand-500/30"
                    }`}
                  >
                    {isCritical ? "Action Required" : isWarning ? "Budget & Billing Alert" : "Optimization Opportunity"}
                  </span>
                  <h4 className="text-sm font-extrabold text-white">{alert.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {alert.message}
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {alert.action_url && (
                <Link to={alert.action_url} onClick={() => handleDismiss(alert.id)}>
                  <Button
                    size="sm"
                    className={`text-xs font-bold ${
                      isCritical
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : isWarning
                        ? "bg-amber-600 hover:bg-amber-500 text-white"
                        : "btn-primary"
                    }`}
                  >
                    {alert.action_label || "Take Action"}
                    <ArrowRight size={13} className="ml-1.5" />
                  </Button>
                </Link>
              )}

              <button
                type="button"
                onClick={() => handleDismiss(alert.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Dismiss alert"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
