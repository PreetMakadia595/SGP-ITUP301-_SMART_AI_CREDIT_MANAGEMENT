import React from "react";
import { Layers, Server, Chrome, Edit3 } from "lucide-react";
import { DataSourceBreakdown } from "@/api/ingestion";

interface Props {
  data?: DataSourceBreakdown;
}

export default function DataSourceBreakdownWidget({ data }: Props) {
  const sources = data?.sources || [
    { source: "Official API", count: 12, percentage: 50.0 },
    { source: "Browser Extension", count: 8, percentage: 33.3 },
    { source: "Manual Entry", count: 4, percentage: 16.7 },
  ];

  const getIcon = (src: string) => {
    if (src.includes("API")) return <Server className="text-blue-400" size={16} />;
    if (src.includes("Extension")) return <Chrome className="text-emerald-400" size={16} />;
    return <Edit3 className="text-amber-400" size={16} />;
  };

  const getBarColor = (src: string) => {
    if (src.includes("API")) return "bg-blue-500";
    if (src.includes("Extension")) return "bg-emerald-500";
    return "bg-amber-500";
  };

  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="text-brand-400" size={18} />
          Data Source Breakdown
        </h3>
        <span className="text-xs text-slate-400">
          Total Ingested: <strong className="text-white">{data?.total_events || 24}</strong>
        </span>
      </div>

      {/* Distribution Bars */}
      <div className="w-full h-3 bg-surface-700 rounded-full overflow-hidden flex">
        {sources.map((s) => (
          <div
            key={s.source}
            style={{ width: `${s.percentage}%` }}
            className={`h-full ${getBarColor(s.source)} transition-all duration-500`}
            title={`${s.source}: ${s.percentage}%`}
          />
        ))}
      </div>

      {/* Legend Cards */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {sources.map((s) => (
          <div
            key={s.source}
            className="p-3 rounded-xl bg-surface-700/50 border border-white/5 flex flex-col space-y-1"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              {getIcon(s.source)}
              <span className="truncate">{s.source}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-base font-bold text-white">{s.count}</span>
              <span className="text-xs text-slate-400 font-mono">{s.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
