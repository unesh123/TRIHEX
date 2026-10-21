"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Crown,
  Search,
  ExternalLink,
  Sparkles,
  Check,
  Tag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  X,
  Layers,
  Flame,
  Gift,
  HelpCircle,
  Menu,
} from "lucide-react";
import rawOffersData from "@/lib/vip/flux-offers-data.json";

export interface FluxOffer {
  slug: string;
  name: string;
  offer: string;
  desc: string;
  url: string;
  domain: string;
  category: string;
  sub?: string;
  type: string;
  platform?: string;
  region?: string;
  verified?: string;
  alts?: Array<{ label: string; url: string; note?: string }>;
}

const ALL_OFFERS = rawOffersData as FluxOffer[];

const CATEGORIES_LIST = [
  { name: "AI & Machine Learning", count: 100 },
  { name: "Development Tools", count: 83 },
  { name: "Design & Creative", count: 66 },
  { name: "Productivity", count: 61 },
  { name: "Learning & Education", count: 54 },
  { name: "Media & Entertainment", count: 39 },
  { name: "Cloud & Hosting", count: 35 },
  { name: "Shopping & Lifestyle", count: 34 },
  { name: "Travel & Finance", count: 18 },
  { name: "Science & Research", count: 17 },
  { name: "Food & Dining", count: 14 },
  { name: "Health & Wellness", count: 13 },
  { name: "Security & Privacy", count: 13 },
  { name: "Student Memberships", count: 13 },
  { name: "Marketing & Growth", count: 4 },
];

