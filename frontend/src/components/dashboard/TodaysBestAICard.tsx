import { Sparkles, ArrowRight, Zap, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface TodaysBestAICardProps {
  mostUsedAI: string | null;
  loading: boolean;
}

// Static AI capabilities knowledge base (not usage data — just factual specs)
const AI_SPECS: Record<string, { speed: string; costLabel: string; bestFor: string; tagline: string }> = {
  "chatgpt":         { speed: "Fast",    costLabel: "₹0.14 / task", bestFor: "Coding & Chat",   tagline: "Best for code generation, chat, and creative writing." },
  "gpt-4o":          { speed: "Fast",    costLabel: "₹0.14 / task", bestFor: "Coding & Chat",   tagline: "Best for code generation, chat, and creative writing." },
  "claude":          { speed: "Fast",    costLabel: "₹0.12 / task", bestFor: "Coding & Logic",  tagline: "Best for reasoning, structured analysis, and long documents." },
  "claude 3.5":      { speed: "Fast",    costLabel: "₹0.12 / task", bestFor: "Coding & Logic",  tagline: "Best for reasoning, structured analysis, and long documents." },
  "gemini":          { speed: "Instant", costLabel: "₹0.00 / task", bestFor: "Search & Docs",   tagline: "Best for Google Workspace integration and multimodal tasks." },
  "perplexity":      { speed: "Instant", costLabel: "₹0.08 / task", bestFor: "Research",        tagline: "Best for web research, citations, and factual lookups." },
  "cursor":          { speed: "Fast",    costLabel: "₹0.18 / task", bestFor: "Code Completion", tagline: "Best for inline code completion inside your IDE." },
};

function getSpec(platform: string | null) {
  if (!platform) return null;
  const key = platform.toLowerCase();
  for (const [k, v] of Object.entries(AI_SPECS)) {
    if (key.includes(k)) return { ...v, name: platform };
  }
  return { speed: "—", costLabel: "—", bestFor: "General", tagline: `Your most-used AI platform this month.`, name: platform };
}

export default function TodaysBestAICard({ mostUsedAI, loading }: TodaysBestAICardProps) {
  const navigate = useNavigate();
  const spec = getSpec(mostUsedAI);

  return (
    <div className="glass-card p-5 relative overflow-hidden group hover:border-brand-500/30 transition-all duration-300 h-full">
      {/* Background Glow Effect */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all" />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-brand-400">
              Your #1 Pick
            </span>
            <h3 className="text-sm font-extrabold text-white">Most Used AI</h3>
          </div>
        </div>
        {spec && (
          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[11px] px-2.5 py-0.5">
            <Zap size={11} className="mr-1" /> Top Platform
          </Badge>
        )}
      </div>

      <div className="mt-2 space-y-3">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-7 w-40 bg-white/5 rounded-lg" />
            <div className="h-4 w-full bg-white/5 rounded-lg" />
            <div className="h-4 w-3/4 bg-white/5 rounded-lg" />
          </div>
        ) : spec ? (
          <>
            <div className="flex items-baseline justify-between">
              <h4 className="text-xl font-black text-white tracking-tight truncate pr-2">{spec.name}</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{spec.tagline}</p>

            {/* Feature Pill Stats */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-surface-900/60 border border-white/5">
                <p className="text-[10px] text-slate-400 font-medium">Speed</p>
                <p className="text-xs font-bold text-cyan-400 flex items-center justify-center gap-1 mt-0.5">
                  <Zap size={12} /> {spec.speed}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-surface-900/60 border border-white/5">
                <p className="text-[10px] text-slate-400 font-medium">Est. Cost</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">{spec.costLabel}</p>
              </div>
              <div className="p-2 rounded-xl bg-surface-900/60 border border-white/5">
                <p className="text-[10px] text-slate-400 font-medium">Best For</p>
                <p className="text-xs font-bold text-purple-300 mt-0.5 truncate">{spec.bestFor}</p>
              </div>
            </div>

            <Button
              onClick={() => navigate(`/task-advisor`)}
              className="w-full mt-2 btn-primary flex items-center justify-center gap-2 text-xs py-2 h-9"
            >
              <span>Open {spec.name}</span>
              <ArrowRight size={14} />
            </Button>
          </>
        ) : (
          /* Empty state when no usage data */
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-800 border border-white/5 flex items-center justify-center">
              <BarChart2 size={20} className="text-slate-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-400">No usage data yet</p>
              <p className="text-xs text-slate-500">
                Connect an AI platform or log a session to see your top AI pick.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/platforms")}
              className="text-xs bg-brand-600/20 border border-brand-500/30 text-brand-300 hover:bg-brand-600/30"
            >
              Connect an AI Tool
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
