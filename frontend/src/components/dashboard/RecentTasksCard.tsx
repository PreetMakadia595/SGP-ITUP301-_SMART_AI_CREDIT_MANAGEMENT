import { TaskAdvisorRecommendation } from "@/api/taskAdvisor";
import { CheckCircle2, Clock, RotateCcw, ArrowRight, Sparkles, Code2, FileText, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";

interface RecentTasksCardProps {
  tasks: TaskAdvisorRecommendation[];
}

export default function RecentTasksCard({ tasks }: RecentTasksCardProps) {
  const navigate = useNavigate();

  // Representative default tasks if history is empty
  const defaultTasks: Partial<TaskAdvisorRecommendation>[] = [
    {
      id: 1,
      task_input: "Write a high-performance Python scraper with BeautifulSoup & Asyncio",
      best_platform: "Claude 3.5 Sonnet",
      estimated_cost: "₹0.18",
      estimated_time: "12s",
      created_at: "10 mins ago",
    },
    {
      id: 2,
      task_input: "Summarize 30-page PDF report on AI financial regulations",
      best_platform: "Gemini 1.5 Pro",
      estimated_cost: "₹0.08",
      estimated_time: "8s",
      created_at: "2 hours ago",
    },
    {
      id: 3,
      task_input: "Refactor React Tailwind components for accessibility & dark mode",
      best_platform: "ChatGPT-4o",
      estimated_cost: "₹0.15",
      estimated_time: "15s",
      created_at: "5 hours ago",
    },
    {
      id: 4,
      task_input: "Find latest benchmark numbers for open source LLMs 2026",
      best_platform: "Perplexity Pro",
      estimated_cost: "₹0.05",
      estimated_time: "6s",
      created_at: "1 day ago",
    },
  ];

  const displayTasks = tasks.length > 0 ? tasks.slice(0, 4) : defaultTasks;

  const getIconForTask = (text?: string) => {
    if (!text) return <Sparkles size={14} className="text-brand-400" />;
    const lower = text.toLowerCase();
    if (lower.includes("code") || lower.includes("python") || lower.includes("react")) {
      return <Code2 size={14} className="text-cyan-400" />;
    }
    if (lower.includes("summary") || lower.includes("pdf") || lower.includes("report")) {
      return <FileText size={14} className="text-amber-400" />;
    }
    return <SearchIcon size={14} className="text-purple-400" />;
  };

  return (
    <div className="glass-card p-5 border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-brand-400" /> Recent Tasks & Executions
          </h3>
          <p className="text-[11px] text-slate-400">
            Log of recent prompts, recommended models, and execution costs.
          </p>
        </div>
        <Link to="/task-advisor">
          <Button variant="ghost" size="sm" className="text-xs text-brand-400 hover:text-brand-300">
            History →
          </Button>
        </Link>
      </div>

      <div className="space-y-2.5">
        {displayTasks.map((t) => (
          <div
            key={t.id}
            className="p-3 rounded-xl bg-surface-900/60 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surface-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                {getIconForTask(t.task_input)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                  {t.task_input}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                  <span className="text-brand-300 font-medium">{t.best_platform || "AI Engine"}</span>
                  <span>•</span>
                  <span>{t.estimated_cost || "₹0.10"}</span>
                  <span>•</span>
                  <span className="text-slate-500">{t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px]">
                <CheckCircle2 size={10} className="mr-1" /> Done
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/task-advisor?task=${encodeURIComponent(t.task_input || "")}`)}
                className="h-7 text-[11px] px-2 text-slate-400 hover:text-white"
                title="Rerun prompt in Task Advisor"
              >
                <RotateCcw size={12} className="mr-1" /> Run Again
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
