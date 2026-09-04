"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  VaultEntry,
  VaultTabId,
  VaultPriceMode,
  VaultProvenance,
} from "@/lib/vault/vault-types";
import { filterVaultEntries } from "@/lib/vault/vault-aggregator";
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
  ExternalLink,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
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
  { id: "prompts", label: "Prompts", icon: Sparkles },
  { id: "research", label: "Public Records", icon: FileText },
];

export function UnifiedVaultHub({ initialEntries, defaultTab = "all" }: UnifiedVaultHubProps) {
  const [activeTab, setActiveTab] = useState<VaultTabId>(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceMode, setSelectedPriceMode] = useState<VaultPriceMode | "ALL">("ALL");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredEntries = useMemo(() => {
    return filterVaultEntries(initialEntries, {
      tab: activeTab,
      query: searchQuery,
      priceMode: selectedPriceMode,
      verifiedOnly,
    });
  }, [initialEntries, activeTab, searchQuery, selectedPriceMode, verifiedOnly]);

  const getProvenanceBadgeStyle = (prov: VaultProvenance) => {
    switch (prov) {
      case "TRIHEX ORIGINAL":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "TRIHEX PRODUCT":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "VERIFIED EXTERNAL DEAL":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "FREE EXTERNAL RESOURCE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "PUBLIC RECORD":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Tabs: Horizontal scroll on mobile, flex on desktop */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Vault resources, deals, prompts, or records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
            <Filter className="w-3 h-3" /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setSelectedPriceMode("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              selectedPriceMode === "ALL" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedPriceMode("FREE")}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              selectedPriceMode === "FREE" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-white"
            }`}
          >
            Free
          </button>
          <button
            type="button"
            onClick={() => setSelectedPriceMode("PAID")}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              selectedPriceMode === "PAID" ? "bg-purple-500/20 text-purple-300" : "text-slate-400 hover:text-white"
            }`}
          >
            Paid
          </button>

          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border transition-all ${
              verifiedOnly
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : "border-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Verified Only
          </button>
        </div>
      </div>

      {/* Grid: Strictly 1 card per row under 640px, 2 on md, 3 on lg */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-white/5 bg-slate-900/40">
          <Lock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No matching Vault resources found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing price filters to reveal more verified resources.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((item) => {
            const isExternal = item.priceMode === "EXTERNAL" || item.destinationUrl.startsWith("http");

            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-200 shadow-xl"
              >
                {/* Header Row: Provenance & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${getProvenanceBadgeStyle(
                      item.provenance
                    )}`}
                  >
                    {item.provenance}
                  </span>

                  {item.verificationStatus === "VERIFIED" && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-2 leading-snug">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4 flex-1">
                  {item.summary}
                </p>

                {/* Highlights */}
                {item.highlights && item.highlights.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {item.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-300 border border-white/5"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price & Action Bar */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-white">{item.displayPrice}</span>
                    {item.compareAtPrice && (
                      <span className="ml-1.5 text-[11px] font-mono text-slate-500 line-through">
                        {item.compareAtPrice}
                      </span>
                    )}
                  </div>

                  {isExternal ? (
                    <a
                      href={item.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
                    >
                      <span>Claim / Access</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      href={item.destinationUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Silent Tax Tool integrated when viewing all or developer */}
      {(activeTab === "all" || activeTab === "featured") && (
        <div className="pt-10 border-t border-white/10">
          <div className="mb-6 space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
              Interactive Economic Tool
            </span>
            <h2 className="text-xl font-bold text-white">The Silent Tax · NPR Inflation Decay Calculator</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Calculate purchasing power attrition of cash balances held in NPR vs inflation and currency debasement.
            </p>
          </div>
          <SilentTaxCalculator />
        </div>
      )}
    </div>
  );
}
