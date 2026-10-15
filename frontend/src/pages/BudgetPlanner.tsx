/**
 * AI Budget Planner Page
 * Allows users to input budget constraints, preferred tools, usage frequency, and tasks
 * to receive optimized subscription mixes, cancel/upgrade directives, comparison views, and visual savings.
 */
import { useEffect, useState } from "react";
import {
  IndianRupee,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Layers,
  Zap,
  Sliders,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Check,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  optimizeBudgetPlan,
  getDefaultBudgetPlan,
  BudgetPlanResponse,
  BudgetPlannerInput,
} from "@/api/budgetPlanner";

// Platform catalog options
const PLATFORM_OPTIONS = [
  { id: "claude", name: "Claude (Anthropic)", icon: "⚡", tag: "Top for Coding" },
  { id: "chatgpt", name: "ChatGPT (OpenAI)", icon: "🤖", tag: "Multimodal & Data" },
  { id: "perplexity", name: "Perplexity AI", icon: "🔍", tag: "Live Web Research" },
  { id: "gemini", name: "Google Gemini", icon: "✨", tag: "2M Context & Docs" },
  { id: "deepseek", name: "DeepSeek", icon: "🐋", tag: "Budget Math & Code" },
  { id: "midjourney", name: "Midjourney", icon: "🎨", tag: "Creative & Image" },
  { id: "cursor", name: "Cursor Editor", icon: "💻", tag: "AI Code Editor" },
];

const FREQUENCY_OPTIONS = [
  { id: "daily_heavy", label: "Daily Heavy", desc: "40+ prompts / day" },
  { id: "daily_moderate", label: "Daily Moderate", desc: "15–30 prompts / day" },
  { id: "weekly_light", label: "Weekly Light", desc: "Occasional sprint days" },
  { id: "occasional", label: "Occasional", desc: "Few prompts a week" },
];

const TASK_OPTIONS = [
  { id: "coding", label: "Coding & Debugging", icon: "💻" },
  { id: "research", label: "Research & Citations", icon: "🔍" },
  { id: "content_writing", label: "Content & Copywriting", icon: "✍️" },
  { id: "data_analysis", label: "Data Analysis & CSVs", icon: "📊" },
  { id: "creative", label: "Creative Art & Images", icon: "🎨" },
];

const QUICK_BUDGETS = [1500, 3000, 5000, 8000];

