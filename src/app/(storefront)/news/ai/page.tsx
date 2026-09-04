import { Metadata } from "next";
import Link from "next/link";
import { getAllNews } from "@/lib/news/store";
import { NewsHub } from "@/components/news/news-hub";
import { ArrowLeft, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Global AI & LLM Engineering News · TRIHEX Live Intelligence",
  description: "Global AI foundation model breakthroughs, coding tools, and cloud infrastructure releases.",
  alternates: { canonical: "https://trihexdigital.shop/news/ai" },
};

export default function AiNewsPage() {
  const articles = getAllNews({ category: "AI_GLOBAL" });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Intelligence
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
            <Cpu className="w-4 h-4" /> Global Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Global AI Foundation Models &amp; Developer Tooling
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Latest releases across Google Gemini, Claude, OpenAI, Cursor, open-weight architectures, and autonomous agent systems.
          </p>
        </div>

        <NewsHub initialArticles={articles} defaultCategory="AI_GLOBAL" />
      </div>
    </main>
  );
}
