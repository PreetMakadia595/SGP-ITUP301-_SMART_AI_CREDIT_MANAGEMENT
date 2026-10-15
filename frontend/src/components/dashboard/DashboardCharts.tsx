import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { Activity, PieChart as PieIcon, Layers, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageSummary } from "@/api/usageTracker";
import { useNavigate } from "react-router-dom";

const COLORS = ["#7c3aed", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#6366f1"];

interface DashboardChartsProps {
  usageSummary: UsageSummary | null;
  loading: boolean;
}

// ── Empty State Panel ─────────────────────────────────────────────────────────
function ChartEmptyState({ message, action }: { message: string; action?: string }) {
  const navigate = useNavigate();
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6 py-8">
      <div className="w-12 h-12 rounded-2xl bg-surface-800 border border-white/5 flex items-center justify-center">
        <BarChart2 size={22} className="text-slate-500" />
      </div>
      <p className="text-sm text-slate-400 font-medium">{message}</p>
      <p className="text-xs text-slate-500">
        Log sessions via the browser extension, or connect an AI platform.
      </p>
      {action && (
        <button
          onClick={() => navigate("/platforms")}
          className="mt-1 text-xs px-4 py-1.5 rounded-lg bg-brand-600/20 border border-brand-500/30 text-brand-300 hover:bg-brand-600/30 transition-all"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="h-full flex items-end gap-2 px-4 pb-4">
      {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-white/5 rounded-t-lg animate-pulse"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export default function DashboardCharts({ usageSummary, loading }: DashboardChartsProps) {
  const [activeMetric, setActiveMetric] = useState<"prompts" | "credits" | "cost">("prompts");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // ── Build platform chart data from real API ────────────────────────────────
  const platformData = (usageSummary?.platform_distribution ?? []).map((p, i) => ({
    name: p.platform,
    value: p.prompts,
    color: COLORS[i % COLORS.length],
  }));

  const totalPrompts = platformData.reduce((s, p) => s + p.value, 0);

  // Compute percentage share for each platform
  const platformDataWithPct = platformData.map((p) => ({
    ...p,
    pct: totalPrompts > 0 ? Math.round((p.value / totalPrompts) * 100) : 0,
  }));

  // ── Build task category radar data from real API ───────────────────────────
  const taskData = (usageSummary?.task_distribution ?? []).map((t) => ({
    category: t.task_type || "Other",
    count: t.count,
    score: Math.min(100, Math.round((t.count / Math.max(1, ...((usageSummary?.task_distribution ?? []).map((x) => x.count)))) * 100)),
  }));

  // ── Build weekly bar/area data from real credits & prompts this month ──────
  // Since we only have aggregated period stats (not day-level breakdown yet),
  // we use a normalized single-bar "this month" summary when day data is absent.
  const hasWeeklyBreakdown = false; // backend does not yet return per-day data
  const weeklyData = hasWeeklyBreakdown
    ? []
    : usageSummary && usageSummary.this_week.prompts > 0
    ? [
        {
          day: "This Week",
          prompts: usageSummary.this_week.prompts,
          credits: usageSummary.this_week.credits,
          cost: parseFloat((usageSummary.this_week.cost_usd * 83).toFixed(2)),
        },
      ]
    : [];

  const hasWeeklyData = weeklyData.length > 0;
  const hasPlatformData = platformDataWithPct.length > 0;
  const hasTaskData = taskData.length > 0;

  return (
    <div className="space-y-6">
      {/* ── 1. Weekly Activity Chart ── */}
      <div className="glass-card p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Activity Trend</h3>
              <p className="text-[11px] text-slate-400">
                Daily AI prompt volume and credit usage over the past week.
              </p>
            </div>
          </div>

          {hasWeeklyData && (
            <div className="flex items-center gap-2">
              <div className="flex bg-surface-900 rounded-lg p-0.5 border border-white/5 text-[11px]">
                {(["prompts", "credits", "cost"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMetric(m)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                      activeMetric === m
                        ? "bg-brand-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex bg-surface-900 rounded-lg p-0.5 border border-white/5 text-[11px]">
                <button
                  onClick={() => setChartType("area")}
                  className={`px-2 py-1 rounded-md font-medium transition-all ${
                    chartType === "area" ? "bg-surface-700 text-white" : "text-slate-400"
                  }`}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-2 py-1 rounded-md font-medium transition-all ${
                    chartType === "bar" ? "bg-surface-700 text-white" : "text-slate-400"
                  }`}
                >
                  Bar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-64 w-full pt-2">
          {loading ? (
            <ChartSkeleton />
          ) : !hasWeeklyData ? (
            <ChartEmptyState
              message="No weekly activity data yet."
              action="Connect an AI Tool"
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f1f2e", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#ffffff", fontSize: "12px" }}
                    formatter={(val: any) => [activeMetric === "cost" ? `₹${val}` : val, activeMetric.toUpperCase()]}
                  />
                  <Area type="monotone" dataKey={activeMetric} stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#metricGradient)" />
                </AreaChart>
              ) : (
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f1f2e", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#ffffff", fontSize: "12px" }}
                    formatter={(val: any) => [activeMetric === "cost" ? `₹${val}` : val, activeMetric.toUpperCase()]}
                  />
                  <Bar dataKey={activeMetric} fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── 2. Grid: Platform Usage & Task Categories ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Usage Donut Chart */}
        <div className="glass-card p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <PieIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Platform Usage Share</h3>
                <p className="text-[11px] text-slate-400">Share of total prompts by AI assistant.</p>
              </div>
            </div>
          </div>

          <div className="h-56 flex items-center justify-center relative">
            {loading ? (
              <div className="w-32 h-32 rounded-full border-8 border-white/5 animate-pulse" />
            ) : !hasPlatformData ? (
              <ChartEmptyState message="No platform usage data yet." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformDataWithPct}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="pct"
                    >
                      {platformDataWithPct.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f1f2e", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#ffffff", fontSize: "12px" }}
                      formatter={(val: any, _name: any, item: any) => [
                        `${val}% (${item.payload.value} prompts)`,
                        item.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center pointer-events-none">
                  <p className="text-xl font-extrabold text-white">{totalPrompts}</p>
                  <p className="text-[10px] text-slate-400">Total Prompts</p>
                </div>
              </>
            )}
          </div>

          {hasPlatformData && (
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5">
              {platformDataWithPct.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-1.5 rounded-lg bg-surface-900/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-300 font-medium text-[11px] truncate">{p.name}</span>
                  </div>
                  <span className="font-bold text-white text-[11px]">{p.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Categories Breakdown Chart */}
        <div className="glass-card p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Task Categories Breakdown</h3>
                <p className="text-[11px] text-slate-400">Distribution of requests by workload type.</p>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            {loading ? (
              <ChartSkeleton />
            ) : !hasTaskData ? (
              <ChartEmptyState message="No task category data yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={taskData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" />
                  <Radar name="Activity Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f1f2e", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#ffffff", fontSize: "12px" }}
                    formatter={(val: any, _name: any, item: any) => [
                      `${item.payload.count} tasks (${val} pts)`,
                      item.payload.category,
                    ]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {hasTaskData && (
            <div className="space-y-2 pt-1 border-t border-white/5">
              {taskData.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">{cat.category}</span>
                    <span className="text-emerald-400 font-bold">{cat.count} tasks</span>
                  </div>
                  <div className="w-full bg-surface-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
