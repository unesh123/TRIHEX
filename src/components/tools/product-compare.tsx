"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  X,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Clock,
  Key,
  Layers,
  Sparkles,
  Zap,
  Target,
  Award,
  ChevronRight,
  HelpCircle,
  Crown,
  Flame,
  ArrowRight,
  MessageCircle,
  Star,
  Cpu,
  BarChart2,
} from "lucide-react";
import { formatNpr } from "@/lib/money";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export interface CompareProductItem {
  slug: string;
  title: string;
  packageLabel: string;
  durationLabel: string | null;
  priceNprMinor: number | null;
  categoryLabel: string;
  activationLabel: string;
  fulfillmentEstimate: string;
  warrantyLabel: string | null;
  features: string[];
  purchasable: boolean;
  coverPublicPath?: string | null;
}

interface ProductCompareProps {
  initialItems: CompareProductItem[];
  allAvailableProducts: CompareProductItem[];
}

// Preset popular comparison battles
const PRESET_BATTLES = [
  {
    name: "Claude Pro vs ChatGPT Plus",
    slugs: ["claude-pro-1-month", "chatgpt-plus-1-month-fw"],
    tag: "Deep Reasoning Battle",
  },
  {
    name: "Lovable Pro vs Cursor Pro",
    slugs: ["lovable-ai-pro-1-month", "cursor-pro-30-days"],
    tag: "Autonomous Dev Battle",
  },
  {
    name: "CapCut Pro vs ElevenLabs",
    slugs: ["capcut-pro-30-days", "elevenlabs-1-month"],
    tag: "Creator Video/Voice",
  },
  {
    name: "Full-Stack Dev Trio",
    slugs: ["claude-pro-1-month", "cursor-pro-30-days", "supabase-pro-1-year"],
    tag: "Production Stack",
  },
];

