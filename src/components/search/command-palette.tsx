"use client";

import { useEffect, useState, useRef } from "react";
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
  ShoppingBag
} from "lucide-react";
import { UniversalSearchGroup, UniversalSearchResult } from "@/lib/search/universal-search";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<UniversalSearchGroup[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Flattened results for keyboard arrow navigation
  const flatResults = groups.flatMap((g) => g.results);

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

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setGroups([]);
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
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setGroups(data.groups || []);
        setSelectedIndex(0);
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

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
        setIsOpen(false);
        router.push(target.url);
      }
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return ShoppingBag;
      case "DEAL":
        return Flame;
      case "PROMPT":
        return Sparkles;
      case "SKILL":
        return Cpu;
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl backdrop-blur-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/10 bg-slate-950/80">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search products, deals, prompts, skills, guides, datasets..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
          />
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0 mr-2" />
          ) : null}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {query.trim() === "" ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-2">
              <Command className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-medium text-slate-300">
                Type keywords to search across the entire TRIHEX digital intelligence platform
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Products</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Deal Radar</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Prompts</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Skills</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Nepal Datasets</span>
              </div>
            </div>
          ) : groups.length === 0 && !loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            groups.map((group) => {
              const Icon = getEntityIcon(group.type);
              return (
                <div key={group.type} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Icon className="w-3 h-3" />
                    <span>{group.label}</span>
                    <span className="text-slate-600">({group.count})</span>
                  </div>

                  <div className="space-y-1">
                    {group.results.map((result) => {
                      const itemIndex = flatResults.findIndex((r) => r.id === result.id);
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={result.id}
                          onClick={() => {
                            setIsOpen(false);
                            router.push(result.url);
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                            isSelected
                              ? "bg-blue-600/30 text-white border border-blue-500/40"
                              : "text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                            <div className="truncate">
                              <div className="font-medium text-white truncate">{result.title}</div>
                              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                {result.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                result.badgeColor || "bg-slate-800 text-slate-300 border-white/5"
                              }`}
                            >
                              {result.badge}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
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
        <div className="px-4 py-2 bg-slate-950/90 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 font-mono text-[10px]">
                ↑
              </kbd>{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 font-mono text-[10px]">
                ↓
              </kbd>{" "}
              to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 font-mono text-[10px]">
                ↵
              </kbd>{" "}
              to select
            </span>
          </div>

          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 font-mono text-[10px]">
              ESC
            </kbd>{" "}
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
