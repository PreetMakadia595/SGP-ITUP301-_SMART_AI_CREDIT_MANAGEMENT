/**
 * AI Workflow Planner Page
 * Deconstructs user goals into an actionable sequential timeline of steps,
 * recommending the Best AI, reasons, time/cost estimates, alternative models, and prompt templates.
 */
import { useEffect, useState } from "react";
import {
  Sparkles,
  GitFork,
  Clock,
  IndianRupee,
  Copy,
  Check,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronRight,
  Zap,
  Sliders,
  Layers,
  Lightbulb,
  ExternalLink,
  RefreshCw,
  Search,
  BookOpen,
  Share2,
  FileText,
  ShieldCheck,
  Flame,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  generateWorkflowPlan,
  getWorkflowPresets,
  WorkflowPlanResponse,
  WorkflowPreset,
  WorkflowStep,
} from "@/api/workflowPlanner";

const QUICK_SUGGESTIONS = [
  "Prepare College PPT",
  "Build a Website",
  "Write Research Paper",
  "Create Resume",
  "Develop Mobile App",
  "Create Marketing Campaign",
  "Produce YouTube Video",
  "Analyze Sales Dataset",
];

const CATEGORY_COLORS: Record<string, { badge: string; border: string; bg: string }> = {
  research: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    border: "border-blue-500/30",
    bg: "bg-blue-950/20",
  },
  writing: {
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    border: "border-purple-500/30",
    bg: "bg-purple-950/20",
  },
  design: {
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    border: "border-pink-500/30",
    bg: "bg-pink-950/20",
  },
  coding: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    border: "border-emerald-500/30",
    bg: "bg-emerald-950/20",
  },
  presentation: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    border: "border-amber-500/30",
    bg: "bg-amber-950/20",
  },
  review: {
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    border: "border-cyan-500/30",
    bg: "bg-cyan-950/20",
  },
  marketing: {
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    border: "border-rose-500/30",
    bg: "bg-rose-950/20",
  },
  data: {
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    border: "border-indigo-500/30",
    bg: "bg-indigo-950/20",
  },
};

