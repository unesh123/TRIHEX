"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sparkles, X, Send, Bot, RotateCcw, ChevronDown, ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  provider?: string;
  groundedSources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

const SUPPRESSED_PATHS = ["/admin", "/checkout"];

const QUICK_PROMPTS = [
  "What is today's USD exchange rate?",
  "What developer subscriptions are in stock?",
  "How does the replacement warranty work?",
  "Show me latest verified tech deals",
];

export function TrihexCopilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am **TRIHEX Copilot**, grounded directly in our live inventory, verified deals, and Nepal Rastra Bank forex rates. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSuppressed = SUPPRESSED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (isSuppressed) return null;

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history }),
      });

      if (!res.ok) throw new Error("Failed to receive response");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          provider: data.provider,
          groundedSources: data.groundedSources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm temporarily having trouble connecting to our live reasoning engine. You can browse our verified items directly at [/products](/products) or check [/deals](/deals).",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation reset. Ask me anything about our software catalog, warranty terms, or live NRB rates.",
      },
    ]);
  };

  const renderContentWithLinks = (text: string) => {
    // Basic markdown link parser: [label](url)
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      const isInternal = url.startsWith("/");
      parts.push(
        isInternal ? (
          <Link
            key={match.index}
            href={url}
            className="font-semibold text-sky-400 underline decoration-sky-400/40 hover:decoration-sky-400"
            onClick={() => setIsOpen(false)}
          >
            {label}
          </Link>
        ) : (
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-sky-400 underline decoration-sky-400/40 hover:decoration-sky-400"
          >
            {label}
            <ExternalLink className="h-3 w-3" />
          </a>
        )
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  const isProductDetail = Boolean(
    pathname?.startsWith("/products/") && pathname !== "/products",
  );

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && !isSuppressed && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open TRIHEX AI Copilot"
          aria-expanded={false}
          className={cn(
            "fixed bottom-24 left-4 lg:bottom-6 lg:left-6 z-40 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-4 text-sm font-semibold text-white shadow-xl shadow-cyan-950/30 transition-all duration-200 hover:scale-105 hover:shadow-cyan-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
            isProductDetail ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 text-cyan-200" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
          </div>
          <span className="font-mono text-xs font-bold tracking-wider uppercase">Copilot</span>
        </button>
      )}

      {/* Copilot Window Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="TRIHEX AI Copilot"
          aria-modal="true"
          className="fixed bottom-20 left-4 right-4 sm:right-auto sm:w-[420px] max-h-[75vh] sm:max-h-[640px] z-50 flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur-xl transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-950/40 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100">TRIHEX Copilot</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Grounded
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Storefront & Nepal Rates Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                aria-label="Reset conversation"
                title="Reset conversation"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Copilot"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 max-w-[90%] whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-cyan-600 text-white rounded-br-none"
                      : "bg-slate-800/90 text-slate-200 border border-slate-700/50 rounded-bl-none"
                  }`}
                >
                  {renderContentWithLinks(m.content)}
                </div>

                {/* Grounded source tags */}
                {m.groundedSources && m.groundedSources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1 max-w-[90%]">
                    {m.groundedSources.map((s, sIdx) => (
                      <Link
                        key={sIdx}
                        href={s.url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 rounded bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-cyan-300 border border-slate-700 transition-colors"
                      >
                        <span>{s.title}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Synthesizing grounded answer...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (visible if only initial assistant greeting) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 border-t border-slate-800/40 pt-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qp)}
                    className="text-left text-[11px] rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1 border border-slate-700/60 transition-colors"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="border-t border-slate-800/80 p-3 bg-slate-950/40 rounded-b-2xl flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, deals, forex, warranty..."
              maxLength={400}
              disabled={loading}
              className="flex-1 bg-slate-800/90 text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
