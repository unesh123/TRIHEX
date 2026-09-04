"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  Database, 
  Coins, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import type { EvidenceReport } from "@/lib/research/types";

const SUGGESTED_QUERIES = [
  "Analyze NPR to USD exchange trend and remittance stability in 2026",
  "Recent seismic activity and cluster analysis across Western Nepal (Jajarkot & Bajhang)",
  "Gross foreign exchange reserves and import cover trajectory of Nepal Rastra Bank",
  "Nepal National Census 2021 urbanization indicators and demographic density by province",
];

interface NepalResearchConsoleProps {
  initialReport?: EvidenceReport;
}

export function NepalResearchConsole({ initialReport }: NepalResearchConsoleProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<EvidenceReport | null>(initialReport || null);

  const handleSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 3) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/nepal/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate research briefing.");
      }

      setReport(data.report);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Input Box */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="space-y-4"
        >
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask an evidence-backed question about Nepal's economy, forex, seismic events, or civic records..."
              className="w-full pl-12 pr-28 py-4 rounded-2xl bg-slate-950/80 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
              disabled={isLoading}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <button
              type="submit"
              disabled={isLoading || query.trim().length < 3}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/25 flex items-center gap-1.5"
            >
              {isLoading ? (
                <span>Synthesizing...</span>
              ) : (
                <>
                  <span>Research</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Starters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-medium">Suggested queries:</span>
            {SUGGESTED_QUERIES.map((sq) => (
              <button
                key={sq}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] transition text-left border border-white/5"
              >
                {sq}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton Indicator */}
      {isLoading && (
        <div className="p-8 rounded-3xl border border-white/10 bg-slate-900/60 text-center space-y-4 animate-pulse">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Cpu className="w-3.5 h-3.5 animate-spin" /> Ingesting Live Ground Truth &amp; Reasoning...
          </div>
          <h3 className="text-base font-bold text-white">Cross-checking structured NRB &amp; USGS feeds</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Resolving verified official exchange rates, macroeconomic indicators, and earthquake catalogues before analytical synthesis.
          </p>
        </div>
      )}

      {/* Report Presentation */}
      {!isLoading && report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Metadata Card */}
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {report.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {report.confidenceScore}% Confidence
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Engine: {report.providerUsed} ({report.latencyMs}ms)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {report.query}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/80 to-slate-950 p-6 shadow-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Executive Analytical Briefing
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
              {report.executiveSummary}
            </p>

            {/* Ground Truth Sources Used */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">Ground Truth Feeds:</span>
              {report.groundTruthSourcesUsed.map((src) => (
                <span
                  key={src}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300"
                >
                  {src}
                </span>
              ))}
            </div>
          </div>

          {/* Findings Grid: Strictly 1 card per row on mobile (<640px) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {report.findings.map((finding, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                    <span>Finding #{idx + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {finding.heading}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {finding.summary}
                  </p>
                </div>

                {finding.claims.length > 0 && (
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      Verified Data Points:
                    </div>
                    {finding.claims.map((claim, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-start gap-2 text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-300">{claim.claim}</p>
                          {claim.groundTruthValue && (
                            <span className="inline-block mt-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Truth: {claim.groundTruthValue}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Citations & Evidence Ledger */}
          {report.citations.length > 0 && (
            <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Evidence Citations &amp; Provenance
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {report.citations.length} verified references
                </span>
              </div>

              {/* Strictly 1 card per row on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {report.citations.map((cit) => (
                  <div
                    key={cit.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-white/5 flex flex-col justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>{cit.publisher}</span>
                        {cit.isVerifiedSource && (
                          <span className="text-emerald-400 font-bold">VERIFIED DOMAIN</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-white mb-1 leading-snug line-clamp-2">
                        {cit.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {cit.snippet}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-white/5">
                      <a
                        href={cit.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        <span>Official Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
