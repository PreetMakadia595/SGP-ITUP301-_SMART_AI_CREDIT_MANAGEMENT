import React from "react";
import { History, CheckCircle, AlertCircle, Server, Chrome, Edit3 } from "lucide-react";
import { SyncHistoryItem } from "@/api/providers";

interface Props {
  history: SyncHistoryItem[];
}

export default function SyncHistoryTable({ history }: Props) {
  const getSourceBadge = (source: string) => {
    if (source === "official_api") {
      return (
        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium flex items-center gap-1 w-fit">
          <Server size={10} /> Official API
        </span>
      );
    }
    if (source === "browser_extension") {
      return (
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium flex items-center gap-1 w-fit">
          <Chrome size={10} /> Extension
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium flex items-center gap-1 w-fit">
        <Edit3 size={10} /> Manual
      </span>
    );
  };

  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="text-brand-400" size={18} />
          Synchronization History
        </h3>
        <span className="text-xs text-slate-400">Audit logs & event runs</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 uppercase font-semibold text-[10px]">
              <th className="py-2.5 px-3">Provider</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Ingested</th>
              <th className="py-2.5 px-3">Sync Time</th>
              <th className="py-2.5 px-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 italic">
                  No sync history recorded yet.
                </td>
              </tr>
            ) : (
              history.map((h) => (
                <tr key={h.id} className="hover:bg-surface-700/30 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white uppercase">
                    {h.provider_slug}
                  </td>
                  <td className="py-2.5 px-3">{getSourceBadge(h.source_type)}</td>
                  <td className="py-2.5 px-3">
                    {h.status === "success" ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={12} /> Success
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} /> Error
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                    {h.records_ingested}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">
                    {h.sync_time}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                    {h.details || "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
