"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Command, 
  X, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Flame, 
  FileText, 
  Scale, 
  Database,
  ShoppingBag,
  ExternalLink,
  Lock,
  GitBranch,
  Star,
  CheckCircle2,
  Terminal,
  Zap
} from "lucide-react";
import { UniversalSearchGroup, UniversalSearchResult, SearchEntityType } from "@/lib/search/universal-search";

type FilterTab = "ALL" | SearchEntityType;

const POPULAR_TAGS = [
  { label: "Claude Code", q: "claude-code" },
  { label: "Supabase Ops", q: "supabase" },
  { label: "Cursor Pro", q: "cursor" },
  { label: "DeepSeek V3", q: "deepseek" },
  { label: "vLLM Inference", q: "vllm" },
  { label: "Browser Use", q: "browser-use" },
  { label: "VIP Vault", q: "vip" },
  { label: "Free Copilot & Deals", q: "copilot" },
  { label: "Security Blue Team", q: "security" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<UniversalSearchGroup[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Filter groups according to active category tab
  const filteredGroups = useMemo(() => {
    if (activeFilter === "ALL") return groups;
    return groups.filter((g) => g.type === activeFilter);
  }, [groups, activeFilter]);

  // Flattened results for keyboard navigation & indexing
  const flatResults = useMemo(() => {
    return filteredGroups.flatMap((g) => g.results);
  }, [filteredGroups]);

  // Total results count across all categories
  const totalCount = useMemo(() => {
    return groups.reduce((acc, g) => acc + g.count, 0);
  }, [groups]);

  // Listen for Cmd+K / Ctrl+K and custom trigger events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input when opened & reset selected index
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setGroups([]);
      setActiveFilter("ALL");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search API fetch with debounce
  useEffect(() => {
    if (!query.trim()) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        setGroups(data.groups || []);
        setSelectedIndex(0);
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  // Auto-scroll selected item into view smoothly
  useEffect(() => {
    const el = itemRefs.current.get(selectedIndex);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  // Handle result execution
  const handleSelectResult = (result: UniversalSearchResult) => {
    setIsOpen(false);
    if (result.type === "GITHUB_REPO" || result.url.startsWith("http")) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      router.push(result.url);
    }
  };

  // Keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (flatResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flatResults[selectedIndex];
      if (target) {
        handleSelectResult(target);
      }
    }
  };

  const getEntityIcon = (type: SearchEntityType) => {
    switch (type) {
      case "PRODUCT":
        return ShoppingBag;
      case "DEAL":
        return Flame;
      case "PROMPT":
        return Sparkles;
      case "SKILL":
        return Cpu;
      case "GITHUB_REPO":
        return GitBranch;
      case "VAULT":
        return Lock;
      case "GUIDE":
        return FileText;
      case "RESEARCH":
        return Scale;
      case "DATASET":
        return Database;
      default:
        return Search;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-150"
      data-lenis-prevent="true"
      data-lenis-prevent-scroll
      onWheel={(e) => e.stopPropagation()}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl backdrop-blur-2xl transition-all flex flex-col max-h-[85vh]"
        data-lenis-prevent="true"
        data-lenis-prevent-scroll
        onWheel={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{ overscrollBehavior: "contain" }}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 sm:px-5 py-4 border-b border-white/10 bg-slate-950/90">
          <Search className="w-5 h-5 text-blue-400 mr-3.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveFilter("ALL");
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search 130+ agent skills, verified deals, VIP vault, GitHub repos..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-medium"
          />
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0 mr-3" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition mr-2"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={() => setIsOpen(false)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-white/10 transition"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Pills (When search query is active) */}
        {groups.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-slate-950/50 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => {
                setActiveFilter("ALL");
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeFilter === "ALL"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              All Matches <span className="ml-1 opacity-75">({totalCount})</span>
            </button>
            {groups.map((g) => {
              const Icon = getEntityIcon(g.type);
              const isActive = activeFilter === g.type;
              return (
                <button
                  key={g.type}
                  onClick={() => {
                    setActiveFilter(g.type);
                    setSelectedIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{g.label.replace("Autonomous ", "").replace("Verified ", "").replace("Advanced ", "")}</span>
                  <span className="opacity-75">({g.count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Results Body with Native Smooth Scroll & Lenis Isolation */}
        <div 
          ref={resultsContainerRef}
          data-lenis-prevent="true"
          data-lenis-prevent-scroll
          onWheel={(e) => e.stopPropagation()}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 overscroll-contain"
          style={{
            maxHeight: "calc(85vh - 130px)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.2) transparent"
          }}
        >
          {query.trim() === "" ? (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-1">
                <Command className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  Universal Intelligence Command Palette
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search across 130+ modular agent skills, verified student perks, high-star GitHub repositories, VIP vault drops, and civic datasets.
                </p>
              </div>

              {/* Quick suggestions pills */}
              <div className="pt-3 max-w-lg mx-auto">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Popular Quick Searches
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      onClick={() => setQuery(tag.q)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/10 text-xs text-slate-300 hover:text-white transition-all group"
                    >
                      <Zap className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredGroups.length === 0 && !loading ? (
            <div className="py-12 px-4 text-center space-y-2">
              <div className="text-slate-400 text-sm">
                No matching results found for &ldquo;<span className="text-white font-medium">{query}</span>&rdquo;
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for broader keywords like <span className="text-blue-400 cursor-pointer" onClick={() => setQuery("agent")}>agent</span>, <span className="text-blue-400 cursor-pointer" onClick={() => setQuery("cloud")}>cloud</span>, or <span className="text-blue-400 cursor-pointer" onClick={() => setQuery("code")}>code</span>.
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const Icon = getEntityIcon(group.type);
              return (
                <div key={group.type} className="space-y-1.5">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{group.label}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px] bg-slate-800/60 px-2 py-0.5 rounded-full border border-white/5">
                      {group.count} available
                    </span>
                  </div>

                  <div className="space-y-1">
                    {group.results.map((result) => {
                      const itemIndex = flatResults.findIndex((r) => r.id === result.id);
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={result.id}
                          ref={(el) => {
                            if (el && itemIndex >= 0) {
                              itemRefs.current.set(itemIndex, el);
                            }
                          }}
                          onClick={() => handleSelectResult(result)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`group flex items-center justify-between gap-3.5 px-3.5 py-3 rounded-2xl cursor-pointer text-xs transition-all border ${
                            isSelected
                              ? "bg-blue-600/25 border-blue-500/50 text-white shadow-md shadow-blue-950/50 translate-x-0.5"
                              : "bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800/80 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-start gap-3 truncate min-w-0">
                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 transition-colors ${
                              isSelected ? "bg-blue-500/30 text-white" : "bg-slate-800 text-slate-400 group-hover:text-white"
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="truncate min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white truncate text-xs sm:text-sm">
                                  {result.title}
                                </span>
                                {result.type === "GITHUB_REPO" && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    Verified Repo
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                                {result.subtitle}
                              </div>
                              {result.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-sans">
                                  {result.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                                result.badgeColor || "bg-slate-800 text-slate-300 border-white/5"
                              }`}
                            >
                              {result.badge}
                            </span>
                            {result.type === "GITHUB_REPO" ? (
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-slate-950/95 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 font-mono text-[10px] text-slate-300">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 font-mono text-[10px] text-slate-300">
                ↓
              </kbd>
              <span className="hidden sm:inline">to navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 font-mono text-[10px] text-slate-300">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-slate-400">Total matched:</span>
            <strong className="text-white font-mono">{flatResults.length}</strong>
            <span className="text-slate-400">items</span>
          </div>
        </div>
      </div>
    </div>
  );
}
