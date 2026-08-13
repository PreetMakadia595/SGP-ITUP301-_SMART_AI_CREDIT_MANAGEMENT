import React from "react";
import { Activity, Server, Chrome, Edit3 } from "lucide-react";
import { IngestedEvent } from "@/api/ingestion";

interface Props {
  events: IngestedEvent[];
}

export default function LatestUsageStream({ events }: Props) {
  const getSourceIcon = (source: string) => {
    if (source === "official_api") return <Server className="text-blue-400" size={14} />;
    if (source === "browser_extension") return <Chrome className="text-emerald-400" size={14} />;
    return <Edit3 className="text-amber-400" size={14} />;
  };

  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="text-brand-400" size={18} />
          Latest Usage Stream
        </h3>
        <span className="text-xs text-slate-400">Real-time Ingestion Stream</span>
      </div>

      <div className="space-y-2.5">
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            No telemetry events recorded yet. Connect an API or Browser Extension to begin.
          </p>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-surface-700/40 border border-white/5 flex items-center justify-between hover:bg-surface-700/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-600/50 flex-shrink-0">
                  {getSourceIcon(ev.source_type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">{ev.platform}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-600 text-slate-300">
                      {ev.model}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {ev.prompt_count} Prompts • {ev.duration_seconds}s Duration
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-brand-300">
                  +{ev.credits_used} Credits
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {ev.created_at ? new Date(ev.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short" }) : ev.usage_date}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
