import { useState } from "react";
import { Sparkles, Search, CheckCircle2, ArrowRight, Lightbulb, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postTaskQuery, TaskAdvisorRecommendation } from "@/api/taskAdvisor";
import { useNavigate } from "react-router-dom";

const PRESET_GOALS = [
  { label: "Draft Email / Article", query: "Write a professional customer update email", engine: "chatgpt" },
  { label: "Debug & Write Code", query: "Fix TypeScript error in React component", engine: "claude" },
  { label: "Analyze Data", query: "Analyze monthly sales trends from CSV data", engine: "gpt-4o" },
  { label: "Deep Research", query: "Compare cloud server hosting pricing in 2026", engine: "perplexity" },
];

export default function QuickRecommendationWidget() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<TaskAdvisorRecommendation | null>(null);
  const navigate = useNavigate();

  const [apiError, setApiError] = useState<string | null>(null);

  const handleRecommend = async (taskText: string) => {
    if (!taskText.trim()) return;
    setLoading(true);
    setRecommendation(null);
    setApiError(null);
    try {
      const res = await postTaskQuery(taskText);
      setRecommendation(res);
    } catch {
      // Show honest error — no fake fallback recommendation
      setApiError("Could not reach the recommendation engine. Please ensure the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 border border-white/10 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center">
            <Lightbulb size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Quick AI Recommendation
            </h3>
            <p className="text-[11px] text-slate-400">
              Not sure which AI to use? Pick a goal or type your request in plain English.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Goal Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400 font-medium mr-1">Try a goal:</span>
        {PRESET_GOALS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setQuery(preset.query);
              handleRecommend(preset.query);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-surface-700 hover:bg-surface-600 border border-white/5 text-slate-200 hover:text-white transition-all duration-150 flex items-center gap-1.5 active:scale-95"
          >
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRecommend(query);
        }}
        className="flex flex-col sm:flex-row gap-2.5"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you want to do (e.g. Write a python script to parse PDFs)..."
            className="pl-10 text-xs py-2.5"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary shrink-0 text-xs px-5 flex items-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Finding Best AI...</span>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Get Recommendation</span>
            </>
          )}
        </Button>
      </form>

      {/* API Error Message */}
      {apiError && (
        <div className="rounded-xl p-3.5 bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-fade-in">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">{apiError}</p>
        </div>
      )}

      {/* Recommendation Result Card */}
      {recommendation && (
        <div className="rounded-xl p-4 bg-surface-900/80 border border-brand-500/30 animate-fade-in space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Recommended Model</span>
                <h4 className="text-base font-extrabold text-white">{recommendation.best_platform}</h4>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-surface-700 text-slate-300">Est. Time: {recommendation.estimated_time}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Est. Cost: {recommendation.estimated_cost}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-surface-800/60 p-2.5 rounded-lg border border-white/5">
            💡 <strong className="text-slate-200">Why this model:</strong> {recommendation.reason}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Alternative option: <strong className="text-slate-300">{recommendation.alternative_platform}</strong>
            </span>
            <Button
              size="sm"
              onClick={() => navigate(`/task-advisor?task=${encodeURIComponent(recommendation.task_input)}`)}
              className="text-xs bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/40"
            >
              Open Task Advisor <ArrowRight size={13} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
