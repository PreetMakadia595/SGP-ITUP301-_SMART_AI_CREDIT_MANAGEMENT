/**
 * Machine Learning Analytics & Forecasting Dashboard Page
 */
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import {
  BrainCircuit, Calendar, RefreshCw, AlertTriangle,
  TrendingUp, BarChart3, HelpCircle, CheckCircle2, ShieldCheck
} from "lucide-react";
import { getMLAnalytics } from "@/api/ingestion";

interface ModelMetric {
  algorithm_name: string;
  mae: number;
  rmse: number;
  r2_score: number;
  is_best: boolean;
}

interface ForecastPoint {
  date: string;
  actual_credits: number | null;
  predicted_credits: number;
  is_future: boolean;
}

interface FeatureImportance {
  feature: string;
  importance: number;
}

interface MLAnalyticsData {
  tomorrow_usage: number;
  weekly_usage: number;
  monthly_cost: number;
  credit_exhaustion_date: string;
  days_until_exhaustion: number;
  best_model_name: string;
  models_evaluation: ModelMetric[];
  forecast_series: ForecastPoint[];
  feature_importances: FeatureImportance[];
}

export default function Analytics() {
  const [data, setData] = useState<MLAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMLAnalytics();
      setData(res);
    } catch (err) {
      setError("Failed to fetch ML analytics predictions. Please ensure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="text-brand-400" size={24} />
            Machine Learning Insights & Forecasting
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Regression metrics comparison and consumption forecasting models
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="btn-secondary flex items-center gap-2 text-sm"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Re-train Models
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 h-28 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : data ? (
        <>
          {/* Top ML Analytics Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Tomorrow's Forecast</span>
              <p className="text-2xl font-bold text-purple-300">
                {data.tomorrow_usage} <span className="text-xs text-slate-400">credits</span>
              </p>
              <p className="text-[10px] text-slate-500">Predicted daily spend rate</p>
            </div>
            <div className="glass-card p-5 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Weekly Forecast</span>
              <p className="text-2xl font-bold text-indigo-300">
                {data.weekly_usage} <span className="text-xs text-slate-400">credits</span>
              </p>
              <p className="text-[10px] text-slate-500">Aggregated next 7 days</p>
            </div>
            <div className="glass-card p-5 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Monthly Spending Forecast</span>
              <p className="text-2xl font-bold text-emerald-400">
                ${data.monthly_cost}
              </p>
              <p className="text-[10px] text-slate-500">Run-rate cost estimation</p>
            </div>
            <div className="glass-card p-5 border border-purple-500/30 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 space-y-1">
              <span className="text-xs text-purple-300">Credit Exhaustion Date</span>
              <p className="text-2xl font-bold text-amber-400 flex items-center gap-1.5">
                <Calendar size={20} />
                {data.credit_exhaustion_date}
              </p>
              <p className="text-xs text-amber-300 font-medium">
                ~{data.days_until_exhaustion} days remaining
              </p>
            </div>
          </div>

          {/* Forecast Series Chart */}
          <div className="glass-card p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="text-brand-400" size={18} />
                  14-Day Future Consumption Forecast
                </h3>
                <p className="text-xs text-slate-400">
                  Historical usage trends merged with auto-regression predictions
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-300 text-xs font-semibold">
                Model: {data.best_model_name}
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.forecast_series} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(tick) => tick.slice(5)}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f1f2a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="actual_credits"
                    name="Actual Consumption"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted_credits"
                    name="ML Predicted Forecast"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Algorithm Model Comparison Table */}
            <div className="glass-card p-6 border border-white/5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="text-brand-400" size={18} />
                  Algorithm Evaluation & Comparison
                </h3>
                <p className="text-xs text-slate-400">
                  Performance validation metrics calculated across regression algorithms
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Algorithm</th>
                      <th className="py-3 px-3 text-right">MAE</th>
                      <th className="py-3 px-3 text-right">RMSE</th>
                      <th className="py-3 px-3 text-right">R² Score</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {data.models_evaluation.map((model) => (
                      <tr
                        key={model.algorithm_name}
                        className={model.is_best ? "bg-brand-600/10 border-l-2 border-brand-500 font-medium text-white" : ""}
                      >
                        <td className="py-3.5 px-3 font-semibold">{model.algorithm_name}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{model.mae}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{model.rmse}</td>
                        <td className="py-3.5 px-3 text-right font-mono text-brand-300 font-bold">{model.r2_score}</td>
                        <td className="py-3.5 px-3 text-center">
                          {model.is_best ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[9px]">
                              Active Predictor
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Evaluated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importance Panel */}
            <div className="glass-card p-6 border border-white/5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-brand-400" size={18} />
                  Predictor Feature Importances
                </h3>
                <p className="text-xs text-slate-400">
                  Relative contribution score of input variables to predictions
                </p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.feature_importances} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis dataKey="feature" type="category" width={100} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f1f2a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Bar dataKey="importance" name="Relative Weight" fill="#7c3aed" radius={[0, 4, 4, 0]}>
                      {data.feature_importances.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-surface-800 border border-white/5 rounded-2xl">
          Loading ML Insights...
        </div>
      )}
    </div>
  );
}