export default function WorkflowPlanner() {
  const [goalInput, setGoalInput] = useState<string>("Prepare College PPT");
  const [activeGoal, setActiveGoal] = useState<string>("Prepare College PPT");
  const [presets, setPresets] = useState<WorkflowPreset[]>([]);
  const [plan, setPlan] = useState<WorkflowPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedStepIdx, setCopiedStepIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Load presets on mount
  useEffect(() => {
    getWorkflowPresets()
      .then((data) => setPresets(data))
      .catch(() => {
        // Fallback default presets if offline
      });
  }, []);

  // Fetch plan when activeGoal changes
  const fetchPlan = async (targetGoal: string) => {
    if (!targetGoal.trim()) return;
    setLoading(true);
    setCompletedSteps([]);
    try {
      const response = await generateWorkflowPlan({ goal: targetGoal });
      setPlan(response);
      setActiveGoal(targetGoal);
    } catch {
      // API error fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan(activeGoal);
  }, []);

  const handleSelectPreset = (preset: WorkflowPreset) => {
    setGoalInput(preset.title);
    fetchPlan(preset.title);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalInput.trim()) {
      fetchPlan(goalInput);
    }
  };

  const toggleStepCompleted = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((n) => n !== stepNum) : [...prev, stepNum]
    );
  };

  const copyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedStepIdx(idx);
    setTimeout(() => setCopiedStepIdx(null), 2000);
  };

  const copyEntireWorkflow = () => {
    if (!plan) return;
    const text = `# AI Workflow: ${plan.goal}\n\n**Total Estimated Time:** ${plan.total_estimated_time}\n**Estimated Cost:** ${plan.total_estimated_cost}\n\n` +
      plan.steps.map((s) => `## Step ${s.step_number}: ${s.step_title}\n- **Best AI:** ${s.best_ai}\n- **Reason:** ${s.reason}\n- **Time:** ${s.estimated_time} | **Cost:** ${s.estimated_cost}\n- **Alternative AI:** ${s.alternative_ai}\n- **Deliverable:** ${s.output_deliverable}\n\n**Prompt:**\n\`\`\`\n${s.recommended_prompt_template}\n\`\`\`\n`).join("\n");
    
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!plan) return;
    const text = `# AI Workflow: ${plan.goal}\n\n**Total Estimated Time:** ${plan.total_estimated_time}\n**Estimated Cost:** ${plan.total_estimated_cost}\n\n` +
      plan.steps.map((s) => `## Step ${s.step_number}: ${s.step_title}\n- **Best AI:** ${s.best_ai}\n- **Reason:** ${s.reason}\n- **Time:** ${s.estimated_time} | **Cost:** ${s.estimated_cost}\n- **Alternative AI:** ${s.alternative_ai}\n- **Deliverable:** ${s.output_deliverable}\n\n**Prompt:**\n\`\`\`\n${s.recommended_prompt_template}\n\`\`\`\n`).join("\n");
    
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI-Workflow-${plan.goal.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressPercent = plan && plan.steps.length > 0
    ? Math.round((completedSteps.length / plan.steps.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
              <GitFork size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                AI Workflow Planner
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Step-by-Step AI Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter any objective. Get the optimal sequential AI pipeline with model recommendations, time/cost estimates, and copyable prompts.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={copyEntireWorkflow}
            disabled={!plan || loading}
            className="text-xs border-white/10"
          >
            {copiedAll ? <Check size={13} className="text-emerald-400 mr-1.5" /> : <Copy size={13} className="mr-1.5" />}
            {copiedAll ? "Copied All!" : "Copy Workflow"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadMarkdown}
            disabled={!plan || loading}
            className="text-xs border-white/10"
          >
            <Download size={13} className="mr-1.5" />
            Export .MD
          </Button>
        </div>
      </div>

      {/* ── Goal Input Box & Presets ── */}
      <div className="glass-card p-6 border border-white/10 space-y-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Enter your goal (e.g. Prepare PPT, Build a Website, Write Research Paper, Create Resume)..."
              className="w-full pl-10 pr-4 py-3 bg-surface-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !goalInput.trim()}
            className="btn-primary py-3 px-6 text-xs font-bold shrink-0 flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} className="text-amber-300" />
            )}
            Generate AI Workflow
          </Button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Flame size={14} className="text-amber-400" />
            Popular Goal Presets:
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => {
                  setGoalInput(sug);
                  fetchPlan(sug);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activeGoal.toLowerCase() === sug.toLowerCase()
                    ? "bg-brand-600/30 border-brand-500 text-white shadow-glow-sm"
                    : "bg-surface-800/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-surface-700/60"
                }`}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Full Preset Cards Grid */}
        {presets.length > 0 && (
          <div className="pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {presets.map((p) => {
              const isSelected = activeGoal.toLowerCase().includes(p.category) || activeGoal === p.title;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-brand-600/20 border-brand-500/50 shadow-glow-sm"
                      : "bg-surface-900/40 border-white/5 hover:border-white/20 hover:bg-surface-800/50"
                  }`}
                >
                  <span className="text-xl mb-1.5">{p.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-white truncate">{p.title.split(" / ")[0]}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Workflow Summary & Metric Cards ── */}
      {plan && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Target Goal */}
            <div className="glass-card p-5 border border-white/10 space-y-1">
              <span className="text-xs font-semibold text-slate-400">Target Objective</span>
              <h3 className="text-lg font-black text-white truncate mt-1">{plan.goal}</h3>
              <p className="text-[11px] text-brand-300 font-medium capitalize flex items-center gap-1">
                <Sparkles size={11} /> {plan.category} Pipeline
              </p>
            </div>

            {/* Total Estimated Time */}
            <div className="glass-card p-5 border border-purple-500/30 bg-purple-950/10 space-y-1">
              <span className="text-xs font-semibold text-purple-300">Total Estimated Time</span>
              <p className="text-2xl font-black text-purple-300 mt-1">{plan.total_estimated_time}</p>
              <p className="text-[11px] text-slate-400">Across all {plan.total_steps_count} workflow stages</p>
            </div>

            {/* Total Estimated Cost */}
            <div className="glass-card p-5 border border-emerald-500/30 bg-emerald-950/10 space-y-1">
              <span className="text-xs font-semibold text-emerald-300">Total Estimated Cost</span>
              <p className="text-xl font-black text-emerald-400 mt-1 truncate">{plan.total_estimated_cost}</p>
              <p className="text-[11px] text-emerald-400/80">Using optimized free & standard tiers</p>
            </div>

            {/* Progress Tracker */}
            <div className="glass-card p-5 border border-cyan-500/30 bg-cyan-950/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300">Execution Progress</span>
                <span className="text-xs font-black text-cyan-300">{completedSteps.length} / {plan.total_steps_count} Done</span>
              </div>
              <div className="w-full bg-surface-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">{progressPercent}% of steps completed</p>
            </div>
          </div>

          {/* AI Strategy Summary Banner */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-brand-950/50 via-surface-850 to-cyan-950/40 border border-brand-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">Recommended AI Sequence</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{plan.summary}</p>
            </div>

            {/* Step Sequence Chain Badge */}
            <div className="flex items-center flex-wrap gap-1.5 shrink-0 bg-surface-900/60 p-2.5 rounded-xl border border-white/5">
              {plan.steps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white bg-surface-800 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                    <span>{s.best_ai_icon}</span>
                    <span>{s.best_ai.split(" ")[0]}</span>
                  </span>
                  {idx < plan.steps.length - 1 && (
                    <ArrowRight size={11} className="text-brand-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── TIMELINE VIEW (The Core Feature) ── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <GitFork size={20} className="text-brand-400" />
                  Step-by-Step Workflow Timeline
                </h2>
                <p className="text-xs text-slate-400">
                  Follow each step sequentially. Click the checkbox to mark completed as you execute.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {plan.total_steps_count} Sequential Milestones
              </span>
            </div>

            <div className="relative pl-6 md:pl-10 space-y-8">
              {/* Vertical Glowing Connecting Line */}
              <div className="absolute left-[15px] md:left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-500 via-cyan-500 to-emerald-500 opacity-40 pointer-events-none" />

              {/* Steps Loop */}
              {plan.steps.map((step, idx) => {
                const isCompleted = completedSteps.includes(step.step_number);
                const catTheme = CATEGORY_COLORS[step.step_category] || CATEGORY_COLORS.research;

                return (
                  <div key={idx} className="relative group">
                    {/* Step Node Marker on the Line */}
                    <div
                      onClick={() => toggleStepCompleted(step.step_number)}
                      className={`absolute -left-[24px] md:-left-[32px] top-4 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all z-10 ${
                        isCompleted
                          ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20 shadow-glow-emerald"
                          : "bg-surface-800 border-2 border-brand-500 text-brand-300 hover:scale-110 hover:border-cyan-400 shadow-glow"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} className="stroke-[3]" />
                      ) : (
                        <span className="text-xs font-black">{step.step_number}</span>
                      )}
                    </div>

                    {/* Step Content Card */}
                    <div
                      className={`glass-card p-5 md:p-6 border transition-all duration-300 space-y-4 ${
                        isCompleted
                          ? "border-emerald-500/30 bg-surface-900/40 opacity-80"
                          : "border-white/10 hover:border-brand-500/40 hover:shadow-2xl"
                      }`}
                    >
                      {/* Card Header: Step Title, Category Badge, and Completion Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-3.5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleStepCompleted(step.step_number)}
                            className="text-slate-400 hover:text-emerald-400 transition-colors"
                            title={isCompleted ? "Mark incomplete" : "Mark completed"}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={20} className="text-emerald-400 fill-emerald-500/20" />
                            ) : (
                              <Circle size={20} className="text-slate-500 hover:text-white" />
                            )}
                          </button>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400 font-mono">
                              Step {step.step_number}
                            </span>
                            <h3 className={`text-base font-extrabold transition-all ${
                              isCompleted ? "text-slate-300 line-through" : "text-white"
                            }`}>
                              {step.step_title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${catTheme.badge}`}>
                            {step.step_category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 bg-surface-800 px-2 py-0.5 rounded-md border border-white/5 flex items-center gap-1">
                            <Clock size={11} /> {step.estimated_time}
                          </span>
                        </div>
                      </div>

                      {/* AI Recommendations Grid (Best AI vs Alternative AI) */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                        {/* Primary Best AI Recommendation (8 cols) */}
                        <div className="md:col-span-7 p-4 rounded-xl bg-surface-900/80 border border-brand-500/30 space-y-2 relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{step.best_ai_icon}</span>
                              <div>
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                                  Primary AI Recommendation
                                </span>
                                <h4 className="text-sm font-extrabold text-white">{step.best_ai}</h4>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              {step.estimated_cost}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed pt-1">
                            <strong className="text-brand-300">Why this AI: </strong>
                            {step.reason}
                          </p>

                          <div className="pt-1 flex items-center gap-1 text-[11px] text-slate-400">
                            <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                            <span>Deliverable: <strong className="text-slate-200">{step.output_deliverable}</strong></span>
                          </div>
                        </div>

                        {/* Alternative AI Option (5 cols) */}
                        <div className="md:col-span-5 p-4 rounded-xl bg-surface-900/50 border border-white/5 space-y-2 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Alternative AI Option
                            </span>
                            <h4 className="text-sm font-bold text-slate-200 mt-0.5">{step.alternative_ai}</h4>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                              {step.alternative_reason}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Trade-off: Fast secondary backup
                          </p>
                        </div>
                      </div>

                      {/* Ready-to-use Prompt Template Box with Copy Button */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-brand-400" />
                            Optimized Prompt Template for {step.best_ai.split(" ")[0]}
                          </label>
                          <button
                            type="button"
                            onClick={() => copyPrompt(step.recommended_prompt_template, idx)}
                            className="text-[11px] font-bold text-brand-300 hover:text-white flex items-center gap-1 bg-brand-600/20 hover:bg-brand-600/40 px-2 py-0.5 rounded border border-brand-500/30 transition-colors"
                          >
                            {copiedStepIdx === idx ? (
                              <>
                                <Check size={11} className="text-emerald-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                Copy Prompt
                              </>
                            )}
                          </button>
                        </div>

                        <div className="relative group/prompt">
                          <pre className="p-3.5 rounded-xl bg-surface-950/80 border border-white/5 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed selection:bg-brand-500/30">
                            {step.recommended_prompt_template}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Workflow Tips & Best Practices ── */}
          {plan.workflow_tips && plan.workflow_tips.length > 0 && (
            <div className="glass-card p-6 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">Execution Tips & Pro Best Practices</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {plan.workflow_tips.map((tip, tidx) => (
                  <li key={tidx} className="p-3 rounded-xl bg-surface-900/60 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
