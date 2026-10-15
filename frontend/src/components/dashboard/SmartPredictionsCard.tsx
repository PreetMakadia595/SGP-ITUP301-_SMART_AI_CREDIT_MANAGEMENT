import { useEffect, useState } from "react";
import {
  Sparkles,
  TrendingDown,
  Calendar,
  Zap,
  Clock,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getSmartPredictions } from "@/api/ingestion";
import { MLPredictionsResponse, UserFriendlyPrediction } from "@/types/ml";

interface SmartPredictionsCardProps {
  initialPredictions?: MLPredictionsResponse | null;
}

export default function SmartPredictionsCard({ initialPredictions }: SmartPredictionsCardProps) {
  const [predictions, setPredictions] = useState<MLPredictionsResponse | null>(initialPredictions || null);
  const [loading, setLoading] = useState(!initialPredictions);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchPredictions = async () => {
    try {
      setRefreshing(true);
      const data = await getSmartPredictions();
      setPredictions(data);
    } catch {
      // Backend unreachable — leave predictions as null, show empty state
      setPredictions(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialPredictions) {
      fetchPredictions();
    }
  }, [initialPredictions]);

  const displayList: UserFriendlyPrediction[] = predictions?.predictions_list ?? [];
  const isCalibrating = predictions?.status === "calibrating" || (!loading && displayList.length === 0);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "spending":       return <TrendingDown size={18} className="text-emerald-400" />;
      case "tomorrow_ai":   return <Zap size={18} className="text-cyan-400" />;
      case "renewal_risk":  return <Calendar size={18} className="text-amber-400" />;
      case "preferred_ai":  return <Sparkles size={18} className="text-purple-400" />;
      case "usage_pattern": return <Clock size={18} className="text-indigo-400" />;
      default:              return <ShieldCheck size={18} className="text-emerald-400" />;
    }
  };

  const getBadgeClass = (variant: string) => {
    switch (variant) {
      case "success": return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "warning": return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "brand":   return "bg-brand-600/20 text-brand-300 border-brand-500/30";
      default:        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
    }
  };

  return (
    <div className="glass-card p-6 border border-white/10 space-y-5 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
            <Lightbulb size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                AI Smart Predictions & Forecast
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isCalibrating ? "Calibrating" : "Live Forecast"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized predictive guidance generated continuously in the background.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPredictions}
            disabled={refreshing}
            className="text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin mr-1.5" : "mr-1.5"} />
            Update Predictions
          </Button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-surface-900/60 border border-white/5 space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white/5" />
                <div className="w-20 h-5 rounded-full bg-white/5" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 bg-white/5 rounded-lg w-4/5" />
                <div className="h-3 bg-white/5 rounded-lg w-full" />
                <div className="h-3 bg-white/5 rounded-lg w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calibrating / Empty State */}
      {!loading && isCalibrating && (
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="w-16 h-16 rounded-3xl bg-surface-800 border border-white/5 flex items-center justify-center">
            <BarChart2 size={28} className="text-slate-500" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-white">
              {predictions?.calibration_message ?? "We're still learning your AI usage patterns."}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Connect an AI platform or log your first session using the browser extension to receive personalized predictions.
            </p>
            {predictions?.records_count !== undefined && (
              <div className="mt-3 flex flex-col items-center gap-1">
                <p className="text-xs text-slate-500">
                  {predictions.records_count} / 5 real records collected
                </p>
                <div className="w-40 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (predictions.records_count / 5) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/platforms")}
            className="text-xs px-5 py-2 rounded-lg bg-brand-600/20 border border-brand-500/30 text-brand-300 hover:bg-brand-600/30 transition-all"
          >
            Connect an AI Tool →
          </button>
        </div>
      )}

      {/* Predictions Grid — only shown when real data exists */}
      {!loading && !isCalibrating && displayList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map((pred, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-surface-900/60 border border-white/5 hover:border-brand-500/30 hover:bg-surface-800/80 transition-all duration-200 flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-surface-800 border border-white/10 flex items-center justify-center">
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
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pred.message}</p>
                </div>
              </div>

              {pred.action_text && pred.action_url && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => navigate(pred.action_url!)}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>{pred.action_text}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
