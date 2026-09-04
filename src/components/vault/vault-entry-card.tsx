"use client";

import Link from "next/link";
import {
  VaultEntry,
  VaultEntityType,
  VaultProvenance,
} from "@/lib/vault/vault-types";
import {
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Tag,
  Lock,
  Gift,
  BookOpen,
  FileText,
  Terminal,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface VaultEntryCardProps {
  entry: VaultEntry;
}

export function VaultEntryCard({ entry }: VaultEntryCardProps) {
  const isExternal =
    entry.priceMode === "EXTERNAL" || entry.destinationUrl.startsWith("http");

  // Visual styling variants by Entity Type
  const getEntityConfig = (type: VaultEntityType) => {
    switch (type) {
      case "DEAL":
        return {
          icon: Tag,
          accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          bannerBg: "bg-emerald-500/5",
          badgeColor: "bg-emerald-100/80 text-emerald-800 border-emerald-300",
          label: "Verified Deal",
          ctaText: "Claim Deal",
          ctaStyle: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
        };
      case "FREE_RESOURCE":
        return {
          icon: Gift,
          accentBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
          bannerBg: "bg-cyan-500/5",
          badgeColor: "bg-cyan-100/80 text-cyan-800 border-cyan-300",
          label: "Free Perk",
          ctaText: "Access Perk",
          ctaStyle: "bg-cyan-700 hover:bg-cyan-800 text-white shadow-cyan-700/20",
        };
      case "PROMPT_PACK":
        return {
          icon: Sparkles,
          accentBg: "bg-purple-50 text-purple-700 border-purple-200",
          bannerBg: "bg-purple-500/5",
          badgeColor: "bg-purple-100/80 text-purple-800 border-purple-300",
          label: "Prompt Pack",
          ctaText: "View Prompts",
          ctaStyle: "bg-slate-950 hover:bg-purple-600 text-white shadow-slate-950/20",
        };
      case "GUIDE":
        return {
          icon: BookOpen,
          accentBg: "bg-sky-50 text-sky-700 border-sky-200",
          bannerBg: "bg-sky-500/5",
          badgeColor: "bg-sky-100/80 text-sky-800 border-sky-300",
          label: "Technical Guide",
          ctaText: "Read Blueprint",
          ctaStyle: "bg-slate-950 hover:bg-sky-600 text-white shadow-slate-950/20",
        };
      case "RESEARCH":
        return {
          icon: FileText,
          accentBg: "bg-amber-50 text-amber-800 border-amber-200",
          bannerBg: "bg-amber-500/5",
          badgeColor: "bg-amber-100/80 text-amber-900 border-amber-300",
          label: "Public Record",
          ctaText: "Inspect Dossier",
          ctaStyle: "bg-slate-950 hover:bg-amber-600 text-white shadow-slate-950/20",
        };
      case "TOOL":
        return {
          icon: Terminal,
          accentBg: "bg-teal-50 text-teal-700 border-teal-200",
          bannerBg: "bg-teal-500/5",
          badgeColor: "bg-teal-100/80 text-teal-800 border-teal-300",
          label: "Interactive Tool",
          ctaText: "Launch Tool",
          ctaStyle: "bg-slate-950 hover:bg-teal-600 text-white shadow-slate-950/20",
        };
      case "PRODUCT":
      default:
        return {
          icon: Lock,
          accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          bannerBg: "bg-indigo-500/5",
          badgeColor: "bg-indigo-100/80 text-indigo-800 border-indigo-300",
          label: "VIP Bundle",
          ctaText: "Explore Bundle",
          ctaStyle: "bg-slate-950 hover:bg-blue-600 text-white shadow-slate-950/20",
        };
    }
  };

  const config = getEntityConfig(entry.entityType);
  const Icon = config.icon;

  const getProvenanceBadge = (prov: VaultProvenance) => {
    switch (prov) {
      case "TRIHEX ORIGINAL":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "TRIHEX PRODUCT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "VERIFIED EXTERNAL DEAL":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "FREE EXTERNAL RESOURCE":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "PUBLIC RECORD":
        return "bg-amber-50 text-amber-900 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-xl transition-all duration-200">
      {/* Top Banner Row: Visual Icon + Source + Provenance */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${config.accentBg} shadow-xs`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-semibold text-slate-700">
                {entry.sourceName}
              </span>
              {entry.verificationStatus === "VERIFIED" && (
                <span
                  title="Verified by TRIHEX Operations"
                  className="inline-flex shrink-0 items-center text-emerald-600"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <span
              className={`inline-block px-2 py-0.5 mt-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono border ${getProvenanceBadge(
                entry.provenance
              )}`}
            >
              {entry.provenance}
            </span>
          </div>
        </div>

        {/* Entity pill or badge */}
        {entry.badgeText ? (
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
            {entry.badgeText}
          </span>
        ) : (
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono ${config.badgeColor}`}
          >
            {config.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
        {entry.title}
      </h3>

      {/* Summary */}
      <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1">
        {entry.summary}
      </p>

      {/* Feature Highlights (max 3 chips with readable text) */}
      {entry.highlights && entry.highlights.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {entry.highlights.slice(0, 3).map((h, i) => (
            <span
              key={i}
              className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
            >
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Price & Action Footer (Vertically aligned at bottom) */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-bold text-slate-900">
              {entry.displayPrice}
            </span>
            {entry.compareAtPrice && (
              <span className="font-mono text-xs text-slate-400 line-through">
                {entry.compareAtPrice}
              </span>
            )}
          </div>
          {entry.validUntil && (
            <span className="block mt-0.5 text-[10px] text-amber-700 font-mono flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Until {new Date(entry.validUntil).toLocaleDateString()}
            </span>
          )}
        </div>

        {isExternal ? (
          <a
            href={entry.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${config.ctaStyle}`}
          >
            <span>{config.ctaText}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <Link
            href={entry.destinationUrl}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${config.ctaStyle}`}
          >
            <span>{config.ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
