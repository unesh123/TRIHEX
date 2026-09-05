"use client";

import { useState, useMemo } from "react";
import {
  VaultEntry,
  VaultTabId,
  VaultPriceMode,
} from "@/lib/vault/vault-types";
import { filterVaultEntries } from "@/lib/vault/vault-filters";
import { VaultEntryCard } from "@/components/vault/vault-entry-card";
import { SilentTaxCalculator } from "@/components/vault/silent-tax-calculator";
import {
  Flame,
  Star,
  Lock,
  Tag,
  Gift,
  Sparkles,
  BookOpen,
  FileText,
  Search,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkle,
} from "lucide-react";

interface UnifiedVaultHubProps {
  initialEntries: VaultEntry[];
  defaultTab?: VaultTabId;
}

const TABS: { id: VaultTabId; label: string; icon: any }[] = [
  { id: "all", label: "All Items", icon: Flame },
  { id: "featured", label: "Featured", icon: Star },
  { id: "deals", label: "Verified Deals", icon: Tag },
  { id: "premium", label: "VIP Bundles", icon: Lock },
  { id: "free", label: "Free Perks", icon: Gift },
  { id: "prompts", label: "AI Prompts", icon: Sparkles },
  { id: "guides", label: "Guides", icon: BookOpen },
  { id: "research", label: "Public Records", icon: FileText },
];

export function UnifiedVaultHub({
  initialEntries,
  defaultTab = "all",
}: UnifiedVaultHubProps) {
  const [activeTab, setActiveTab] = useState<VaultTabId>(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceMode, setSelectedPriceMode] = useState<VaultPriceMode | "ALL">("ALL");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Accurate tab counts computed from real database entries
  const tabCounts = useMemo(() => {
    return {
      all: initialEntries.length,
      featured: initialEntries.filter((e) => e.isFeatured).length,
      deals: initialEntries.filter((e) => e.tabCategory === "deals").length,
      premium: initialEntries.filter(
        (e) => e.tabCategory === "premium" || e.entityType === "PRODUCT"
      ).length,
      free: initialEntries.filter((e) => e.priceMode === "FREE").length,
      prompts: initialEntries.filter(
        (e) => e.tabCategory === "prompts" || e.entityType === "PROMPT_PACK"
      ).length,
      guides: initialEntries.filter(
        (e) => e.tabCategory === "guides" || e.entityType === "GUIDE"
      ).length,
      research: initialEntries.filter(
        (e) => e.tabCategory === "research" || e.entityType === "RESEARCH"
      ).length,
    };
  }, [initialEntries]);

  // Real-time filtered entries
  const filteredEntries = useMemo(() => {
    return filterVaultEntries(initialEntries, {
      tab: activeTab,
      query: searchQuery,
      priceMode: selectedPriceMode,
      verifiedOnly,
    });
  }, [initialEntries, activeTab, searchQuery, selectedPriceMode, verifiedOnly]);

  return (
    <div className="space-y-8">
      {/* 1. Live Discovery Metrics Header (Compact 4-Pill Bar) */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% VERIFIED PROVENANCE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 font-mono">
              <Tag className="h-3.5 w-3.5" />
              LIVE DEAL RADAR
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-800 font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              CURATED PROMPT VAULT
            </span>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            {initialEntries.length} verified records in archive
          </span>
        </div>

        {/* Live Counters Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Tag className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified Deals</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
              {tabCounts.deals}
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-emerald-700">
              Live software savings
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Gift className="h-3.5 w-3.5 text-cyan-600" />
              <span>Free Perks</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
              {tabCounts.free}
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-cyan-700">
              Cloud credits &amp; tools
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Lock className="h-3.5 w-3.5 text-indigo-600" />
              <span>VIP Bundles</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
              {tabCounts.premium}
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-indigo-700">
              Classified courses &amp; stacks
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>AI Prompts</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
              {tabCounts.prompts}
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-purple-700">
              Engineering toolkits
            </p>
          </div>
        </div>
      </div>

      {/* 2. Category Tabs (High Contrast Active/Hover States) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id as keyof typeof tabCounts] ?? 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "bg-slate-950 text-white shadow-sm ring-1 ring-slate-950"
                  : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? "text-blue-400" : "text-slate-500"
                }`}
              />
              <span>{tab.label}</span>
              <span
                className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive
                    ? "bg-slate-800 text-blue-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & High-Contrast Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="vault-search"
            name="vault-search"
            aria-label="Search Vault resources, deals, prompts, or records"
            type="text"
            placeholder="Search Vault resources, deals, prompts, or records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 px-1 py-0.5"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setSelectedPriceMode("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedPriceMode === "ALL"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setSelectedPriceMode("FREE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedPriceMode === "FREE"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200 shadow-2xs"
            }`}
          >
            Free
          </button>

          <button
            type="button"
            onClick={() => setSelectedPriceMode("PAID")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedPriceMode === "PAID"
                ? "bg-purple-600 text-white shadow-2xs"
                : "bg-white text-purple-800 hover:bg-purple-50 border border-purple-200 shadow-2xs"
            }`}
          >
            Paid
          </button>

          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              verifiedOnly
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
            }`}
          >
            <ShieldCheck
              className={`w-3.5 h-3.5 ${
                verifiedOnly ? "text-white" : "text-blue-600"
              }`}
            />
            <span>Verified Only</span>
          </button>
        </div>
      </div>

      {/* 4. Filter Results Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-900">{filteredEntries.length}</strong> items
          {searchQuery && (
            <span> matching &ldquo;<strong className="text-slate-900">{searchQuery}</strong>&rdquo;</span>
          )}
        </span>
        {(searchQuery || selectedPriceMode !== "ALL" || verifiedOnly) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedPriceMode("ALL");
              setVerifiedOnly(false);
            }}
            className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* 5. Grid of VaultCard 2.0 Components */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            No matching Vault resources found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing price filters to reveal more verified resources.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedPriceMode("ALL");
              setVerifiedOnly(false);
              setActiveTab("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-blue-600 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((item) => (
            <VaultEntryCard key={item.id} entry={item} />
          ))}
        </div>
      )}

      {/* 6. The Silent Tax Interactive Economic Tool */}
      {(activeTab === "all" || activeTab === "featured") && (
        <div className="pt-10 border-t border-slate-200">
          <div className="mb-6 space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
              Interactive Economic Tool
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              The Silent Tax · Historical Purchasing Power &amp; Inflation Decay
            </h2>
            <p className="text-xs text-slate-600 max-w-xl">
              Calculate purchasing power attrition of cash balances held over time vs inflation, gold equivalence, and currency debasement.
            </p>
          </div>
          <SilentTaxCalculator />
        </div>
      )}
    </div>
  );
}
