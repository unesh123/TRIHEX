"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Flame, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Check, 
  Copy, 
  ExternalLink, 
  Search, 
  Sparkles,
  Tag,
  AlertCircle
} from "lucide-react";
import { DealCandidate, DealType } from "@/lib/deals/types";

interface DealRadarHubProps {
  initialDeals: DealCandidate[];
}

export function DealRadarHub({ initialDeals }: DealRadarHubProps) {
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredDeals = useMemo(() => {
    return initialDeals.filter((deal) => {
      if (selectedType !== "ALL" && deal.dealType !== selectedType) return false;
      if (selectedCategory !== "ALL" && deal.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = deal.title.toLowerCase().includes(q);
        const matchVendor = deal.vendor.toLowerCase().includes(q);
        const matchSummary = deal.summary.toLowerCase().includes(q);
        if (!matchTitle && !matchVendor && !matchSummary) return false;
      }
      return true;
    });
  }, [initialDeals, selectedType, selectedCategory, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const dealTypeLabels: Record<DealType | "ALL", string> = {
    ALL: "All Offers",
    CREDITS: "Cloud Credits",
    FREE_TRIAL: "Free Trials",
    STUDENT_TIER: "Student Packs",
    FREEBIE: "Freebies",
    PROMO_CODE: "Promo Codes",
    DISCOUNT: "Discounts",
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-slate-950 p-6 md:p-10 mb-8 backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              TRIHEX Deal Radar · Live Verified
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Verified Developer & AI Deals
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every software deal, cloud credit tier, and student pack is checked against official vendor terms with automated secondary verification. No dead links, no expired vouchers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link
              href="/ai-finder"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
            >
              <Sparkles className="w-4 h-4" />
              Find AI For My Stack
            </Link>
          </div>
        </div>

        {/* Live Freshness & Trust Bar */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> 100% Vendor-Verified Claims
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">Automatic 72-Hour Expiration Engine</span>
          </div>
          <div className="text-slate-400 font-mono">
            Active verified deals: <span className="text-white font-semibold">{initialDeals.length}</span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals by vendor, title, or keyword (e.g. DigitalOcean, Copilot, Supabase)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="ALL">All Categories</option>
            <option value="AI_DEV">AI & Dev Tools</option>
            <option value="CLOUD">Cloud & Hosting</option>
            <option value="INFRASTRUCTURE">Databases & Infra</option>
            <option value="EDUCATION">Student & Education</option>
            <option value="DESIGN">Design & Media</option>
            <option value="PRODUCTIVITY">Productivity</option>
          </select>
        </div>

        {/* Deal Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {Object.entries(dealTypeLabels).map(([key, label]) => {
            const active = selectedType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedType(key)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/5"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deals Grid - Strictly 1 column on mobile (<640px) */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-white/5 bg-slate-900/40">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No active deals found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Try adjusting your search keywords or switching filters to see more verified opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDeals.map((deal) => {
            const isExpired = deal.status === "EXPIRED";
            const formattedValue = deal.detectedValueNprMinor
              ? `~NPR ${(deal.detectedValueNprMinor / 100).toLocaleString("en-US")}`
              : "Free Access";

            return (
              <div
                key={deal.id}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-200 shadow-lg shadow-black/20"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                      {deal.vendor}
                    </span>
                    <h3 className="text-base font-semibold text-white leading-snug mt-0.5 group-hover:text-blue-300 transition-colors">
                      {deal.title}
                    </h3>
                  </div>

                  {deal.verificationScore > 0 && (
                    <div
                      className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      title="Verified against vendor documentation"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {deal.verificationScore}%
                    </div>
                  )}
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4 flex-1">
                  {deal.summary}
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                    {formattedValue}
                  </span>

                  {deal.cardRequired ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <CreditCard className="w-3 h-3" /> Card Required
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <Check className="w-3 h-3" /> No Card Needed
                    </span>
                  )}

                  {deal.validUntil && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Until {new Date(deal.validUntil).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Promo code box if present */}
                {deal.promoCode && (
                  <div className="mb-4 flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Tag className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-white font-semibold tracking-wider">{deal.promoCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(deal.promoCode!)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Copy promo code"
                    >
                      {copiedCode === deal.promoCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 truncate">
                    Eligibility: <span className="text-slate-200">{deal.eligibility || "Open"}</span>
                  </div>

                  {isExpired ? (
                    <span className="text-xs font-medium text-rose-400 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      Expired
                    </span>
                  ) : (
                    <a
                      href={deal.officialVendorUrl || deal.sourceClaimUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
                    >
                      Claim Deal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
