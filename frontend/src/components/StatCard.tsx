/**
 * StatCard — Reusable metric card with icon, value, label, and trend indicator
 */
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  id?: string;
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;          // positive = up, negative = down, 0 = flat
  trendLabel?: string;
  loading?: boolean;
}

export default function StatCard({
  id,
  label,
  value,
  subValue,
  icon: Icon,
  iconColor = "#7c3aed",
  trend,
  trendLabel,
  loading = false,
}: StatCardProps) {
  const trendDir = trend === undefined ? null : trend > 0 ? "up" : trend < 0 ? "down" : "flat";

  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-4 w-24 bg-surface-600 rounded mb-3" />
        <div className="h-7 w-16 bg-surface-600 rounded mb-2" />
        <div className="h-3 w-20 bg-surface-600 rounded" />
      </div>
    );
  }

  return (
    <div id={id} className="glass-card p-5 hover:border-brand-600/30 transition-all duration-200 animate-fade-in group">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${iconColor}20`, boxShadow: `0 0 12px ${iconColor}40` }}
        >
          <Icon size={17} style={{ color: iconColor }} />
        </div>
      </div>

      {/* ── Value ── */}
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {subValue && <p className="text-xs text-slate-500 mb-2">{subValue}</p>}

      {/* ── Trend ── */}
      {trendDir && (
        <div className="flex items-center gap-1.5 mt-1">
          {trendDir === "up"   && <TrendingUp  size={13} className="text-emerald-400" />}
          {trendDir === "down" && <TrendingDown size={13} className="text-red-400" />}
          {trendDir === "flat" && <Minus        size={13} className="text-slate-500" />}
          <span
            className={clsx(
              "text-xs font-medium",
              trendDir === "up"   && "text-emerald-400",
              trendDir === "down" && "text-red-400",
              trendDir === "flat" && "text-slate-500"
            )}
          >
            {trendLabel ?? `${Math.abs(trend ?? 0)}%`}
          </span>
        </div>
      )}
    </div>
  );
}
