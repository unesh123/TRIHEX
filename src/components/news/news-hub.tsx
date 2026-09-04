"use client";

import { useState, useMemo } from "react";
import { NewsArticle, NewsCategory } from "@/lib/news/types";
import { NewsCard } from "./news-card";
import { Search, Flame, Radio, Newspaper, ShieldCheck, Filter } from "lucide-react";

interface NewsHubProps {
  initialArticles: NewsArticle[];
  defaultCategory?: NewsCategory | "ALL";
}

const CATEGORIES: Array<{ id: NewsCategory | "ALL"; label: string }> = [
  { id: "ALL", label: "All Intelligence" },
  { id: "NEPAL_TECH", label: "Nepal Tech" },
  { id: "AI_GLOBAL", label: "Global AI" },
  { id: "ECONOMIC_POLICY", label: "Economic Policy" },
  { id: "CIVIC_INFRASTRUCTURE", label: "Civic Infra" },
];

export function NewsHub({ initialArticles, defaultCategory = "ALL" }: NewsHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | "ALL">(defaultCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [minHotOnly, setMinHotOnly] = useState(false);

  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      if (selectedCategory !== "ALL" && article.category !== selectedCategory) {
        return false;
      }
      if (minHotOnly && article.hotScore < 85) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          article.title.toLowerCase().includes(q) ||
          article.excerpt.toLowerCase().includes(q) ||
          article.source.toLowerCase().includes(q) ||
          article.tags.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [initialArticles, selectedCategory, minHotOnly, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Control Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-white bg-slate-950/60 border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right side: Search & Hot filter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMinHotOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              minHotOnly
                ? "bg-red-500/20 text-red-300 border-red-500/40"
                : "bg-slate-950/60 text-slate-400 border-white/5 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Hot &gt; 85</span>
          </button>

          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, policy, tools..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Grid: 1 card per row on mobile (<640px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16 rounded-3xl border border-white/10 bg-slate-900/40 text-slate-400 text-sm space-y-2">
          <Newspaper className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-semibold text-white">No intelligence articles matched your filters</p>
          <p className="text-xs text-slate-400">Try searching for different keywords or resetting your topic selection.</p>
        </div>
      )}
    </div>
  );
}
