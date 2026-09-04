"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Video,
  Code2,
  Brain,
  DollarSign,
  Palette,
  Layers,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { formatNpr } from "@/lib/money";

export interface RecommendedProduct {
  slug: string;
  title: string;
  packageLabel: string;
  priceNprMinor: number;
  categoryLabel: string;
  whyIncluded: string;
  coverPublicPath?: string | null;
}

export interface GoalPreset {
  id: string;
  title: string;
  shortDesc: string;
  icon: typeof Video;
  tag: string;
  recommendations: RecommendedProduct[];
}

const PRESETS: GoalPreset[] = [
  {
    id: "video-creation",
    title: "Viral Video & Filmmaking Stack",
    shortDesc: "Generate cinematic AI B-roll, realistic cloned voices, and auto-captioned reels.",
    icon: Video,
    tag: "High ROI for Creators",
    recommendations: [
      {
        slug: "kling-ultra-26k-credits",
        title: "Kling AI Ultra Studio",
        packageLabel: "26,000 Generation Credits",
        priceNprMinor: 1199900,
        categoryLabel: "Video AI",
        whyIncluded: "Hollywood-grade video generation with high motion consistency.",
        coverPublicPath: "/media/products/kling-ultra-26k-credits/kling-ultra-26k-credits-thumbnail.webp",
      },
      {
        slug: "elevenlabs-creator-shared",
        title: "ElevenLabs Creator Voice",
        packageLabel: "Creator Monthly Plan",
        priceNprMinor: 220000,
        categoryLabel: "Voice AI",
        whyIncluded: "Industry standard voice cloning with zero robotic artifacts.",
        coverPublicPath: "/media/products/elevenlabs-creator-shared/elevenlabs-creator-shared-thumbnail.webp",
      },
      {
        slug: "capcut-pro",
        title: "CapCut Pro Video Suite",
        packageLabel: "Annual License",
        priceNprMinor: 499900,
        categoryLabel: "Video Editing",
        whyIncluded: "One-click auto-captions, 4K export, and trending TikTok templates.",
        coverPublicPath: "/media/products/capcut-pro/capcut-pro-thumbnail.webp",
      },
    ],
  },
  {
    id: "software-dev",
    title: "Autonomous Software Engineering",
    shortDesc: "Full AI pair programming: IDE completion, terminal agent CLI, and scalable backend.",
    icon: Code2,
    tag: "10x Developer Productivity",
    recommendations: [
      {
        slug: "cursor-pro-12m",
        title: "Cursor Pro 12M Annual",
        packageLabel: "12-Month Dedicated License",
        priceNprMinor: 1799900,
        categoryLabel: "AI Coding",
        whyIncluded: "500 fast Claude 3.5 & GPT-4o requests per month inside VS Code fork.",
        coverPublicPath: "/media/products/cursor-pro-12m/cursor-pro-12m-thumbnail.webp",
      },
      {
        slug: "claude-code-api-access",
        title: "Claude Code CLI Access",
        packageLabel: "Terminal Agent Access",
        priceNprMinor: 349900,
        categoryLabel: "Developer Tools",
        whyIncluded: "Anthropic's autonomous terminal coding agent for deep codebase refactors.",
        coverPublicPath: "/media/products/claude-code-api-access/claude-code-api-access-thumbnail.webp",
      },
      {
        slug: "supabase-pro-1-year",
        title: "Supabase Pro 1-Year",
        packageLabel: "Production Postgres DB",
        priceNprMinor: 1899900,
        categoryLabel: "Cloud Database",
        whyIncluded: "8GB database, Auth, Storage, Edge Functions, and vector embeddings.",
        coverPublicPath: "/media/products/supabase-pro-1-year/supabase-pro-1-year-thumbnail.webp",
      },
    ],
  },
  {
    id: "deep-research",
    title: "Deep Research, Synthesis & Reasoning",
    shortDesc: "Tackle PhD-level analysis, massive document review, and multi-model synthesis.",
    icon: Brain,
    tag: "Academic & Business Intel",
    recommendations: [
      {
        slug: "chatgpt-plus-1-month-fw",
        title: "ChatGPT Plus Dedicated",
        packageLabel: "Monthly Dedicated Plan",
        priceNprMinor: 370000,
        categoryLabel: "AI Assistant",
        whyIncluded: "Uncapped access to OpenAI o1 reasoning, Canvas, and Advanced Voice.",
        coverPublicPath: "/media/products/chatgpt-plus-1-month-fw/chatgpt-plus-1-month-fw-thumbnail.webp",
      },
      {
        slug: "gemini-pro-18-months-link",
        title: "Google AI Pro 5TB",
        packageLabel: "18 Months + 5TB Cloud Storage",
        priceNprMinor: 499900,
        categoryLabel: "Best Value AI",
        whyIncluded: "2M token context window allows uploading entire books and codebases.",
        coverPublicPath: "/media/products/gemini-pro-18-months-link/gemini-pro-18-months-link-thumbnail.webp",
      },
      {
        slug: "supergrok-3-months",
        title: "SuperGrok 3-Month Plan",
        packageLabel: "3-Month Access",
        priceNprMinor: 399900,
        categoryLabel: "Reasoning AI",
        whyIncluded: "Real-time X integration and unfiltered analytical thinking.",
        coverPublicPath: "/media/products/supergrok-3-months/supergrok-3-months-thumbnail.webp",
      },
    ],
  },
  {
    id: "digital-business",
    title: "Digital Asset Monetization & Sales",
    shortDesc: "Acquire plug-and-play sales assets, covert marketing playbooks, and closing scripts.",
    icon: DollarSign,
    tag: "Income Generating",
    recommendations: [
      {
        slug: "ai-money-maker-digital-course-2026",
        title: "AI Money Maker Digital Course",
        packageLabel: "Master Cloud Vault + Blueprints",
        priceNprMinor: 49900,
        categoryLabel: "Vault Drop",
        whyIncluded: "50+ automation workflows and digital asset store launch templates.",
        coverPublicPath: "/media/products/ai-money-maker-digital-course-2026/ai-money-maker-digital-course-2026-thumbnail.webp",
      },
      {
        slug: "the-psychology-of-closing-bundle",
        title: "The Psychology of Closing",
        packageLabel: "Complete Frameworks & Vault",
        priceNprMinor: 39900,
        categoryLabel: "Sales Vault",
        whyIncluded: "Battle-tested high-ticket sales objection handling scripts.",
        coverPublicPath: "/media/products/the-psychology-of-closing-bundle/the-psychology-of-closing-bundle-thumbnail.webp",
      },
      {
        slug: "the-passive-rebel-antisocial-leads",
        title: "The Passive Rebel Leads Engine",
        packageLabel: "Covert Acquisition SOPs",
        priceNprMinor: 39900,
        categoryLabel: "Covert Traffic",
        whyIncluded: "Inbound client acquisition playbooks without dancing on social media.",
        coverPublicPath: "/media/products/the-passive-rebel-antisocial-leads/the-passive-rebel-antisocial-leads-thumbnail.webp",
      },
    ],
  },
  {
    id: "design-presentation",
    title: "Design, Branding & Presentations",
    shortDesc: "Create pitch decks, interactive web apps, and professional graphics in minutes.",
    icon: Palette,
    tag: "Visual Excellence",
    recommendations: [
      {
        slug: "canva-pro-1-year",
        title: "Canva Pro 1-Year License",
        packageLabel: "1-Year Direct Invitation",
        priceNprMinor: 119900,
        categoryLabel: "Design Suite",
        whyIncluded: "100M+ stock assets, magic resize, and brand kit automation.",
        coverPublicPath: "/media/products/canva-pro-1-year/canva-pro-1-year-thumbnail.webp",
      },
      {
        slug: "gamma-pro-1-year",
        title: "Gamma Pro 1-Year",
        packageLabel: "12-Month Pro Access",
        priceNprMinor: 349900,
        categoryLabel: "Slide AI",
        whyIncluded: "Generate polished client presentation decks from simple text prompts.",
        coverPublicPath: "/media/products/gamma-pro-1-year/gamma-pro-1-year-thumbnail.webp",
      },
      {
        slug: "lovable-pro-12m",
        title: "Lovable AI Pro Builder",
        packageLabel: "12-Month Annual Plan",
        priceNprMinor: 1499900,
        categoryLabel: "App Builder",
        whyIncluded: "Build and deploy production full-stack web applications by chatting with AI.",
        coverPublicPath: "/media/products/lovable-pro-12m/lovable-pro-12m-thumbnail.webp",
      },
    ],
  },
];

