/**
 * Smart Task Advisor — Multi-Model AI Agent Hub
 *
 * Interactive AI Agent suite supporting ChatGPT (GPT-4o), Gemini 1.5 Pro,
 * DeepSeek-R1 CoT reasoning visualizer, Claude 3.5 Sonnet artifacts, Model Arena,
 * prompt engineering, direct launch links, and live response generation.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Bot,
  User as UserIcon,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  ArrowRightLeft,
  Lightbulb,
  Clock,
  IndianRupee,
  Gauge,
  Target,
  Sparkles,
  Loader2,
  History,
  MessageSquareText,
  BrainCircuit,
  Cpu,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Code,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Share2,
  Play,
  Flame,
} from "lucide-react";
import {
  postTaskQuery,
  patchFeedback,
  getTaskAdvisorHistory,
  executeTaskQuery,
  type TaskAdvisorRecommendation,
} from "@/api/taskAdvisor";

/* ── Engine Types & Definitions ─────────────────────────────────────────── */

type EngineId = "auto" | "deepseek" | "gpt4o" | "gemini" | "claude";

interface EngineOption {
  id: EngineId;
  name: string;
  badge: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  icon: React.ElementType;
  description: string;
}

const ENGINES: EngineOption[] = [
  {
    id: "auto",
    name: "Auto Advisor",
    badge: "SMART MATCH",
    color: "text-brand-400",
    bgGradient: "from-brand-600/20 to-indigo-600/20",
    borderColor: "border-brand-500/30",
    icon: Sparkles,
    description: "Matches task intent across all top AI platforms automatically.",
  },
  {
    id: "deepseek",
    name: "DeepSeek-R1",
    badge: "DEEP REASONING",
    color: "text-cyan-400",
    bgGradient: "from-cyan-600/20 to-blue-600/20",
    borderColor: "border-cyan-500/30",
    icon: BrainCircuit,
    description: "Open-weights chain-of-thought engine for math, logic, & proofs.",
  },
  {
    id: "gpt4o",
    name: "ChatGPT (GPT-4o)",
    badge: "CREATIVE & OMNI",
    color: "text-emerald-400",
    bgGradient: "from-emerald-600/20 to-teal-600/20",
    borderColor: "border-emerald-500/30",
    icon: Zap,
    description: "Versatile omnimodal assistant for writing, tone, & image prompts.",
  },
  {
    id: "gemini",
    name: "Gemini 1.5 Pro",
    badge: "1M CONTEXT",
    color: "text-purple-400",
    bgGradient: "from-purple-600/20 to-pink-600/20",
    borderColor: "border-purple-500/30",
    icon: Cpu,
    description: "Massive context window for full PDFs, books, and deep research.",
  },
  {
    id: "claude",
    name: "Claude 3.5 Sonnet",
    badge: "CODE & ARTIFACTS",
    color: "text-amber-400",
    bgGradient: "from-amber-600/20 to-orange-600/20",
    borderColor: "border-amber-500/30",
    icon: Code,
    description: "Top-tier code generation, TypeScript refactoring, & architectural design.",
  },
];

/* ── Constraint Types ──────────────────────────────────────────────────── */

interface ConstraintOption {
  id: string;
  label: string;
}

const CONSTRAINTS: ConstraintOption[] = [
  { id: "free_only", label: "Free Tier Only" },
  { id: "max_speed", label: "Max Speed (<1m)" },
  { id: "deep_reasoning", label: "Deep CoT Reasoning" },
  { id: "code_focused", label: "Code Architecture" },
];

/* ── Quick Suggestions ─────────────────────────────────────────────────── */

const SUGGESTIONS = [
  "I want to write an executive email",
  "I need React TypeScript components",
  "I want to summarize a 50-page PDF",
  "Solve calculus proof with step-by-step reasoning",
  "Help me debug Python backend memory leak",
  "Generate DALL-E image prompt for blog banner",
  "Research market analysis on AI hardware",
];

