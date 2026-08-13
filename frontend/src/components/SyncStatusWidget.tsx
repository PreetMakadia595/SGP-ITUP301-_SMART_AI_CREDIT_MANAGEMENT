import React, { useState } from "react";
import { RefreshCw, Zap, CheckCircle2, Clock } from "lucide-react";
import { syncAllProviders } from "@/api/providers";

interface Props {
  onSyncComplete: () => void;
  lastSyncTime?: string;
}

export default function SyncStatusWidget({ onSyncComplete, lastSyncTime }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState("");

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncSuccessMsg("");
    try {
      const results = await syncAllProviders();
      const count = results.reduce((acc, r) => acc + (r.records_ingested || 0), 0);
      setSyncSuccessMsg(`Synced ${results.length} providers (${count} new records ingested).`);
      onSyncComplete();
    } catch (err: any) {
      console.error("Manual Sync Error:", err);
      setSyncSuccessMsg("Manual sync encountered an issue.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncSuccessMsg(""), 5000);
    }
  };

  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
          <Zap className="text-white" size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Hybrid Data Pipeline</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Active Ingestion
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Clock size={13} className="text-slate-500" />
            Last Sync: <span className="text-slate-200 font-medium">{lastSyncTime || "Just now"}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
        {/* Auto Sync Status Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">Auto Sync</span>
          <button
            onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
              autoSyncEnabled ? "bg-brand-600 justify-end" : "bg-surface-700 justify-start"
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* Manual Sync Button */}
        <button
          id="manual-sync-btn"
          onClick={handleManualSync}
          disabled={syncing}
          className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-glow hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing Providers..." : "Manual Sync Now"}
        </button>
      </div>

      {syncSuccessMsg && (
        <div className="w-full text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl mt-2 animate-fade-in">
          {syncSuccessMsg}
        </div>
      )}
    </div>
  );
}
