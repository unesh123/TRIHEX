"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  ShoppingBag, 
  Cpu, 
  ArrowRight 
} from "lucide-react";
import { SavedItem, SavedEntityType } from "@/lib/saved/types";

export default function SavedItemsPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | SavedEntityType>("ALL");

  useEffect(() => {
    const guestId = localStorage.getItem("trihex_guest_id");
    if (!guestId) {
      setLoading(false);
      return;
    }

    fetch(`/api/saved?userId=${encodeURIComponent(guestId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setItems(data.items);
        }
      })
      .catch((err) => console.error("Failed to load saved items:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (item: SavedItem) => {
    const guestId = localStorage.getItem("trihex_guest_id");
    if (!guestId) return;

    // Optimistic removal
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    try {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: guestId,
          entityType: item.entityType,
          entityId: item.entityId,
        }),
      });
    } catch {
      // Revert if error
      setItems((prev) => [item, ...prev]);
    }
  };

  const filteredItems = items.filter((i) => {
    if (activeFilter === "ALL") return true;
    return i.entityType === activeFilter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
          <Bookmark className="w-3.5 h-3.5 fill-red-400 text-red-400" />
          Saved Library
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Your Bookmarks & Saved Items
        </h1>
        <p className="text-sm text-slate-400">
          Easily access your saved software deals, AI prompts, agent skills, and product licenses. Synchronized automatically across your guest session.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
        <button
          type="button"
          onClick={() => setActiveFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === "ALL"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-slate-400 hover:text-white bg-white/5"
          }`}
        >
          All Items ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("DEAL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === "DEAL"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-slate-400 hover:text-white bg-white/5"
          }`}
        >
          Deals ({items.filter((i) => i.entityType === "DEAL").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("PROMPT")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === "PROMPT"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-slate-400 hover:text-white bg-white/5"
          }`}
        >
          Prompts ({items.filter((i) => i.entityType === "PROMPT").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("SKILL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === "SKILL"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-slate-400 hover:text-white bg-white/5"
          }`}
        >
          Skills ({items.filter((i) => i.entityType === "SKILL").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("PRODUCT")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === "PRODUCT"
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "text-slate-400 hover:text-white bg-white/5"
          }`}
        >
          Products ({items.filter((i) => i.entityType === "PRODUCT").length})
        </button>
      </div>

      {/* Grid of Saved Items */}
      {loading ? (
        <div className="p-16 text-center text-sm text-slate-400 font-mono">
          Loading your saved items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No saved items found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore our software deals, prompts library, or catalog and click the bookmark icon to save items here.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/deals"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all"
            >
              Explore Deals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/prompts"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
            >
              Explore Prompts
            </Link>
          </div>
        </div>
      ) : (
        /* Mobile: strictly 1 column (grid-cols-1), sm: 2 cols, lg: 3 cols */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const meta = item.metadata;
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-white/10 bg-slate-900/80 p-5 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        meta?.badgeColor || "bg-slate-800 text-slate-300 border-white/10"
                      }`}
                    >
                      {meta?.badge || item.entityType}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      title="Remove from saved items"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {meta?.title || item.entityId}
                    </h3>
                    {meta?.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {meta.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-300">
                    {meta?.priceOrValue || item.entityType}
                  </span>

                  <Link
                    href={meta?.url || "#"}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
