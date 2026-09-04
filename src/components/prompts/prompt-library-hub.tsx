"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  Code2, 
  Video, 
  TrendingUp, 
  GraduationCap, 
  Check, 
  Copy, 
  Sliders, 
  Cpu, 
  Layers, 
  Zap,
  ArrowRight,
  PackageCheck,
  FolderArchive
} from "lucide-react";
import { Prompt, PromptCategory } from "@/lib/prompts/types";

interface CuratedPack {
  id: string;
  name: string;
  badge: string;
  description: string;
  keywords: string[];
}

const CURATED_PACKS: CuratedPack[] = [
  {
    id: "pack-fullstack",
    name: "Fullstack Architect Pack",
    badge: "ENGINEERING",
    description: "C# Clean Architecture, Laravel 11 Microservices, Next.js 16 SSR & Server Actions.",
    keywords: ["c#", "laravel", "next.js", "coding", "software", "api", "architecture"],
  },
  {
    id: "pack-media",
    name: "Visual & Creator Pack",
    badge: "CREATIVE",
    description: "Photorealistic Midjourney v6 infographics and high-converting TikTok UGC video scripts.",
    keywords: ["midjourney", "image", "video", "ugc", "creative", "photo", "infographic"],
  },
  {
    id: "pack-research",
    name: "PhD & Academic Research Pack",
    badge: "SCHOLAR",
    description: "Systematic literature synthesizers and academic methodology formatting.",
    keywords: ["phd", "research", "study", "academic", "literature", "paper"],
  },
  {
    id: "pack-growth",
    name: "High-Growth B2B Marketing Pack",
    badge: "GROWTH",
    description: "Cold email sequences, programmatic SEO briefs, and landing page conversion copy.",
    keywords: ["marketing", "sales", "b2b", "outreach", "growth", "seo"],
  },
];

interface PromptLibraryHubProps {
  initialPrompts: Prompt[];
}

export function PromptLibraryHub({ initialPrompts }: PromptLibraryHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyOriginal, setOnlyOriginal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPack, setCopiedPack] = useState(false);

  const activePack = useMemo(() => {
    return CURATED_PACKS.find((p) => p.id === selectedPackId) || null;
  }, [selectedPackId]);

  const filteredPrompts = useMemo(() => {
    return initialPrompts.filter((p) => {
      // Pack filter
      if (activePack) {
        const text = `${p.title} ${p.description} ${p.tags.join(" ")} ${p.category}`.toLowerCase();
        const matchesPack = activePack.keywords.some((k) => text.includes(k));
        if (!matchesPack) return false;
      }

      if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
      if (onlyOriginal && !p.isOriginalTrihex) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }
      return true;
    });
  }, [initialPrompts, activePack, selectedCategory, onlyOriginal, searchQuery]);

  const handleQuickCopy = (e: React.MouseEvent, prompt: Prompt) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyPack = () => {
    if (!activePack || filteredPrompts.length === 0) return;

    const bundleText = `# ${activePack.name} — TRIHEX Curated Prompt Pack\n\n${activePack.description}\n\n` +
      filteredPrompts
        .map(
          (p, i) =>
            `## ${i + 1}. ${p.title}\n**Category**: ${p.category} | **Author**: ${p.author}\n\n\`\`\`text\n${p.content}\n\`\`\`\n`
        )
        .join("\n---\n\n");

    navigator.clipboard.writeText(bundleText);
    setCopiedPack(true);
    setTimeout(() => setCopiedPack(false), 2500);
  };

  const categories: Array<{ key: PromptCategory | "ALL"; label: string; icon: any }> = [
    { key: "ALL", label: "All Prompts", icon: Layers },
    { key: "CODING", label: "Coding & Arch", icon: Code2 },
    { key: "IMAGE_VIDEO", label: "Image & Video", icon: Video },
    { key: "MARKETING_SALES", label: "Growth & Sales", icon: TrendingUp },
    { key: "STUDY_RESEARCH", label: "PhD & Study", icon: GraduationCap },
    { key: "PRODUCTIVITY", label: "Productivity", icon: Zap },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950 p-6 md:p-10 mb-8 backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              TRIHEX Prompt Intelligence Hub 3.0
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Curated Production Prompts & Variable Playground
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Engineered prompts for C#, Laravel 11, Next.js 16, TikTok UGC ads, Midjourney infographics, and academic research. Fill your parameters and copy clean output instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setOnlyOriginal(!onlyOriginal)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                onlyOriginal
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {onlyOriginal ? "Showing: TRIHEX Originals" : "Filter: TRIHEX Originals"}
            </button>
          </div>
        </div>

        {/* Info stats */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <Zap className="w-4 h-4" /> Interactive Variables Playground
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">Version History & Revisions Tracking</span>
          </div>
          <div className="font-mono text-slate-400">
            Available prompts: <span className="text-white font-semibold">{initialPrompts.length}</span>
          </div>
        </div>
      </div>

      {/* Curated Prompt Packs Bar */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <FolderArchive className="w-3.5 h-3.5 text-cyan-400" />
            Curated Domain Prompt Packs
          </h2>
          {selectedPackId && (
            <button
              type="button"
              onClick={() => setSelectedPackId(null)}
              className="text-xs text-slate-400 hover:text-white underline decoration-slate-600"
            >
              Reset pack filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CURATED_PACKS.map((pack) => {
            const isSelected = selectedPackId === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => setSelectedPackId(isSelected ? null : pack.id)}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-950/50"
                    : "bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {pack.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <h3 className="text-xs font-bold text-white mb-1 line-clamp-1">{pack.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{pack.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Pack Action Banner */}
      {activePack && (
        <div className="mb-6 p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">{activePack.name}</span>
              <span className="text-xs text-slate-400 font-mono">({filteredPrompts.length} prompts)</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{activePack.description}</p>
          </div>

          <button
            type="button"
            onClick={handleCopyPack}
            disabled={filteredPrompts.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all shrink-0 active:scale-95"
          >
            {copiedPack ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                Copied Full Pack!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Full Pack ({filteredPrompts.length})
              </>
            )}
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts by title, topic, language, or model (e.g. C#, Midjourney, TikTok, Next.js, Linux)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(({ key, label, icon: Icon }) => {
            const active = selectedCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompts Grid - Strictly 1 column on mobile (< 640px) */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-white/5 bg-slate-900/40">
          <Sparkles className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No prompts match your criteria</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Try adjusting your search query, clearing pack filters, or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrompts.map((prompt) => {
            return (
              <div
                key={prompt.id}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all duration-200 shadow-lg shadow-black/20"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {prompt.isOriginalTrihex ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          TRIHEX Original
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                          prompts.chat · CC0
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {prompt.category}
                      </span>
                    </div>
                    <Link
                      href={`/prompts/${prompt.slug}`}
                      className="block text-base font-semibold text-white leading-snug group-hover:text-indigo-300 transition-colors"
                    >
                      {prompt.title}
                    </Link>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4 flex-1">
                  {prompt.description}
                </p>

                {/* Variable & Model Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                  {prompt.variables.length > 0 ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                      <Sliders className="w-3 h-3" /> {prompt.variables.length} Variables
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Static Prompt
                    </span>
                  )}

                  {prompt.modelCompatibility.slice(0, 2).map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                      {m}
                    </span>
                  ))}
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleQuickCopy(e, prompt)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                    title="Quick copy raw prompt template"
                  >
                    {copiedId === prompt.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Quick Copy</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/prompts/${prompt.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
                  >
                    Playground
                    <ArrowRight className="w-3 h-3" />
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