export function AIFinderComponent() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("software-dev");
  const [searchQuery, setSearchQuery] = useState("");

  const activePreset = useMemo(() => {
    return PRESETS.find((p) => p.id === selectedPresetId) ?? PRESETS[0];
  }, [selectedPresetId]);

  const stackTotalMinor = useMemo(() => {
    return activePreset.recommendations.reduce((acc, r) => acc + r.priceNprMinor, 0);
  }, [activePreset]);

  // Filtered presets if search query is provided
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return PRESETS;
    const q = searchQuery.toLowerCase();
    return PRESETS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.recommendations.some(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.whyIncluded.toLowerCase().includes(q) ||
            r.categoryLabel.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search & Header */}
      <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-400/30">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Deterministic AI Recommendation Engine
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-2xl sm:text-4xl font-extrabold tracking-tight">
            Find the Perfect AI Software Stack for Your Exact Goal
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Select your primary objective below. We analyze verified catalog attributes, compatibility, and pricing in NPR to assemble your ideal software stack.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/20">
            <input
              type="text"
              placeholder="Search by use-case (e.g. video, coding, sales, research, voice)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Goal Presets Selector */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
          Select Your Objective:
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {filteredPresets.map((preset) => {
            const IconComp = preset.icon;
            const isSelected = preset.id === activePreset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
                type="button"
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <IconComp className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {preset.tag}
                  </span>
                </div>
                <h4
                  className={`mt-3 text-xs font-bold leading-tight ${
                    isSelected ? "text-blue-950" : "text-slate-900"
                  }`}
                >
                  {preset.title}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {preset.shortDesc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stack Details */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-600">
              <Layers className="h-3.5 w-3.5" />
              Recommended 3-Tool Stack
            </div>
            <h2 className="mt-1 font-[family-name:var(--font-sora)] text-xl sm:text-2xl font-black text-slate-900">
              {activePreset.title}
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              {activePreset.shortDesc}
            </p>
          </div>

          <div className="flex items-center gap-4 sm:text-right">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">
                Combined Investment:
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {formatNpr(stackTotalMinor)}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {activePreset.recommendations.map((item, idx) => (
            <div
              key={item.slug}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/40 p-5 transition hover:border-blue-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-blue-800">
                    Step {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {item.categoryLabel}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {item.coverPublicPath ? (
                      <Image
                        src={item.coverPublicPath}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600 font-bold text-xs">
                        AI
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {item.packageLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-slate-700">
                  <div className="font-bold text-blue-900 flex items-center gap-1 text-[11px] mb-1">
                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                    Why this tool:
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    {item.whyIncluded}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    Price in Nepal:
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {formatNpr(item.priceNprMinor)}
                  </span>
                </div>
                <Link
                  href={`/products/${item.slug}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm"
                >
                  View Details
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Compare All Button */}
        <div className="mt-8 rounded-2xl bg-slate-900 p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              VS
            </div>
            <div>
              <h4 className="text-sm font-bold">
                Compare These Tools Side-by-Side
              </h4>
              <p className="text-xs text-slate-400">
                Analyze pricing, entitlements, and delivery turnaround on our Comparison Engine.
              </p>
            </div>
          </div>
          <Link
            href={`/compare?items=${activePreset.recommendations.map((r) => r.slug).join(",")}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition shadow-sm"
          >
            Open in Comparison Engine
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
