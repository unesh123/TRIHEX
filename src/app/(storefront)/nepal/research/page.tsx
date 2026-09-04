import { Metadata } from "next";
import Link from "next/link";
import { executeDeepResearch } from "@/lib/research/engine";
import { NepalResearchConsole } from "@/components/nepal/nepal-research-console";
import { Sparkles, ShieldCheck, ArrowRight, Database, Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Evidence-Backed Nepal Deep Research Engine · TRIHEX DIGITAL",
  description:
    "AI-powered deep research engine grounded in verified Nepal Rastra Bank forex records, USGS seismic catalogues, and official civic datasets.",
  openGraph: {
    title: "Nepal Deep Research Engine · TRIHEX DIGITAL",
    description: "Evidence-backed research briefings grounded in verified Nepal civic data.",
    url: "https://trihexdigital.shop/nepal/research",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/nepal/research",
  },
};

export default async function NepalResearchPage() {
  // Pre-seed with a high-relevance query briefing so page has instant substance
  const initialReport = await executeDeepResearch(
    "NPR to USD currency exchange trend and remittance stability in 2026"
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-white">Store</Link>
          <span>/</span>
          <Link href="/nepal" className="hover:text-white">Nepal Pulse</Link>
          <span>/</span>
          <span className="text-blue-400 font-semibold">Deep Research</span>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-blue-950/30 via-slate-900/60 to-slate-950 p-6 md:p-10 mb-8 backdrop-blur-xl">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Structured Data First · Zero LLM Hallucinations
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Evidence-Backed Nepal Research Engine
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every briefing is grounded in real-time records from Nepal Rastra Bank, USGS Seismic FDSN feeds, and National Statistics Office registries before Gemini analytical synthesis.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Live NRB Forex Ground Truth
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Radio className="w-3.5 h-3.5" /> Real-time USGS FDSN Monitor
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <Database className="w-3.5 h-3.5" /> 77-District Census 2021 Data
            </span>
          </div>
        </div>

        {/* Research Console */}
        <NepalResearchConsole initialReport={initialReport} />
      </div>
    </main>
  );
}
