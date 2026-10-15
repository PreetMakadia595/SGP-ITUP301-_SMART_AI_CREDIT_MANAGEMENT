/**
 * AI Personal Assistant Page
 * Friendly, conversational AI tech & finance advisor providing personalized, jargon-free advice.
 */
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  TrendingDown,
  CreditCard,
  Zap,
  ShieldCheck,
  Sliders,
  MessageCircle,
  HelpCircle,
  Lightbulb,
  Scissors,
  BarChart2,
  Code2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  sendAssistantMessage,
  getAssistantSuggestions,
  getAssistantInsights,
  AssistantChatMessage,
  AssistantActionCard,
  QuickSuggestion,
  AssistantProfileInsights,
} from "@/api/personalAssistant";

export default function PersonalAssistant() {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([]);
  const [insights, setInsights] = useState<AssistantProfileInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize starter state
  useEffect(() => {
    Promise.allSettled([getAssistantSuggestions(), getAssistantInsights()]).then(
      ([sugRes, insRes]) => {
        if (sugRes.status === "fulfilled") setSuggestions(sugRes.value);
        if (insRes.status === "fulfilled") setInsights(insRes.value);
      }
    );

    // Initial greeting from assistant
    setMessages([
      {
        role: "assistant",
        content:
          "Hi there! 👋 I'm your **AI Personal Advisor**.\n\nI'm here to help you get the most value out of your AI tools without confusing technical jargon. Whether you want to know **which AI model to use for your project**, **how to cut your monthly bill**, or **which subscriptions you can safely cancel**, just ask me below!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggested_follow_ups: [
          "Which AI should I use?",
          "How can I save money?",
          "Which subscription should I cancel?",
          "Which AI is best for coding?",
        ],
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: AssistantChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      const response = await sendAssistantMessage({
        message: text,
        history: messages,
      });

      const assistantMsg: AssistantChatMessage = {
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        action_cards: response.action_cards,
        suggested_follow_ups: response.suggested_follow_ups,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I ran into a small glitch retrieving your records. But here's a quick rule of thumb: use **Claude 3.5** for coding, **Perplexity** for web research, and **Gemini** for free document reading!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation cleared! What would you like to explore next? Feel free to pick a question below or ask anything about your AI subscriptions.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggested_follow_ups: [
          "Which AI should I use?",
          "How can I save money?",
          "Which AI is best for research?",
          "Which AI do I use most?",
        ],
      },
    ]);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                AI Personal Assistant
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Advisor Mode
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Your dedicated AI advisor. Friendly, plain-language guidance tailored to your real usage and budget.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChat}
            className="text-xs border-white/10"
          >
            <Trash2 size={13} className="mr-1.5" />
            Clear Conversation
          </Button>
        </div>
      </div>

      {/* ── Top Personalized Insights Bar ── */}
      {insights && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="glass-card p-3.5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
              <CreditCard size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-slate-400">Current AI Spend</span>
              <p className="text-sm font-extrabold text-white truncate">₹{insights.current_spend.toFixed(0)}/mo</p>
            </div>
          </div>

          <div className="glass-card p-3.5 border border-purple-500/30 bg-purple-950/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-purple-300">Most Used Tool</span>
              <p className="text-sm font-extrabold text-white truncate">{insights.most_used_ai} ({insights.most_used_percentage}%)</p>
            </div>
          </div>

          <div className="glass-card p-3.5 border border-emerald-500/30 bg-emerald-950/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <TrendingDown size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-emerald-300">Top Savings Opportunity</span>
              <p className="text-sm font-extrabold text-emerald-400 truncate">Save ₹{insights.potential_monthly_savings.toFixed(0)}/mo</p>
            </div>
          </div>

          <div className="glass-card p-3.5 border border-cyan-500/30 bg-cyan-950/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-cyan-300">Active Subscriptions</span>
              <p className="text-sm font-extrabold text-white truncate">{insights.active_subscriptions_count} Managed Tools</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Starter Question Cards ── */}
      <div className="glass-card p-5 border border-white/10 space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
          <Lightbulb size={14} className="text-amber-400" />
          <span>Popular Questions (Click any question to ask):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {suggestions.map((sug) => (
            <button
              key={sug.id}
              onClick={() => handleSend(sug.question)}
              className="p-3 rounded-xl bg-surface-900/60 hover:bg-surface-800 border border-white/5 hover:border-brand-500/40 text-left transition-all group flex items-start gap-2.5"
            >
              <span className="text-lg shrink-0 mt-0.5">{sug.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {sug.question}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {sug.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Conversational Chat Feed ── */}
      <div className="glass-card p-4 sm:p-6 border border-white/10 rounded-2xl min-h-[420px] flex flex-col justify-between space-y-6">
        <div className="space-y-6 flex-1">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white shrink-0 shadow-glow mt-1">
                    <Bot size={16} />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] space-y-3 ${
                    isUser
                      ? "bg-brand-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-lg"
                      : "bg-surface-800/90 border border-white/10 text-slate-100 rounded-2xl rounded-tl-sm p-5 shadow-xl"
                  }`}
                >
                  {/* Content Header & Body */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 mb-1">
                    <span className="text-[11px] font-bold opacity-80 font-mono">
                      {isUser ? "You" : "AI Advisor"}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap selection:bg-brand-500/40">
                    {msg.content}
                  </div>

                  {/* Embedded Action Cards */}
                  {msg.action_cards && msg.action_cards.length > 0 && (
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {msg.action_cards.map((card) => {
                        const isRed = card.highlight_color === "red";
                        const isEmerald = card.highlight_color === "emerald";
                        return (
                          <div
                            key={card.id}
                            className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                              isRed
                                ? "bg-red-950/20 border-red-500/30"
                                : isEmerald
                                ? "bg-emerald-950/20 border-emerald-500/30"
                                : "bg-surface-900/80 border-brand-500/30"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-white">{card.title}</h4>
                                {card.badge && (
                                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300">
                                    {card.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                                {card.description}
                              </p>
                            </div>
                            <Link to={card.button_url}>
                              <Button
                                size="sm"
                                className={`w-full text-xs font-bold h-7 py-1 ${
                                  isRed
                                    ? "bg-red-600 hover:bg-red-500 text-white"
                                    : isEmerald
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                    : "btn-primary"
                                }`}
                              >
                                {card.button_label} &rarr;
                              </Button>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Suggested Follow-up Chips */}
                  {msg.suggested_follow_ups && msg.suggested_follow_ups.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Follow-up suggestions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggested_follow_ups.map((fu, fidx) => (
                          <button
                            key={fidx}
                            onClick={() => handleSend(fu)}
                            className="px-2.5 py-1 rounded-lg bg-surface-900/90 hover:bg-brand-600/20 border border-white/10 hover:border-brand-500/40 text-[11px] text-brand-300 transition-all text-left"
                          >
                            {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy Button */}
                  {!isUser && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                        title="Copy answer"
                      >
                        {copiedIdx === idx ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copiedIdx === idx ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-surface-700 flex items-center justify-center text-white shrink-0 mt-1 font-bold text-xs">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3.5 justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white shrink-0 shadow-glow">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-surface-800/90 border border-white/10 text-slate-300 text-xs flex items-center gap-2">
                <RefreshCw size={13} className="animate-spin text-brand-400" />
                <span>Checking your usage history and finding the best recommendation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Bar ── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-4 border-t border-white/5 flex gap-2.5"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything in plain language (e.g. Which AI should I use? How to save money?)..."
            className="flex-1 px-4 py-3 bg-surface-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
          <Button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="btn-primary py-3 px-5 text-xs font-bold shrink-0 flex items-center gap-1.5"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Ask Advisor</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
