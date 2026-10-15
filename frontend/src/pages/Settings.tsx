/**
 * Settings Page — Embedded Profile, Security, and Smart Notification Preferences
 */
import { useEffect, useState } from "react";
import {
  User2,
  Shield,
  Bell,
  Palette,
  Mail,
  Layers,
  Sliders,
  Check,
  AlertTriangle,
  Calendar,
  AlertOctagon,
  Zap,
  BarChart2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import Profile from "@/pages/Profile";
import { useThemeStore, ThemeMode } from "@/store/themeStore";
import { Button } from "@/components/ui/button";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreference,
} from "@/api/notifications";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">("preferences");
  const { theme, setTheme } = useThemeStore();

  const [prefs, setPrefs] = useState<NotificationPreference>({
    id: 1,
    user_id: 1,
    notify_subscription_renewal: true,
    notify_unused_subscription: true,
    notify_budget_limit: true,
    notify_better_ai_recommendation: true,
    notify_daily_summary: true,
    notify_weekly_report: true,
    notify_usage_trends: true,
    channel_email: true,
    channel_in_app: true,
    channel_dashboard: true,
    budget_alert_threshold_pct: 80,
    unused_days_threshold: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getNotificationPreferences()
      .then((data) => setPrefs(data))
      .catch(() => {
        // Fallback default
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof NotificationPreference) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateNotificationPreferences(prefs);
      setPrefs(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in pb-20">
      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          id="settings-tab-preferences"
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "preferences"
              ? "bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-surface-800"
          }`}
        >
          <Bell size={15} />
          Notification Preferences
        </button>
        <button
          id="settings-tab-profile"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "profile"
              ? "bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-surface-800"
          }`}
        >
          <User2 size={15} />
          Profile & Security
        </button>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "profile" ? (
        <Profile />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* ── 1. Delivery Channels Matrix ── */}
          <div className="glass-card p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center text-brand-400">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delivery Channels</h3>
                  <p className="text-xs text-slate-400">Choose where you want to receive active alerts.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  key: "channel_in_app" as const,
                  label: "In-App Notifications",
                  desc: "Live notification popover in navigation bar",
                  icon: Bell,
                },
                {
                  key: "channel_dashboard" as const,
                  label: "Dashboard Alerts",
                  desc: "Urgent banner widgets on main overview",
                  icon: Layers,
                },
                {
                  key: "channel_email" as const,
                  label: "Email Delivery",
                  desc: "Formatted HTML email digests & instant alerts",
                  icon: Mail,
                },
              ].map(({ key, label, desc, icon: Icon }) => (
                <div
                  key={key}
                  onClick={() => handleToggle(key)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    prefs[key]
                      ? "bg-brand-600/20 border-brand-500/50 text-white shadow-glow-sm"
                      : "bg-surface-900/40 border-white/5 text-slate-400 hover:bg-surface-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={18} className={prefs[key] ? "text-brand-300" : "text-slate-500"} />
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        prefs[key] ? "bg-brand-600 border-brand-500 text-white" : "border-white/20"
                      }`}
                    >
                      {prefs[key] && <Check size={12} />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{label}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 2. Alert Topics & Triggers ── */}
          <div className="glass-card p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center text-brand-400">
                  <Bell size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Alert Topics & Notifications</h3>
                  <p className="text-xs text-slate-400">Configure which automated triggers to evaluate.</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/5 space-y-1">
              {[
                {
                  key: "notify_subscription_renewal" as const,
                  label: "Subscription Renewal Alerts",
                  desc: "Get notified 3 days before any AI platform auto-bills or renews.",
                  icon: Calendar,
                  color: "text-amber-400",
                },
                {
                  key: "notify_unused_subscription" as const,
                  label: "Unused Subscription Warnings",
                  desc: `Identify subscriptions with 0 prompts in the last ${prefs.unused_days_threshold} days to stop wasted spend.`,
                  icon: AlertOctagon,
                  color: "text-red-400",
                },
                {
                  key: "notify_budget_limit" as const,
                  label: "Budget Limit & Threshold Alerts",
                  desc: `Warn when total monthly spend approaches ${prefs.budget_alert_threshold_pct}% of your target limit.`,
                  icon: AlertTriangle,
                  color: "text-amber-400",
                },
                {
                  key: "notify_better_ai_recommendation" as const,
                  label: "Better AI Recommendations",
                  desc: "Suggestions when cheaper or more accurate AI models can handle your tasks.",
                  icon: Zap,
                  color: "text-brand-400",
                },
                {
                  key: "notify_daily_summary" as const,
                  label: "Daily AI Activity Summary",
                  desc: "Daily end-of-day recap of prompts executed, tokens processed, and spend.",
                  icon: BarChart2,
                  color: "text-emerald-400",
                },
                {
                  key: "notify_weekly_report" as const,
                  label: "Weekly AI Efficiency Report",
                  desc: "Comprehensive weekly digest with productivity score (0-100) and net savings.",
                  icon: Sparkles,
                  color: "text-purple-400",
                },
                {
                  key: "notify_usage_trends" as const,
                  label: "Usage Trends & Surge Detection",
                  desc: "Alerts when weekly prompt volume or token consumption spikes unusually.",
                  icon: TrendingUp,
                  color: "text-cyan-400",
                },
              ].map(({ key, label, desc, icon: Icon, color }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-3.5 group cursor-pointer"
                  onClick={() => handleToggle(key)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-surface-800 border border-white/5 shrink-0 mt-0.5">
                      <Icon size={16} className={color} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        {label}
                      </p>
                      <p className="text-[11px] text-slate-400">{desc}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={prefs[key]}
                      onChange={() => handleToggle(key)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-surface-700 rounded-full peer peer-checked:bg-brand-600 transition-colors duration-200" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. Custom Threshold Controls ── */}
          <div className="glass-card p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center text-brand-400">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Smart Threshold Triggers</h3>
                  <p className="text-xs text-slate-400">Fine-tune automated alert boundaries.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Budget Alert % */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">Budget Limit Warning (%)</label>
                  <span className="text-xs font-extrabold text-amber-400 font-mono">
                    {prefs.budget_alert_threshold_pct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={prefs.budget_alert_threshold_pct}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, budget_alert_threshold_pct: Number(e.target.value) }))
                  }
                  className="w-full h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <p className="text-[10px] text-slate-400">
                  Trigger alert when spend exceeds {prefs.budget_alert_threshold_pct}% of target monthly budget.
                </p>
              </div>

              {/* Unused Days */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">Unused Tool Inactivity Days</label>
                  <span className="text-xs font-extrabold text-red-400 font-mono">
                    {prefs.unused_days_threshold} Days
                  </span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="30"
                  step="1"
                  value={prefs.unused_days_threshold}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, unused_days_threshold: Number(e.target.value) }))
                  }
                  className="w-full h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <p className="text-[10px] text-slate-400">
                  Flag subscription as unused if zero activity for {prefs.unused_days_threshold} consecutive days.
                </p>
              </div>
            </div>
          </div>

          {/* ── 4. Appearance & Theme ── */}
          <div className="glass-card p-6 border border-white/10 space-y-3">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center text-brand-400">
                <Palette size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Appearance & Theme</h3>
                <p className="text-xs text-slate-400">Toggle dark or light mode workspace.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-medium text-slate-200">Theme Mode</p>
                <p className="text-[11px] text-slate-500">Currently active: {theme.toUpperCase()}</p>
              </div>
              <div className="flex gap-2">
                {(["dark", "light"] as ThemeMode[]).map((t) => (
                  <button
                    key={t}
                    id={`settings-theme-${t}-btn`}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      theme === t
                        ? "bg-brand-600/20 border-brand-600/40 text-brand-300 shadow-glow"
                        : "bg-surface-700 border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Save Bar ── */}
          <div className="flex items-center justify-between p-4 rounded-xl glass-card border border-white/10">
            <p className="text-xs text-slate-400">
              {savedSuccess ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={14} /> Preferences saved successfully!
                </span>
              ) : (
                "Remember to save any changes to your notification preferences."
              )}
            </p>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-2"
            >
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
              Save Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