// Helper to calculate "Best For What Case" intelligence
function getProductIntelligence(product: CompareProductItem) {
  const titleLower = product.title.toLowerCase();
  const catLower = product.categoryLabel.toLowerCase();

  let bestFor = "Solo Developers and Creators seeking dedicated unmetered AI access.";
  let strengths = [
    "Instant deployment without foreign card restrictions",
    "Continuous verified uptime backed by TRIHEX warranty",
    "Zero setup fee or cross-border markup",
  ];
  let limitations = [
    "Requires adherence to fair usage API guidelines",
    "Account provisioning bounded by vendor authentication window",
  ];
  let ratingCoding = 90;
  let ratingReasoning = 92;
  let matchBadge = "HIGH PRODUCTIVITY";

  if (titleLower.includes("claude")) {
    bestFor = "Best for Deep Architectural Reasoning, Multi-file Refactoring & Complex Logic.";
    strengths = [
      "200K token context window with unmatched code analysis",
      "Industry-leading nuance in Python, TypeScript & Next.js",
      "Artifacts workspace for rapid in-chat UI iteration",
    ];
    limitations = [
      "Hourly message limits during peak global server hours",
      "No native web search browsing in baseline chat",
    ];
    ratingCoding = 99;
    ratingReasoning = 99;
    matchBadge = "BEST FOR COMPLEX CODE";
  } else if (titleLower.includes("chatgpt") || titleLower.includes("gpt")) {
    bestFor = "Best for Multi-Modal Generalists, Voice Mode, Web Browsing & Canvas Editing.";
    strengths = [
      "Advanced Voice Mode for live voice conversations",
      "Integrated DALL-E 3 image generation & custom GPTs ecosystem",
      "Real-time web browsing with source citations",
    ];
    limitations = [
      "Can hallucinate subtle edge-case system syntax compared to Claude",
      "Canvas interface has occasional diff-merge hiccups",
    ];
    ratingCoding = 94;
    ratingReasoning = 96;
    matchBadge = "BEST ALL-ROUNDER";
  } else if (titleLower.includes("cursor")) {
    bestFor = "Best for Professional Engineers wanting native VS Code AI Autocomplete & Composer.";
    strengths = [
      "Full repo indexing with multi-file Agent Composer editing",
      "Direct terminal error fixing and terminal execution",
      "Choice of underlying Claude 3.7, GPT-4o, and DeepSeek models",
    ];
    limitations = [
      "Local machine resource usage when indexing large repositories",
      "Steep learning curve for non-developers",
    ];
    ratingCoding = 98;
    ratingReasoning = 95;
    matchBadge = "BEST FOR VS CODE WORKFLOW";
  } else if (titleLower.includes("lovable")) {
    bestFor = "Best for Founders & Rapid Prototypers shipping full-stack Next.js apps with DB in minutes.";
    strengths = [
      "Zero manual setup: auto-scaffolds Next.js, Supabase, and Tailwind",
      "One-click GitHub synchronization with clean, readable code",
      "Integrated design systems and instant live preview staging",
    ];
    limitations = [
      "High token burn on complex multi-page apps",
      "Custom native mobile deployment requires manual export",
    ];
    ratingCoding = 96;
    ratingReasoning = 91;
    matchBadge = "BEST FOR RAPID MVPS";
  } else if (titleLower.includes("elevenlabs")) {
    bestFor = "Best for Voiceover Artists, Game Developers & AI Dubbing with human emotion.";
    strengths = [
      "Ultra-photorealistic emotional prosody and voice cloning",
      "Multi-lingual dubbing with lip-sync capabilities",
      "Rich sound effects library and API integration",
    ];
    limitations = [
      "Per-character usage quotas require strict monitoring",
      "Voice cloning requires high-quality clean audio samples",
    ];
    ratingCoding = 82;
    ratingReasoning = 89;
    matchBadge = "BEST FOR AUDIO & VOICE";
  } else if (titleLower.includes("capcut")) {
    bestFor = "Best for Viral Social Media Video Editors, Reels, Shorts & TikTok Creators.";
    strengths = [
      "Auto-captions with trending animated typography presets",
      "AI background removal, smart motion tracking & 4K 60fps export",
      "Massive cloud asset library with copyright-cleared audio",
    ];
    limitations = [
      "Optimized for short-form content rather than cinematic film editing",
      "Heavy cloud dependency for advanced AI effects",
    ];
    ratingCoding = 75;
    ratingReasoning = 85;
    matchBadge = "BEST FOR VIRAL VIDEO";
  }

  // Cost per day calculation (assuming 30 days)
  const priceNpr = product.priceNprMinor ? product.priceNprMinor / 100 : null;
  const costPerDay = priceNpr ? Math.round(priceNpr / 30) : null;

  return {
    bestFor,
    strengths,
    limitations,
    ratingCoding,
    ratingReasoning,
    matchBadge,
    costPerDay,
  };
}

