import { Metadata } from "next";
import { getAllNews, getBreakingNews } from "@/lib/news/store";
import { NewsHub } from "@/components/news/news-hub";
import { Newspaper, Flame, ShieldCheck, ExternalLink, Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Live News Intelligence · Nepal Tech, AI Breakthroughs & Policy",
  description:
    "Near-real-time factual news intelligence covering Nepal IT policies, NRB digital circulars, global AI infrastructure releases, and civic modernization.",
  openGraph: {
    title: "TRIHEX Live News Intelligence · Nepal Tech & Global AI",
    description: "Verified news intelligence grounded in official bulletins, publisher feeds, and GDELT monitoring.",
    url: "https://trihexdigital.shop/news",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/news",
  },
};

export default function NewsPage() {
  const articles = getAllNews();
  const breaking = getBreakingNews(3);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/70 p-6 sm:p-10 mb-8 shadow-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Live News Intelligence
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Strict Copyright Compliance · Fair Use Excerpts
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Nepal Tech Ecosystem &amp; AI Intelligence Monitor
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Near-real-time intelligence synthesized from official ministerial circulars, Nepal Rastra Bank directives, technology publications, and GDELT events.
          </p>

          {/* Breaking News Ticker */}
          {breaking.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-wider shrink-0">
                <Flame className="w-3 h-3" /> Breaking
              </span>
              <div className="text-slate-300 font-medium truncate max-w-2xl">
                {breaking[0].title}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Hub with Filter Tabs and Search */}
        <NewsHub initialArticles={articles} />
      </div>
    </main>
  );
}