/* ── Message Type ───────────────────────────────────────────────────────── */

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  text?: string;
  engine?: EngineId;
  recommendation?: TaskAdvisorRecommendation;
  directResponse?: string;
  timestamp: Date;
}

/* ── Difficulty & Confidence Helpers ───────────────────────────────────── */

function difficultyColors(level: string) {
  switch (level.toLowerCase()) {
    case "easy":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "medium":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "hard":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

function confidenceGradient(val: number) {
  if (val >= 90) return "from-emerald-500 to-emerald-400";
  if (val >= 75) return "from-brand-600 to-brand-400";
  if (val >= 60) return "from-amber-500 to-amber-400";
  return "from-red-500 to-red-400";
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function TaskAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<EngineId>("auto");
  const [activeConstraints, setActiveConstraints] = useState<string[]>([]);
  const [executionMode, setExecutionMode] = useState<"recommend" | "execute">(
    "recommend"
  );
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Auto Scroll ────────────────────────────────────────────────────── */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }, []);

  /* ── Load History on Mount ─────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const history = await getTaskAdvisorHistory(50, 0);
        if (history.length > 0) {
          const chatMsgs: ChatMessage[] = [];
          const sorted = [...history].reverse();
          for (const item of sorted) {
            chatMsgs.push({
              id: `user-${item.id}`,
              type: "user",
              text: item.task_input,
              timestamp: new Date(item.created_at),
            });
            chatMsgs.push({
              id: `bot-${item.id}`,
              type: "bot",
              engine: (item.engine as EngineId) || "auto",
              recommendation: item,
              timestamp: new Date(item.created_at),
            });
          }
          setMessages(chatMsgs);
        }
      } catch {
        // Silently ignore history errors
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (historyLoaded) scrollToBottom();
  }, [messages, historyLoaded, scrollToBottom]);

  /* ── Toggle Constraint Filter ──────────────────────────────────────── */
  const toggleConstraint = (id: string) => {
    setActiveConstraints((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  /* ── Submit Query ──────────────────────────────────────────────────── */
  const handleSubmit = async (taskText?: string) => {
    const text = (taskText ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      if (executionMode === "execute") {
        const execRes = await executeTaskQuery(text, selectedEngine);
        const botMsg: ChatMessage = {
          id: `exec-${Date.now()}`,
          type: "bot",
          engine: selectedEngine,
          directResponse: execRes.direct_response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const rec = await postTaskQuery(text, selectedEngine, activeConstraints);
        const botMsg: ChatMessage = {
          id: `bot-${rec.id}`,
          type: "bot",
          engine: selectedEngine,
          recommendation: rec,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        type: "bot",
        text: "Sorry, something went wrong processing your task request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  /* ── Execute Recommendation Live ───────────────────────────────────── */
  const handleLiveExecution = async (rec: TaskAdvisorRecommendation) => {
    setLoading(true);
    try {
      const execRes = await executeTaskQuery(
        rec.task_input,
        selectedEngine,
        rec.optimized_prompt
      );
      const botMsg: ChatMessage = {
        id: `exec-${Date.now()}`,
        type: "bot",
        engine: selectedEngine,
        directResponse: execRes.direct_response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  /* ── Feedback Handler ──────────────────────────────────────────────── */
  const handleFeedback = async (
    recId: number,
    fb: "helpful" | "not_helpful"
  ) => {
    try {
      const updated = await patchFeedback(recId, fb);
      setMessages((prev) =>
        prev.map((m) =>
          m.recommendation?.id === recId
            ? { ...m, recommendation: updated }
            : m
        )
      );
    } catch {
      // Silently fail
    }
  };

  /* ── Export Chat ───────────────────────────────────────────────────── */
  const exportChat = () => {
    if (messages.length === 0) return;
    let markdown = `# Smart Task Advisor — Session Export\n*Exported on ${new Date().toLocaleString()}*\n\n`;
    for (const m of messages) {
      if (m.type === "user") {
        markdown += `### User Query:\n${m.text}\n\n`;
      } else if (m.recommendation) {
        markdown += `### AI Advisor Recommendation (${m.recommendation.best_platform}):\n`;
        markdown += `- **Reason:** ${m.recommendation.reason}\n`;
        markdown += `- **Alternative:** ${m.recommendation.alternative_platform}\n`;
        markdown += `- **Est. Time:** ${m.recommendation.estimated_time}\n`;
        markdown += `- **Est. Cost:** ${m.recommendation.estimated_cost}\n\n`;
        if (m.recommendation.optimized_prompt) {
          markdown += `**Optimized Prompt:**\n\`\`\`\n${m.recommendation.optimized_prompt}\n\`\`\`\n\n`;
        }
      } else if (m.directResponse) {
        markdown += `### Live AI Direct Response:\n${m.directResponse}\n\n`;
      }
    }

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-advisor-export-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Clear Chat ────────────────────────────────────────────────────── */
  const clearChat = () => {
    if (confirm("Are you sure you want to clear current conversation?")) {
      setMessages([]);
    }
  };

  const currentEngineObj =
    ENGINES.find((e) => e.id === selectedEngine) || ENGINES[0];

  return (
    <div className="flex flex-col h-[calc(100vh-var(--topnav-height)-3rem)] animate-fade-in space-y-4">
      {/* ── Top Header Controls & Engine Selection ──────────────────────────── */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-4 shrink-0 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Smart Task Advisor AI Agent Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30">
                MULTI-AGENT AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by DeepSeek-R1 reasoning, ChatGPT GPT-4o, Gemini 1.5 Pro, and Claude 3.5 Sonnet.
            </p>
          </div>

          {/* Session Tools */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={exportChat}
              disabled={messages.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-700 hover:bg-surface-600 text-slate-300 border border-white/10 transition-all disabled:opacity-40"
              title="Export session to markdown file"
            >
              <Share2 size={13} />
              Export
            </button>
            <button
              onClick={clearChat}
              disabled={messages.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 border border-white/10 transition-all disabled:opacity-40"
              title="Clear conversation screen"
            >
              <Trash2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* ── Model Engine Tabs ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {ENGINES.map((eng) => {
            const IconComp = eng.icon;
            const isSelected = selectedEngine === eng.id;
            return (
              <button
                key={eng.id}
                onClick={() => setSelectedEngine(eng.id)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group ${
                  isSelected
                    ? `bg-gradient-to-br ${eng.bgGradient} ${eng.borderColor} ring-1 ring-white/20 shadow-glow`
                    : "bg-surface-800/60 border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5">
                    <IconComp
                      size={15}
                      className={isSelected ? eng.color : "text-slate-400"}
                    />
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-white" : "text-slate-300"
                      }`}
                    >
                      {eng.name}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                    isSelected
                      ? `${eng.color} bg-black/40`
                      : "text-slate-500 bg-surface-700"
                  }`}
                >
                  {eng.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Constraints Filters ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Flame size={12} className="text-amber-400" /> Presets & Filters:
          </span>
          {CONSTRAINTS.map((c) => {
            const active = activeConstraints.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleConstraint(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
                  active
                    ? "bg-brand-600/30 border-brand-500/50 text-brand-300 shadow-sm"
                    : "bg-surface-800/80 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-surface-700"
                }`}
              >
                {active ? "✓ " : "+ "}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat Messages Scroll Area ──────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && historyLoaded && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-glow animate-pulse-slow">
              <MessageSquareText size={36} className="text-white" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-white">
                Multi-Agent AI Task Advisor
              </h2>
              <p className="text-slate-400 text-sm">
                Select an active engine above or type any task in plain English.
                I will match models, analyze step-by-step reasoning, generate
                optimized prompts, and create starter artifacts.
              </p>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSubmit(s)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300
                             bg-surface-700/80 border border-white/10
                             hover:border-brand-500/50 hover:bg-surface-600
                             hover:text-white transition-all duration-200
                             hover:shadow-glow hover:scale-[1.02] active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && historyLoaded && (
          <div className="flex items-center gap-3 opacity-50">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <History size={12} /> Conversation Stream
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
          >
            {msg.type === "user" ? (
              <UserBubble text={msg.text!} />
            ) : msg.recommendation ? (
              <RecommendationCard
                rec={msg.recommendation}
                engine={msg.engine || "auto"}
                onFeedback={handleFeedback}
                onExecuteLive={handleLiveExecution}
              />
            ) : msg.directResponse ? (
              <DirectResponseCard text={msg.directResponse} engine={msg.engine} />
            ) : (
              <BotTextBubble text={msg.text!} />
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="glass-card px-5 py-4 flex items-center gap-3 border border-white/10">
              <Loader2 size={18} className="text-brand-400 animate-spin" />
              <span className="text-sm text-slate-300 font-medium">
                Running {currentEngineObj.name} agent analysis & reasoning...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Input Controls Bar ────────────────────────────────────────────── */}
      <div className="shrink-0 px-2 sm:px-4 pb-2">
        <div className="glass-card rounded-2xl border border-white/10 p-2 space-y-2 hover:border-brand-500/30 transition-all">
          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              Active Engine:{" "}
              <strong className={currentEngineObj.color}>
                {currentEngineObj.name}
              </strong>
            </span>

            {/* Execution mode switch */}
            <div className="flex items-center gap-1 bg-surface-800 p-0.5 rounded-lg border border-white/5">
              <button
                onClick={() => setExecutionMode("recommend")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  executionMode === "recommend"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Advisor & Blueprint
              </button>
              <button
                onClick={() => setExecutionMode("execute")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  executionMode === "execute"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Live Direct Answer
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 bg-surface-800/80 rounded-xl">
            <Sparkles size={18} className="text-brand-400 shrink-0" />
            <input
              ref={inputRef}
              id="task-advisor-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={`Ask ${currentEngineObj.name}... e.g. 'I want to write a React TypeScript hook'`}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
              disabled={loading}
              autoComplete="off"
            />
            <button
              id="task-advisor-send-btn"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700
                         flex items-center justify-center transition-all
                         duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                         hover:scale-105 active:scale-95 shadow-glow shrink-0"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="max-w-xl px-5 py-3 rounded-2xl rounded-tr-md bg-brand-600/20 border border-brand-500/30 text-sm text-slate-100">
        {text}
      </div>
      <div className="w-9 h-9 rounded-xl bg-surface-600 flex items-center justify-center shrink-0 border border-white/10">
        <UserIcon size={16} className="text-slate-300" />
      </div>
    </div>
  );
}

function BotTextBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow shrink-0">
        <Bot size={18} className="text-white" />
      </div>
      <div className="glass-card max-w-lg px-5 py-3 text-sm text-slate-300 border border-white/10">
        {text}
      </div>
    </div>
  );
}

/** Direct response bubble for live AI execution mode */
function DirectResponseCard({
  text,
  engine,
}: {
  text: string;
  engine?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center shadow-glow shrink-0 mt-1">
        <BrainCircuit size={18} className="text-white" />
      </div>
      <div className="glass-card max-w-3xl w-full p-5 space-y-3 border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Zap size={14} /> Live AI Output (Engine: {engine || "Auto"})
          </span>
          <button
            onClick={copyText}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-all"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Response"}
          </button>
        </div>
        <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
          {text}
        </div>
      </div>
    </div>
  );
}

/** Rich Multi-Agent Recommendation Card */
function RecommendationCard({
  rec,
  engine,
  onFeedback,
  onExecuteLive,
}: {
  rec: TaskAdvisorRecommendation;
  engine: string;
  onFeedback: (id: number, fb: "helpful" | "not_helpful") => void;
  onExecuteLive: (rec: TaskAdvisorRecommendation) => void;
}) {
  const [showThinking, setShowThinking] = useState(false);
  const [showArena, setShowArena] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyPrompt = () => {
    if (rec.optimized_prompt) {
      navigator.clipboard.writeText(rec.optimized_prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const copyCode = () => {
    if (rec.starter_artifact?.content) {
      navigator.clipboard.writeText(rec.starter_artifact.content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const downloadArtifact = () => {
    if (!rec.starter_artifact) return;
    const ext = rec.starter_artifact.language === "typescript" ? "ts" : "md";
    const blob = new Blob([rec.starter_artifact.content], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `starter-artifact-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow shrink-0 mt-1">
        <Bot size={18} className="text-white" />
      </div>

      <div className="glass-card max-w-3xl w-full overflow-hidden border border-white/10">
        <div className="h-1 w-full bg-gradient-brand" />

        <div className="p-5 space-y-4">
          {/* ── Best Platform Hero ────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Trophy size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                  Recommended AI Agent Platform
                </p>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {rec.best_platform}
                </h3>
              </div>
            </div>

            {/* Launch External Button */}
            {rec.external_url && (
              <a
                href={rec.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                           bg-brand-600/30 text-brand-300 border border-brand-500/40
                           hover:bg-brand-600 hover:text-white transition-all shadow-glow"
              >
                Launch Model <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* ── Metrics Grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricTile
              icon={<ArrowRightLeft size={14} />}
              label="Alternative"
              value={rec.alternative_platform}
              color="text-cyan-400"
            />
            <MetricTile
              icon={<Clock size={14} />}
              label="Est. Time"
              value={rec.estimated_time}
              color="text-amber-400"
            />
            <MetricTile
              icon={<IndianRupee size={14} />}
              label="Est. Cost"
              value={rec.estimated_cost}
              color="text-emerald-400"
            />
            <div className="bg-surface-700/60 rounded-xl px-3 py-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <Gauge size={14} className="text-brand-400" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  Difficulty
                </span>
              </div>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyColors(
                  rec.difficulty_level
                )}`}
              >
                {rec.difficulty_level}
              </span>
            </div>
            <div className="bg-surface-700/60 rounded-xl px-3 py-2.5 border border-white/5 col-span-2 sm:col-span-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target size={14} className="text-brand-400" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  Confidence
                </span>
                <span className="ml-auto text-xs font-bold text-white">
                  {rec.confidence}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${confidenceGradient(
                    rec.confidence
                  )} transition-all duration-700 ease-out`}
                  style={{ width: `${rec.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Recommendation Reason ───────────────────────────────────── */}
          <div className="flex items-start gap-2.5 bg-surface-700/40 rounded-xl px-4 py-3 border border-white/5">
            <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">{rec.reason}</p>
          </div>

          {/* ── DeepSeek Chain of Thought Reasoning Drawer ────────────────── */}
          {rec.reasoning_steps && rec.reasoning_steps.length > 0 && (
            <div className="bg-surface-800/80 rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-cyan-400 hover:bg-white/5 transition-all"
              >
                <span className="flex items-center gap-2">
                  <BrainCircuit size={15} />
                  DeepSeek-R1 CoT Thought Process ({rec.reasoning_steps.length}{" "}
                  steps)
                </span>
                {showThinking ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showThinking && (
                <div className="p-4 bg-black/40 border-t border-white/10 space-y-2 font-mono text-xs text-slate-300 animate-fade-in">
                  <p className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider mb-2">
                    &lt;think&gt;
                  </p>
                  {rec.reasoning_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-500 font-bold">
                        Step {idx + 1}:
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider mt-2">
                    &lt;/think&gt;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Model Arena Matrix Toggle ─────────────────────────────────── */}
          {rec.model_arena_scores && (
            <div className="bg-surface-800/80 rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setShowArena(!showArena)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-purple-400 hover:bg-white/5 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Flame size={15} /> Model Arena Benchmark Breakdown
                </span>
                {showArena ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showArena && (
                <div className="p-4 bg-black/30 border-t border-white/10 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(rec.model_arena_scores).map(
                      ([modelName, scores]) => (
                        <div
                          key={modelName}
                          className="bg-surface-700/60 p-3 rounded-xl border border-white/5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">
                              {modelName}
                            </span>
                            {modelName.includes(rec.best_platform.split(" ")[0]) && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                BEST MATCH
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-slate-500">Reasoning:</span>{" "}
                              <strong className="text-slate-200">
                                {scores.reasoning}/100
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-500">Accuracy:</span>{" "}
                              <strong className="text-slate-200">
                                {scores.accuracy}/100
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-500">Speed:</span>{" "}
                              <strong className="text-slate-200">
                                {scores.speed}/100
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-500">Cost:</span>{" "}
                              <strong className="text-slate-200">
                                {scores.cost}/100
                              </strong>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Optimized Prompt Engineering Box ──────────────────────────── */}
          {rec.optimized_prompt && (
            <div className="bg-surface-800/80 rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-white/5 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Zap size={15} /> Engineered System Prompt
                </span>
                {showPrompt ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showPrompt && (
                <div className="p-4 bg-black/40 border-t border-white/10 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Copy or use this prompt directly in any LLM:
                    </span>
                    <button
                      onClick={copyPrompt}
                      className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold transition-all"
                    >
                      {copiedPrompt ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedPrompt ? "Copied!" : "Copy Prompt"}
                    </button>
                  </div>
                  <pre className="p-3 bg-surface-900 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto border border-white/5">
                    {rec.optimized_prompt}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ── Starter Artifact Preview ──────────────────────────────────── */}
          {rec.starter_artifact && (
            <div className="bg-surface-800/80 rounded-xl border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <FileText size={14} /> {rec.starter_artifact.title}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-all"
                  >
                    {copiedCode ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                    {copiedCode ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={downloadArtifact}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-all"
                  >
                    <Download size={13} />
                    Download
                  </button>
                </div>
              </div>
              <pre className="p-3 bg-black/50 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto border border-white/5 max-h-48">
                {rec.starter_artifact.content}
              </pre>
            </div>
          )}

          {/* ── Actions & Feedback ───────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Was this helpful?</span>

              <button
                id={`feedback-helpful-${rec.id}`}
                onClick={() => onFeedback(rec.id, "helpful")}
                disabled={rec.feedback !== null}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-all duration-200 border
                            ${
                              rec.feedback === "helpful"
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm"
                                : rec.feedback !== null
                                ? "opacity-30 cursor-not-allowed bg-surface-700 border-white/5 text-slate-500"
                                : "bg-surface-700 border-white/10 text-slate-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 active:scale-95"
                            }`}
              >
                <ThumbsUp size={13} />
                Helpful
              </button>

              <button
                id={`feedback-not-helpful-${rec.id}`}
                onClick={() => onFeedback(rec.id, "not_helpful")}
                disabled={rec.feedback !== null}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-all duration-200 border
                            ${
                              rec.feedback === "not_helpful"
                                ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-sm"
                                : rec.feedback !== null
                                ? "opacity-30 cursor-not-allowed bg-surface-700 border-white/5 text-slate-500"
                                : "bg-surface-700 border-white/10 text-slate-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 active:scale-95"
                            }`}
              >
                <ThumbsDown size={13} />
                Not Helpful
              </button>
            </div>

            <button
              onClick={() => onExecuteLive(rec)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                         bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 transition-all shadow-glow"
            >
              <Play size={13} /> Generate Direct AI Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-surface-700/60 rounded-xl px-3 py-2.5 border border-white/5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-100 truncate">{value}</p>
    </div>
  );
}