export default function BudgetPlanner() {
  const [budget, setBudget] = useState<number>(3000);
  const [preferredPlatforms, setPreferredPlatforms] = useState<string[]>(["claude", "perplexity"]);
  const [frequency, setFrequency] = useState<string>("daily_moderate");
  const [selectedTasks, setSelectedTasks] = useState<string[]>(["coding", "research"]);
  const [plan, setPlan] = useState<BudgetPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOptimization = async () => {
    setLoading(true);
    try {
      const input: BudgetPlannerInput = {
        monthly_budget: budget,
        preferred_platforms: preferredPlatforms,
        usage_frequency: frequency,
        primary_tasks: selectedTasks,
      };
      const res = await optimizeBudgetPlan(input);
      setPlan(res);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimization();
  }, [budget, preferredPlatforms, frequency, selectedTasks]);

  const togglePlatform = (id: string) => {
    setPreferredPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleTask = (id: string) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Recharts Colors
  const COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

  // Cost Comparison Chart Data
  const costComparisonData = plan
    ? [
        {
          name: "Current Setup",
          cost: plan.comparison_view.current_monthly_cost,
          fill: "#f43f5e",
        },
        {
          name: "Optimized Plan",
          cost: plan.comparison_view.optimized_monthly_cost,
          fill: "#10b981",
        },
        {
          name: "Target Budget",
          cost: plan.monthly_budget,
          fill: "#7c3aed",
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* ── Page Title Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
              <Sliders size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                AI Budget Planner & Optimizer
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Input your monthly budget and workload to get the highest-value subscription mix with zero waste.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOptimization}
            disabled={loading}
            className="text-xs border-white/10"
          >
            <RefreshCw size={13} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} />
            Re-calculate Plan
          </Button>
        </div>
      </div>

      {/* ── Top Summary Metric Highlights ── */}
      {plan && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Target Monthly Budget</span>
            <p className="text-2xl font-black text-white mt-1">₹{plan.monthly_budget.toFixed(2)}</p>
            <p className="text-[11px] text-slate-400">User allocated budget</p>
          </div>

          <div className="glass-card p-5 border border-brand-500/30 bg-brand-950/10 space-y-1">
            <span className="text-xs font-semibold text-brand-300">Expected Monthly Cost</span>
            <p className="text-2xl font-black text-brand-300 mt-1">₹{plan.expected_monthly_cost.toFixed(2)}</p>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> {plan.budget_status}
            </p>
          </div>

          <div className="glass-card p-5 border border-emerald-500/30 bg-emerald-950/10 space-y-1">
            <span className="text-xs font-semibold text-emerald-300">Expected Monthly Savings</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">₹{plan.expected_savings.toFixed(2)}</p>
            <p className="text-[11px] text-emerald-300 font-medium">Saved vs individual standalone plans</p>
          </div>

          <div className="glass-card p-5 border border-cyan-500/30 bg-cyan-950/10 space-y-1">
            <span className="text-xs font-semibold text-cyan-300">Task Capability Coverage</span>
            <p className="text-2xl font-black text-cyan-300 mt-1">{plan.comparison_view.task_coverage_pct}%</p>
            <p className="text-[11px] text-slate-400">Zero functional gap for your tasks</p>
          </div>
        </div>
      )}

      {/* ── Main 2-Column Layout: Controls & Recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Inputs (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border border-white/10 space-y-6">
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders size={17} className="text-brand-400" />
                Your Budget & Requirements
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Customize your constraints below.</p>
            </div>

            {/* 1. Monthly Budget Input & Quick Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">1. Monthly Budget (₹)</label>
                <span className="text-sm font-extrabold text-brand-400">₹{budget.toLocaleString("en-IN")}</span>
              </div>

              <input
                type="range"
                min="1000"
                max="10000"
                step="250"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />

              <div className="flex items-center gap-2 pt-1">
                {QUICK_BUDGETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBudget(amt)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                      budget === amt
                        ? "bg-brand-600/30 border-brand-500 text-brand-300"
                        : "bg-surface-700/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Primary Tasks */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <label className="text-xs font-bold text-slate-200">2. Primary Tasks (Select all that apply)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TASK_OPTIONS.map((task) => {
                  const active = selectedTasks.includes(task.id);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        active
                          ? "bg-brand-600/20 border-brand-500/50 text-white shadow-glow-sm"
                          : "bg-surface-900/40 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-base">{task.icon}</span>
                      <span className="text-xs font-medium truncate">{task.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Usage Frequency */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <label className="text-xs font-bold text-slate-200">3. Usage Frequency</label>
              <div className="grid grid-cols-2 gap-2">
                {FREQUENCY_OPTIONS.map((freq) => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setFrequency(freq.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      frequency === freq.id
                        ? "bg-cyan-500/15 border-cyan-500/40 text-white shadow-glow-cyan"
                        : "bg-surface-900/40 border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <p className="text-xs font-bold">{freq.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{freq.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Preferred AI Platforms */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <label className="text-xs font-bold text-slate-200">4. Preferred AI Platforms</label>
              <div className="space-y-2">
                {PLATFORM_OPTIONS.map((plat) => {
                  const isChecked = preferredPlatforms.includes(plat.id);
                  return (
                    <div
                      key={plat.id}
                      onClick={() => togglePlatform(plat.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? "bg-surface-700 border-brand-500/40 text-white"
                          : "bg-surface-900/40 border-white/5 text-slate-400 hover:bg-surface-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{plat.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-white">{plat.name}</p>
                          <p className="text-[10px] text-slate-400">{plat.tag}</p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? "bg-brand-600 border-brand-500 text-white" : "border-white/20"
                        }`}
                      >
                        {isChecked && <Check size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations & Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {plan && (
            <>
              {/* ── AI Recommendation Rationale Banner ── */}
              <div className="rounded-2xl p-5 bg-gradient-to-r from-brand-950/40 to-cyan-950/30 border border-brand-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-400" />
                  <h3 className="text-sm font-extrabold text-white">
                    Optimal Subscription Strategy
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {plan.summary_message}
                </p>
              </div>

              {/* ── Best Subscription Combination ── */}
              <div className="glass-card p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Zap size={18} className="text-brand-400" />
                      Best Subscription Combination
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tailored specifically for your tasks within ₹{plan.monthly_budget.toFixed(0)}/mo.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    ₹{plan.expected_monthly_cost.toFixed(2)} Total
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {plan.best_subscription_combination.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-surface-900/70 border border-white/5 hover:border-brand-500/30 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-white">{sub.platform_name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.is_free_tier
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-brand-600/20 text-brand-300"
                            }`}
                          >
                            {sub.is_free_tier ? "FREE TIER" : `₹${sub.monthly_cost.toFixed(0)}/mo`}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-400 font-medium mt-0.5">{sub.badge}</p>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">{sub.reason}</p>
                      </div>

                      <div className="pt-2 border-t border-white/5 space-y-1">
                        {sub.key_features.map((feat, fidx) => (
                          <p key={fidx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Directives: Platforms to Cancel & Platforms to Upgrade ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Platforms to Cancel */}
                <div className="glass-card p-5 border border-red-500/20 bg-red-950/5 space-y-3">
                  <div className="flex items-center gap-2 border-b border-red-500/20 pb-2.5">
                    <XCircle size={17} className="text-red-400" />
                    <h3 className="text-sm font-bold text-red-300">Platforms to Cancel</h3>
                  </div>

                  {plan.platforms_to_cancel.length > 0 ? (
                    <div className="space-y-2.5">
                      {plan.platforms_to_cancel.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-surface-900/80 border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{item.platform_name}</h4>
                            <span className="text-[11px] font-bold text-emerald-400">
                              +₹{item.potential_savings.toFixed(0)} Saved
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{item.reason}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Alternative: <strong className="text-slate-300">{item.alternative_coverage}</strong>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 p-3 bg-surface-900/40 rounded-xl">
                      No redundant subscriptions detected in your plan.
                    </p>
                  )}
                </div>

                {/* Platforms to Upgrade */}
                <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-950/5 space-y-3">
                  <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2.5">
                    <ArrowUpRight size={17} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-emerald-300">Platforms to Upgrade</h3>
                  </div>

                  {plan.platforms_to_upgrade.length > 0 ? (
                    <div className="space-y-2.5">
                      {plan.platforms_to_upgrade.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-surface-900/80 border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{item.platform_name}</h4>
                            <span className="text-[11px] font-bold text-cyan-300">
                              +{item.target_tier}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{item.roi_reason}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            ROI: <strong className="text-emerald-300">{item.key_benefit}</strong>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 p-3 bg-surface-900/40 rounded-xl">
                      Your current setup is already running at peak efficiency.
                    </p>
                  )}
                </div>
              </div>

              {/* ── Side-by-Side Comparison View ── */}
              <div className="glass-card p-6 border border-white/10 space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <BarChart3 size={18} className="text-brand-400" />
                    Side-by-Side Comparison View
                  </h3>
                  <p className="text-xs text-slate-400">
                    Compare your current standalone subscriptions vs the recommended optimized bundle.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">Metric</th>
                        <th className="py-3 px-3">Current Plan</th>
                        <th className="py-3 px-3">Optimized Plan</th>
                        <th className="py-3 px-3 text-right">Net Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {plan.comparison_view.metrics.map((m, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-3 font-semibold text-white">{m.metric_name}</td>
                          <td className="py-3.5 px-3 font-mono text-red-300">{m.current_plan}</td>
                          <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold">{m.optimized_plan}</td>
                          <td className="py-3.5 px-3 text-right font-bold text-emerald-400">{m.difference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Visual Savings & Headroom Charts (Recharts) ── */}
              <div className="glass-card p-6 border border-white/10 space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <TrendingDown size={18} className="text-emerald-400" />
                    Visual Savings & Cost Breakdown
                  </h3>
                  <p className="text-xs text-slate-400">
                    Monthly spending comparison and budget headroom allocation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Before vs After Bar Chart */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-300 text-center">Cost Comparison (₹/mo)</p>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} stroke="rgba(255,255,255,0.1)" />
                          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} stroke="rgba(255,255,255,0.1)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f1f2e",
                              borderColor: "rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                              color: "#ffffff",
                              fontSize: "12px",
                            }}
                            formatter={(val: any) => [`₹${val}`, "Amount"]}
                          />
                          <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                            {costComparisonData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Budget Headroom Gauge & Platform Cost Distribution */}
                  <div className="flex flex-col justify-center space-y-4 p-4 rounded-2xl bg-surface-900/60 border border-white/5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">Target Budget Utilization</span>
                        <span className="text-emerald-400 font-bold">{plan.visual_savings_breakdown.budget_utilization_pct}%</span>
                      </div>
                      <div className="w-full bg-surface-800 rounded-full h-3 overflow-hidden border border-white/5">
                        <div
                          className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${plan.visual_savings_breakdown.budget_utilization_pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center pt-2">
                      <div className="p-3 rounded-xl bg-surface-800/80 border border-white/5">
                        <p className="text-[10px] text-slate-400 font-medium">Monthly Cost</p>
                        <p className="text-base font-extrabold text-white mt-0.5">
                          ₹{plan.expected_monthly_cost.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-[10px] text-emerald-300 font-medium">Budget Buffer Left</p>
                        <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                          ₹{plan.visual_savings_breakdown.budget_remaining.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
