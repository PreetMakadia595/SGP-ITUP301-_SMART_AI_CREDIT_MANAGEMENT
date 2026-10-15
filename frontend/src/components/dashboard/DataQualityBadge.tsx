/**
 * Data Quality Indicator Badge & Modal
 * Displays real-time data transparency: data sources, real records, sync status, and prediction readiness.
 */
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api/client";

interface SourceBreakdown {
  total_events: number;
  official_api_events: number;
  browser_extension_events: number;
  manual_entry_events: number;
  api_percentage: number;
  extension_percentage: number;
  manual_percentage: number;
}

export default function DataQualityBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const [breakdown, setBreakdown] = useState<SourceBreakdown | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBreakdown = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<SourceBreakdown>("/ingestion/source-breakdown");
      setBreakdown(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdown();
  }, []);

  const totalEvents = breakdown?.total_events || 0;
  const isLiveAPI = (breakdown?.official_api_events || 0) > 0;
  const isExtension = (breakdown?.browser_extension_events || 0) > 0;
  const isCalibrating = totalEvents < 5;

  // Determine badge label and color
  const badgeLabel = isCalibrating
    ? "Learning Your Usage"
    : isLiveAPI
    ? "Live API Data"
    : isExtension
    ? "Extension Active"
    : "Manual Data";

  const badgeColor = isCalibrating
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : isLiveAPI
    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    : "bg-brand-500/20 text-brand-300 border-brand-500/30";

  return (
    <>
      {/* ── Header Badge Trigger ── */}
      <button
        onClick={() => {
          fetchBreakdown();
          setIsOpen(true);
        }}
        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 flex items-center gap-1.5 ${badgeColor}`}
        title="Click to view data quality and sources"
      >
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
        <span>{badgeLabel}</span>
        <Info size={12} className="opacity-70" />
      </button>

      {/* ── Data Quality Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 bg-surface-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white">
                  <Database size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Data Quality & Sources</h3>
                  <p className="text-[11px] text-slate-400">Real-time data integrity report</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quality Summary */}
            <div className="p-3.5 rounded-xl bg-surface-800/80 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Prediction Readiness:</span>
                <span className={`font-bold ${isCalibrating ? "text-amber-400" : "text-emerald-400"}`}>
                  {isCalibrating ? `Calibrating (${totalEvents}/5 records)` : "Active & Accurate"}
                </span>
              </div>
              <div className="w-full bg-surface-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isCalibrating ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(15, (totalEvents / 5) * 100))}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {isCalibrating
                  ? "Our AI models calibrate after 5 days of real activity to guarantee honest, personalized savings predictions."
                  : "Sufficient real user records collected. All predictions are trained on your genuine usage."}
              </p>
            </div>

            {/* Source Attribution Breakdown */}
            {breakdown && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Usage Data Attribution
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-800 border border-emerald-500/20">
                    <p className="text-[10px] text-slate-400 font-medium">Official API</p>
                    <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                      {breakdown.official_api_events}
                    </p>
                    <span className="text-[9px] text-slate-500">{breakdown.api_percentage}%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-800 border border-brand-500/20">
                    <p className="text-[10px] text-slate-400 font-medium">Extension</p>
                    <p className="text-sm font-extrabold text-brand-300 mt-0.5">
                      {breakdown.browser_extension_events}
                    </p>
                    <span className="text-[9px] text-slate-500">{breakdown.extension_percentage}%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-800 border border-purple-500/20">
                    <p className="text-[10px] text-slate-400 font-medium">Manual</p>
                    <p className="text-sm font-extrabold text-purple-300 mt-0.5">
                      {breakdown.manual_entry_events}
                    </p>
                    <span className="text-[9px] text-slate-500">{breakdown.manual_percentage}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Principles Checklist */}
            <div className="space-y-2 pt-1 border-t border-white/5 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Zero fake data — genuine provider & telemetry records only.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>SHA-256 deduplication prevents double-counting.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Encrypted API keys with zero prompt content recording.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full text-xs font-bold"
              >
                Close Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
