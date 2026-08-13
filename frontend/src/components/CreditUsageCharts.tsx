/**
 * Credit Usage Charts Component — Daily, Weekly, Monthly usage charts & breakdowns
 */
import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Calendar, BarChart3, PieChart as PieIcon, Cpu, Layers } from "lucide-react";
import type { CreditChartsResponse } from "@/types/credit";
import clsx from "clsx";

interface CreditUsageChartsProps {
  data: CreditChartsResponse | null;
  loading?: boolean;
}

type Period = "daily" | "weekly" | "monthly";

const COLOR_PALETTE = [
  "#7c3aed",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#3b82f6",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
];

export default function CreditUsageCharts({ data, loading }: CreditUsageChartsProps) {
  const [period, setPeriod] = useState<Period>("daily");

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2 h-72 animate-pulse bg-surface-700/30" />
        <div className="glass-card p-6 h-72 animate-pulse bg-surface-700/30" />
      </div>
    );
  }

  const chartData = data ? data[period] : [];
  const platformData = data?.platform_breakdown || [];
  const taskData = data?.task_breakdown || [];

  return (
    <div className="space-y-6">
      {/* ── Main Usage Trend Chart Card ── */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-brand-400" />
              <h3 className="text-base font-bold text-white">Credit Usage Trends</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare credit consumption across daily, weekly, and monthly intervals
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center bg-surface-900/60 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200",
                  period === p
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
            <Calendar size={32} className="text-slate-600 mb-1" />
            <p>No usage data available for {period} view.</p>
            <p className="text-xs text-slate-600">Add a credit usage entry to populate charts.</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#181824",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                  labelStyle={{ color: "#e2e8f0", fontWeight: "bold" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="credits_used"
                  name="Credits Used"
                  stroke="#7c3aed"
                  fill="url(#colorCredits)"
                  strokeWidth={2.5}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="token_usage"
                  name="Tokens Consumed"
                  stroke="#06b6d4"
                  fill="url(#colorTokens)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Secondary Grid: Platform & Task Type Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-cyan-400" />
            <h3 className="text-base font-bold text-white">Platform Usage Share</h3>
          </div>
          {platformData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No platform records yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="credits_used"
                    nameKey="name"
                  >
                    {platformData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181824",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    formatter={(val: number) => [`${val} Credits`, "Usage"]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Task Type Breakdown */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-emerald-400" />
            <h3 className="text-base font-bold text-white">Task Type Breakdown</h3>
          </div>
          {taskData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No task records yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#e2e8f0", fontSize: 11 }} axisLine={false} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181824",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    formatter={(val: number) => [`${val} Credits`, "Used"]}
                  />
                  <Bar dataKey="credits_used" name="Credits Used" radius={[0, 8, 8, 0]}>
                    {taskData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
