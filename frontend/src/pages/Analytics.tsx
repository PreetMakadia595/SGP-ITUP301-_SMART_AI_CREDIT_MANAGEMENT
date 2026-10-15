/**
 * Predictive Analytics & AI Consumption Forecasting Page
 * Focuses purely on user-understandable predictions and actionable insights.
 */
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  BrainCircuit,
  Calendar,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getSmartPredictions } from "@/api/ingestion";
import { MLPredictionsResponse, UserFriendlyPrediction } from "@/types/ml";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Analytics() {
  const [data, setData] = useState<MLPredictionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSmartPredictions();
      setData(res);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  // Build forecast series from real API — show nothing if absent
  const forecastData = data?.forecast_series
    ? data.forecast_series.map((pt) => ({
        date: pt.date.slice(5),
        actual: pt.actual_credits,
        forecast: pt.predicted_credits,
        is_future: pt.is_future,
      }))
    : [];

  const hasForecastData = forecastData.length > 0;

  // Only show predictions from real API data
  const predictionsList = data?.predictions_list ?? [];
  const isCalibrating = data?.status === "calibrating" || (!loading && !data);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "spending":
        return <TrendingDown size={18} className="text-emerald-400" />;
      case "tomorrow_ai":
        return <Zap size={18} className="text-cyan-400" />;
      case "renewal_risk":
        return <Calendar size={18} className="text-amber-400" />;
      case "preferred_ai":
        return <Sparkles size={18} className="text-purple-400" />;
      case "usage_pattern":
        return <Clock size={18} className="text-indigo-400" />;
      case "budget_forecast":
      default:
        return <ShieldCheck size={18} className="text-emerald-400" />;
    }
  };

  const getBadgeClass = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "warning":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "brand":
        return "bg-brand-600/20 text-brand-300 border-brand-500/30";
      case "info":
      default:
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BrainCircuit className="text-brand-400" size={24} />
              AI Predictions & Consumption Forecast
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-600/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
              Proactive Insights
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated background predictions for upcoming AI requirements, future spending, and renewals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPredictions}
            className="btn-secondary flex items-center gap-2 text-xs py-2 px-3.5"
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Re-calculate Forecast
          </button>
        </div>
      </div>

      {/* ── 4 Top Prediction Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Future Monthly Spending */}
        <div className="glass-card p-5 border border-white/10 hover:border-brand-500/30 transition-all space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Future Monthly Spend</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {data?.future_spending_amount != null ? `₹${data.future_spending_amount.toFixed(2)}` : "—"}
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold">
            {data?.savings_amount != null ? `You may save ₹${data.savings_amount.toFixed(0)} this month.` : "Log usage to see savings forecast."}
          </p>
        </div>

        {/* Tomorrow's AI Forecast */}
        <div className="glass-card p-5 border border-white/10 hover:border-cyan-500/30 transition-all space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tomorrow's AI Need</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Zap size={16} />
            </div>
          </div>
          <p className="text-xl font-black text-white mt-2 truncate">
            {data?.recommended_tomorrow_ai ?? "—"}
          </p>
          <p className="text-[11px] text-cyan-300 font-medium truncate">
            {data?.recommended_tomorrow_ai ? `You'll likely need ${data.recommended_tomorrow_ai} tomorrow.` : "Insufficient usage data."}
          </p>
        </div>

        {/* Renewal Timeline */}
        <div className="glass-card p-5 border border-white/10 hover:border-amber-500/30 transition-all space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Next Renewal</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300 mt-2">
            {data?.renewal_alert_days != null ? `${data.renewal_alert_days} Days` : "—"}
          </p>
          <p className="text-[11px] text-amber-300/80 font-medium">
            {data?.renewal_platform && data?.renewal_alert_days != null
              ? `Renew ${data.renewal_platform} in ${data.renewal_alert_days} days.`
              : "No renewals detected yet."}
          </p>
        </div>

        {/* Budget Forecast */}
        <div className="glass-card p-5 border border-white/10 hover:border-emerald-500/30 transition-all space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Budget Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {data ? "Healthy" : "—"}
          </p>
          <p className="text-[11px] text-slate-400">
            {data?.future_spending_amount != null ? `₹${data.future_spending_amount.toFixed(0)} projected spend this month` : "Connect a platform to track budget."}
          </p>
        </div>
      </div>

      {/* ── 14-Day Future Consumption Forecast Chart ── */}
      <div className="glass-card p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-brand-400" size={18} />
              14-Day AI Consumption Trajectory & Forecast
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Past 7 days of actual consumption combined with the predicted usage for the upcoming week.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
              <span className="text-slate-300">Past Usage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
              <span className="text-brand-300 font-semibold">Predicted Forecast</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {!hasForecastData ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-800 border border-white/5 flex items-center justify-center">
                <TrendingUp size={22} className="text-slate-500" />
              </div>
              <p className="text-sm text-slate-400 font-medium">
                {isCalibrating ? "Collecting your usage data to build the forecast..." : "No forecast data yet."}
              </p>
              <p className="text-xs text-slate-500">Log at least 5 AI sessions to generate a 14-day prediction.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f1f2e",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: string) => [
                    val ? `${val} credits` : "N/A",
                    name === "actual" ? "Recorded Consumption" : "Predicted Consumption",
                  ]}
                />
                <Area type="monotone" dataKey="actual" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#actualGradient)" />
                <Area type="monotone" dataKey="forecast" stroke="#7c3aed" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#forecastGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── 6 Conversational Predictive Insights Cards ── */}
      <div className="space-y-4">
        <div className="border-b border-white/5 pb-2">
          <h3 className="text-base font-extrabold text-white tracking-tight">
            Detailed Predictive Outcomes
          </h3>
          <p className="text-xs text-slate-400">
            Actionable intelligence derived automatically from your past AI tasks and platform habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isCalibrating || predictionsList.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center gap-4 py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-800 border border-white/5 flex items-center justify-center">
                <BrainCircuit size={26} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {data?.calibration_message ?? "We're still learning your AI usage patterns."}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Log AI sessions via the browser extension or connect a platform to unlock personalized predictions.
                </p>
              </div>
            </div>
          ) : (
            predictionsList.map((pred, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surface-900/60 border border-white/5 hover:border-brand-500/30 hover:bg-surface-800/80 transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-surface-800 border border-white/10 flex items-center justify-center">
                    {getCategoryIcon(pred.category)}
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-semibold ${getBadgeClass(pred.badge_variant)}`}>
                    {pred.badge}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors leading-snug">
                    {pred.headline}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {pred.message}
                  </p>
                </div>
              </div>

              {pred.action_text && pred.action_url && (
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => navigate(pred.action_url!)}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 group-hover:translate-x-1 transition-all"
                  >
                    <span>{pred.action_text}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