export function FluxDirectoryVault() {
  const [selectedCategory, setSelectedCategory] = useState<string>("AI & Machine Learning");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [activeModalOffer, setActiveModalOffer] = useState<FluxOffer | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Filter offers based on category, search, and type
  const filteredOffers = useMemo(() => {
    return ALL_OFFERS.filter((item) => {
      // 1. Search query: when user types any keyword, search across the entire directory
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesOffer = item.offer.toLowerCase().includes(q);
        const matchesDesc = item.desc.toLowerCase().includes(q);
        const matchesSub = item.sub?.toLowerCase().includes(q);
        const matchesDomain = item.domain.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);
        const matchesPlatform = item.platform?.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesOffer &&
          !matchesDesc &&
          !matchesSub &&
          !matchesDomain &&
          !matchesCategory &&
          !matchesType &&
          !matchesPlatform
        ) {
          return false;
        }

        // If user also selected a type filter (Credit / Free / Discount)
        if (selectedType !== "ALL") {
          if (!item.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
        }

        return true;
      }

      // 2. Category filter (applies when not searching by keyword)
      if (selectedCategory !== "ALL_DEALS" && selectedCategory !== "FREEBIES") {
        if (item.category !== selectedCategory) return false;
      } else if (selectedCategory === "FREEBIES") {
        const t = item.type.toLowerCase();
        if (!t.includes("free") && !t.includes("credit")) return false;
      }

      // 3. Type filter
      if (selectedType !== "ALL") {
        if (!item.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
      }

      return true;
    });
  }, [selectedCategory, selectedType, searchQuery]);

  const currentCategoryTitle = searchQuery.trim()
    ? `Keyword Results: "${searchQuery.trim()}"`
    : selectedCategory === "ALL_DEALS"
    ? "All Verified Deals & Offers"
    : selectedCategory === "FREEBIES"
    ? "100% Free Resources & Credits"
    : selectedCategory;

  const currentCount = searchQuery.trim()
    ? filteredOffers.length
    : selectedCategory === "ALL_DEALS"
    ? 564
    : selectedCategory === "FREEBIES"
    ? 232
    : CATEGORIES_LIST.find((c) => c.name === selectedCategory)?.count || filteredOffers.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-amber-400 selection:text-slate-950">
      {/* Top Mobile Bar with Category Drawer Toggle & Search */}
      <div className="lg:hidden sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
            >
              <Menu className="h-4 w-4" />
              <span>Categories</span>
            </button>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 border border-amber-300">
              👑 VIP
            </span>
          </div>

          <div className="relative flex-1 max-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile Horizontal Category Scroller */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES_LIST.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                  isActive
                    ? "bg-slate-950 text-white font-bold"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white p-5 min-h-screen">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-2.5 pb-5 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-amber-400 font-black shadow-md">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-950 block leading-tight">
                TRIHEX VAULT
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 font-bold">
                VIP Intelligence Hub
              </span>
            </div>
          </div>

          {/* MAIN Section */}
          <div className="mt-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-2 mb-1.5 font-mono">
              MAIN
            </span>
            <button
              type="button"
              onClick={() => { setSelectedCategory("ALL_DEALS"); setSelectedType("ALL"); }}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                selectedCategory === "ALL_DEALS"
                  ? "bg-slate-100 text-slate-950 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>All Directory</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedCategory("AI & Machine Learning"); }}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                selectedCategory === "AI & Machine Learning"
                  ? "bg-slate-100 text-slate-950 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>Browse</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedCategory("FREEBIES"); }}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                selectedCategory === "FREEBIES"
                  ? "bg-slate-100 text-slate-950 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>Freebies</span>
            </button>
          </div>

          {/* COLLECTIONS Section */}
          <div className="mt-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-2 mb-1.5 font-mono">
              COLLECTIONS
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL_DEALS")}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                selectedCategory === "ALL_DEALS"
                  ? "bg-slate-100 text-slate-950 font-bold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>All deals</span>
              <span className="text-[11px] font-mono font-semibold text-slate-400">564</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("FREEBIES")}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                selectedCategory === "FREEBIES"
                  ? "bg-slate-100 text-slate-950 font-bold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>100% free</span>
              <span className="text-[11px] font-mono font-semibold text-slate-400">232</span>
            </button>
            <div className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-600">
              <span>Categories</span>
              <span className="text-[11px] font-mono font-semibold text-slate-400">15</span>
            </div>
          </div>

          {/* CATEGORIES Section with Exact Counts */}
          <div className="mt-5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-2 mb-1.5 font-mono">
              CATEGORIES
            </span>
            <div className="max-h-[360px] overflow-y-auto pr-1 space-y-0.5 scrollbar-thin">
              {CATEGORIES_LIST.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                      isSelected
                        ? "bg-slate-950 text-white font-bold shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? "text-amber-400 font-bold" : "text-slate-400"}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-updated hourly badge */}
          <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white shadow-md">
            <h5 className="text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Auto-updated hourly</span>
            </h5>
            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
              The directory re-ranks itself every hour, so the freshest access sits on top.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCategory("ALL_DEALS"); setSearchQuery(""); }}
              className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-center text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow"
            >
              Browse everything
            </button>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
          {/* Header Bar */}
          <div className="hidden lg:flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-xs">
                <Crown className="h-3.5 w-3.5 text-amber-600" />
                <span>TRIHEX VIP CLEARANCE ACTIVE</span>
              </span>
              <span className="text-xs font-mono text-slate-500">
                564 Live Verified Directory Assets
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals, credits, tools…"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Header */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">
              CATEGORY
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              {currentCategoryTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {currentCount} verified offers in this category.
            </p>
          </div>

          {/* Horizontal Category Pill Tabs (Desktop) */}
          <div className="hidden lg:flex gap-2 overflow-x-auto pb-2 pt-3 scrollbar-none">
            <button
              type="button"
              onClick={() => { setSelectedCategory("ALL_DEALS"); setSearchQuery(""); }}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs transition ${
                selectedCategory === "ALL_DEALS" && !searchQuery
                  ? "bg-slate-950 text-white font-bold shadow-xs"
                  : "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              All Deals (564)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedCategory("FREEBIES"); setSearchQuery(""); }}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs transition ${
                selectedCategory === "FREEBIES" && !searchQuery
                  ? "bg-slate-950 text-white font-bold shadow-xs"
                  : "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              100% Freebies (232)
            </button>
            {CATEGORIES_LIST.map((cat) => {
              const isActive = selectedCategory === cat.name && !searchQuery;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => { setSelectedCategory(cat.name); setSearchQuery(""); }}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs transition ${
                    isActive
                      ? "bg-slate-950 text-white font-bold shadow-xs"
                      : "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              );
            })}
          </div>

          {/* Type Filter Pills (Credit, Free, Discount) */}
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-mono mr-1">Type:</span>
            {["ALL", "Credit", "Free", "Discount"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`rounded-md px-2.5 py-1 text-xs transition ${
                  selectedType === type
                    ? "bg-slate-900 text-white font-bold"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Offer Cards Grid - Exactly Matching Screenshot */}
          <div className="mt-6 grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredOffers.map((item) => {
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`;
              const typeLower = item.type.toLowerCase();
              const isCredit = typeLower.includes("credit");
              const isDiscount = typeLower.includes("discount");
              const isFree = typeLower.includes("free");

              return (
                <div
                  key={item.slug}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition duration-150"
                >
                  {/* Top Header: Logo + Title + Desc */}
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 flex items-center justify-center">
                        <img
                          src={faviconUrl}
                          alt={item.name}
                          className="h-7 w-7 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Badge: CREDIT / DISCOUNT / FREE */}
                    <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          isCredit
                            ? "bg-[#E6F4EA] text-[#137333]"
                            : isDiscount
                            ? "bg-[#E8F0FE] text-[#1A73E8]"
                            : "bg-[#E6F4EA] text-[#137333]"
                        }`}
                      >
                        {item.type}
                      </span>
                      {Boolean(searchQuery.trim() || selectedCategory === "ALL_DEALS" || selectedCategory === "FREEBIES") && (
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Offer Highlight */}
                    <p className="mt-2.5 text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                      {item.offer}
                    </p>

                    {/* Tag Pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded bg-[#F1F3F4] text-[#5F6368] px-2 py-0.5 text-[10px] font-medium">
                        {item.category}
                      </span>
                      {item.sub && (
                        <span className="rounded bg-[#F1F3F4] text-[#5F6368] px-2 py-0.5 text-[10px] font-medium">
                          {item.sub}
                        </span>
                      )}
                      <span className="rounded bg-[#F1F3F4] text-[#5F6368] px-2 py-0.5 text-[10px] font-medium">
                        {item.region || "Global"}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveModalOffer(item)}
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900 transition"
                    >
                      DETAILS
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-indigo-600 transition"
                    >
                      <span>Claim</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOffers.length === 0 && (
            <div className="my-16 rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
              <Search className="mx-auto h-8 w-8 text-slate-400" />
              <h4 className="mt-3 text-sm font-bold text-slate-900">No matching offers found</h4>
              <p className="mt-1 text-xs text-slate-500">Try adjusting your keyword or selecting a different category.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSelectedType("ALL"); setSelectedCategory("ALL_DEALS"); }}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-150">
          <div className="relative w-4/5 max-w-xs bg-white p-5 h-full overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-extrabold text-base text-slate-900">Categories</span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                <button
                  type="button"
                  onClick={() => { setSelectedCategory("ALL_DEALS"); setMobileDrawerOpen(false); }}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
                >
                  <span>All Deals</span>
                  <span className="text-slate-400 font-mono">564</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory("FREEBIES"); setMobileDrawerOpen(false); }}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
                >
                  <span>100% Free Resources</span>
                  <span className="text-slate-400 font-mono">232</span>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-0.5">
                {CATEGORIES_LIST.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => { setSelectedCategory(cat.name); setMobileDrawerOpen(false); }}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                      selectedCategory === cat.name
                        ? "bg-slate-950 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="font-mono text-[10px]">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Details Modal */}
      {activeModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveModalOffer(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="relative h-12 w-12 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${activeModalOffer.domain}&sz=64`}
                  alt={activeModalOffer.name}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{activeModalOffer.name}</h3>
                <span className="text-xs text-slate-400 font-mono">{activeModalOffer.domain}</span>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs text-slate-600">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  OFFER HIGHLIGHT
                </span>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {activeModalOffer.offer}
                </p>
              </div>

              <p className="leading-relaxed text-slate-700">{activeModalOffer.desc}</p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400">CATEGORY:</span>
                  <p className="font-semibold text-slate-900">{activeModalOffer.category}</p>
                </div>
                <div>
                  <span className="text-slate-400">BENEFIT TYPE:</span>
                  <p className="font-semibold text-slate-900 uppercase">{activeModalOffer.type}</p>
                </div>
                <div>
                  <span className="text-slate-400">PLATFORM:</span>
                  <p className="font-semibold text-slate-900">{activeModalOffer.platform || "Web"}</p>
                </div>
                <div>
                  <span className="text-slate-400">REGION:</span>
                  <p className="font-semibold text-slate-900">{activeModalOffer.region || "Global"}</p>
                </div>
              </div>

              {activeModalOffer.alts && activeModalOffer.alts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    ALTERNATE REDEMPTION LINKS
                  </span>
                  <div className="space-y-1.5">
                    {activeModalOffer.alts.map((alt, idx) => (
                      <a
                        key={idx}
                        href={alt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
                      >
                        <span>{alt.label}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModalOffer(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <a
                href={activeModalOffer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-600 transition"
              >
                <span>Claim Offer Now</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