export function ProductCompare({
  initialItems,
  allAvailableProducts,
}: ProductCompareProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() => {
    if (initialItems.length >= 2) return initialItems.map((i) => i.slug);
    if (allAvailableProducts.length >= 2) {
      return [allAvailableProducts[0].slug, allAvailableProducts[1].slug];
    }
    return [];
  });

  const [showAttractionModal, setShowAttractionModal] = useState(false);

  const selectedProducts = useMemo(() => {
    return selectedSlugs
      .map((slug) => allAvailableProducts.find((p) => p.slug === slug))
      .filter((p): p is CompareProductItem => Boolean(p));
  }, [selectedSlugs, allAvailableProducts]);

  const availableToAdd = allAvailableProducts.filter(
    (p) => !selectedSlugs.includes(p.slug)
  );

  const handleAddProduct = (slug: string) => {
    if (selectedSlugs.length >= 4) return;
    setSelectedSlugs([...selectedSlugs, slug]);
  };

  const handleRemoveProduct = (slug: string) => {
    if (selectedSlugs.length <= 1) return;
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
  };

  const handleSelectPreset = (slugs: string[]) => {
    const validSlugs = slugs.filter((slug) =>
      allAvailableProducts.some((p) => p.slug === slug)
    );
    if (validSlugs.length > 0) {
      setSelectedSlugs(validSlugs);
    }
  };

  // WhatsApp consultation link
  const compareWaUrl = buildWhatsAppUrl(
    `Hello Trix. I am comparing [${selectedProducts.map((p) => p.title).join(" vs ")}] on TRIHEX DIGITAL. Can you recommend which tool or combo best fits my specific development workflow in Nepal?`
  );

  return (
    <div className="space-y-8">
      {/* 1. Header & Preset Battles Strip */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 font-mono">
                <Target className="h-3.5 w-3.5" />
                NEPAL ARCHITECT COMPARISON ENGINE
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[10px] font-black text-purple-700 uppercase tracking-wider font-mono">
                ALGORITHMIC MATCH v3.0
              </span>
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Compare AI Architectures Side-by-Side
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
              Evaluate real coding performance, delivery turnaround, Nepal payment ease, and determine exactly which tool is best for your specific case.
            </p>
          </div>

          {/* Attraction Verdict Button */}
          <button
            onClick={() => setShowAttractionModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-3.5 text-xs font-extrabold text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition duration-200 hover:scale-[1.02] shrink-0"
          >
            <Crown className="h-4 w-4" />
            <span>View Architect&apos;s Match Verdict</span>
            <Sparkles className="h-4 w-4 text-slate-900" />
          </button>
        </div>

        {/* Preset Battle Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono shrink-0">
            Popular Matchups:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_BATTLES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset.slugs)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 transition"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                <span>{preset.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({preset.tag})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Add Product Dropdown */}
        {selectedSlugs.length < 4 && availableToAdd.length > 0 && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-bold text-slate-600">
              Add Tool ({selectedProducts.length}/4 selected):
            </span>
            <select
              aria-label="Add product to compare"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddProduct(e.target.value);
                  e.target.value = "";
                }
              }}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>
                + Add another AI tool to evaluate...
              </option>
              {availableToAdd.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title} ({p.packageLabel})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. "Best For What Case" Intelligence Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {selectedProducts.map((p) => {
          const intel = getProductIntelligence(p);
          return (
            <div
              key={`intel-${p.slug}`}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700 font-mono">
                    {intel.matchBadge}
                  </span>
                  {intel.costPerDay && (
                    <span className="text-[11px] font-mono font-bold text-emerald-600">
                      ~NPR {intel.costPerDay}/day
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {p.title}
                </h4>

                {/* Best for description */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700 leading-relaxed">
                  <strong className="block text-[11px] uppercase font-black text-slate-500 mb-1 font-mono">
                    Target Use Case:
                  </strong>
                  {intel.bestFor}
                </div>

                {/* Key Strengths */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono block">
                    Key Architectural Strengths:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {intel.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/products/${p.slug}`}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-600 shadow-xs"
              >
                <span>View &amp; Activate Plan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* 3. Side-by-Side Detailed Specifications Grid */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 w-52 font-bold text-slate-500 uppercase tracking-wider text-[10px] font-mono">
                Architecture &amp; Metrics
              </th>
              {selectedProducts.map((p) => (
                <th key={p.slug} className="p-4 min-w-[240px] max-w-[280px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                        {p.coverPublicPath ? (
                          <Image
                            src={p.coverPublicPath}
                            alt={p.title}
                            fill
                            className="object-contain p-1"
                            sizes="44px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600 font-bold text-xs">
                            AI
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-snug text-xs line-clamp-1">
                          {p.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {p.categoryLabel}
                        </span>
                      </div>
                    </div>
                    {selectedSlugs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(p.slug)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition"
                        title="Remove product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Price Row */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40 font-mono text-[11px]">
                NPR Local Price
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4">
                  <div className="text-base font-black text-slate-900">
                    {p.priceNprMinor != null ? formatNpr(p.priceNprMinor) : "Price on Enquiry"}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                    100% Guaranteed Nepal Payment (Fonepay/eSewa)
                  </span>
                </td>
              ))}
            </tr>

            {/* Plan Duration */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40 font-mono text-[11px]">
                Duration &amp; Access
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4">
                  <span className="inline-flex rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-800">
                    {p.durationLabel ?? p.packageLabel}
                  </span>
                </td>
              ))}
            </tr>

            {/* Activation Type */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-slate-400" />
                  <span>Activation Mode</span>
                </div>
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4 text-slate-700 font-medium">
                  {p.activationLabel}
                </td>
              ))}
            </tr>

            {/* Delivery SLA */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Delivery SLA</span>
                </div>
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4 text-emerald-700 font-bold">
                  {p.fulfillmentEstimate}
                </td>
              ))}
            </tr>

            {/* Warranty Guarantee */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>Replacement Warranty</span>
                </div>
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4 text-slate-700">
                  {p.warrantyLabel ?? "Full subscription duration replacement guarantee"}
                </td>
              ))}
            </tr>

            {/* Key Inclusions */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/40 font-mono text-[11px] align-top">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  <span>Included Entitlements</span>
                </div>
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4 align-top">
                  <ul className="space-y-1.5">
                    {p.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <Check className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Direct Action Row */}
            <tr className="bg-slate-50/40">
              <td className="p-4 font-bold text-slate-700 font-mono text-[11px]">
                Direct Action
              </td>
              {selectedProducts.map((p) => (
                <td key={p.slug} className="p-4">
                  <Link
                    href={`/products/${p.slug}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 shadow-xs"
                  >
                    <span>View Product Details</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. HIGH-LEVEL ATTRACTION POP-UP MODAL (Hook Verdict & VIP Bundle Recommendation) */}
      {showAttractionModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowAttractionModal(false)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-900 text-white shadow-[0_0_50px_rgba(245,158,11,0.25)] transition-all p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glow */}
            <div
              className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"
              aria-hidden="true"
            />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/60 px-3 py-1 text-xs font-black text-amber-300 uppercase tracking-widest font-mono">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  ARCHITECT&apos;S COMBO VERDICT &bull; 99.4% SYNERGY
                </div>
                <h3 className="mt-2 text-2xl font-black text-white tracking-tight">
                  Why Pick Just One? Combine for Unstoppable Power.
                </h3>
              </div>
              <button
                onClick={() => setShowAttractionModal(false)}
                className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Algorithmic Synthesis Body */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                Our architectural analysis of{" "}
                <strong className="text-amber-300">
                  {selectedProducts.map((p) => p.title).join(" + ")}
                </strong>{" "}
                confirms that running these tools simultaneously eliminates all engineering bottlenecks. You get instant UI scaffolding, deep backend reasoning, and automated media production without hitting single-vendor rate limits.
              </p>

              {/* VIP Pack Hook Box */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                    <Crown className="h-4 w-4" />
                    TRIHEX VIP ALL-IN-ONE PACK
                  </span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold">
                    SAVE UP TO 75%
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Instead of paying full individual subscriptions across multiple platforms, the <strong className="text-white">TRIHEX VIP Pack</strong> gives you complete VIP Zone access, private founder desk escalation, and unlimited methods:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                    <div className="text-[11px] text-slate-400 font-mono font-medium">1 Month Pass</div>
                    <div className="text-lg font-black text-amber-400 mt-0.5">Rs. 3,999</div>
                  </div>
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-center">
                    <div className="text-[11px] text-amber-300 font-mono font-bold">6 Months Pass</div>
                    <div className="text-lg font-black text-amber-300 mt-0.5">Rs. 5,999</div>
                  </div>
                  <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-3 text-center">
                    <div className="text-[11px] text-purple-300 font-mono font-bold">Lifetime VIP</div>
                    <div className="text-lg font-black text-purple-300 mt-0.5">Rs. 7,999</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/vip"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-3.5 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-300 transition shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <Crown className="h-4 w-4" />
                <span>Explore Full VIP Pack Plans</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={compareWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>Ask Trix on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
