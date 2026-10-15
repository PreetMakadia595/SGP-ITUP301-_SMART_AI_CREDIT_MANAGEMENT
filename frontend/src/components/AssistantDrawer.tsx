/**
 * Floating AI Assistant Drawer / Quick Launcher
 * Allows users to access the Personal Advisor from any screen in the app.
 */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  RefreshCw,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  sendAssistantMessage,
  AssistantChatMessage,
} from "@/api/personalAssistant";

export default function AssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! Need quick advice on which AI model to use or how to save on subscriptions?",
      timestamp: "Now",
      suggested_follow_ups: [
        "Which AI should I use?",
        "How can I save money?",
        "Which AI is best for coding?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: AssistantChatMessage = {
      role: "user",
      content: text,
      timestamp: "Now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await sendAssistantMessage({ message: text, history: messages });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          timestamp: "Now",
          action_cards: res.action_cards,
          suggested_follow_ups: res.suggested_follow_ups,
        },
      ]);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating Launcher Trigger Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-brand text-white shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
          title="Open AI Personal Advisor"
        >
          <Bot size={20} />
          <span className="text-xs font-bold hidden sm:inline pr-1">Ask AI Advisor</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-surface-900 animate-pulse" />
        </button>
      )}

      {/* ── Quick Drawer Window ── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] h-[520px] glass-card border border-white/20 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-3.5 bg-surface-800 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white shadow-glow">
                <Bot size={15} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  AI Personal Advisor
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[10px] text-slate-400">Plain language AI guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/assistant"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Expand to full page"
              >
                <Maximize2 size={14} />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={13} />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-sm"
                      : "bg-surface-800/90 border border-white/10 text-slate-200 rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Action Link inside mini drawer */}
                  {m.action_cards && m.action_cards.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      {m.action_cards.slice(0, 1).map((card) => (
                        <Link
                          key={card.id}
                          to={card.button_url}
                          onClick={() => setIsOpen(false)}
                          className="p-2 rounded-lg bg-surface-900/90 border border-brand-500/30 flex items-center justify-between text-[11px] font-bold text-brand-300 hover:text-white transition-colors"
                        >
                          <span>{card.button_label}</span>
                          <ArrowRight size={11} />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Suggested chips */}
                  {m.suggested_follow_ups && (
                    <div className="pt-2 flex flex-wrap gap-1">
                      {m.suggested_follow_ups.slice(0, 2).map((fu, fidx) => (
                        <button
                          key={fidx}
                          onClick={() => handleSend(fu)}
                          className="px-2 py-0.5 rounded bg-surface-900/90 text-[10px] text-brand-300 hover:bg-brand-600/30 border border-white/5"
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <RefreshCw size={12} className="animate-spin text-brand-400" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Mini Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-surface-800 border-t border-white/10 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-1.5 bg-surface-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60"
            />
            <Button size="sm" type="submit" disabled={loading || !input.trim()} className="btn-primary px-3 h-8">
              <Send size={12} />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
