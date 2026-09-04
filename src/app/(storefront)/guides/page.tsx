import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, User } from "lucide-react";
import { getAllGuides } from "@/lib/guides/guide-registry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Knowledge Guides · Technical Whitepapers & Student Blueprints",
  description:
    "Original technical guides on unlocking GitHub student perks in Nepal, building fullstack AI systems with Next.js 16 and Supabase, and securing LLM API keys.",
  openGraph: {
    title: "TRIHEX Knowledge Guides",
    description: "Original technical whitepapers and student perk guides in Nepal.",
    url: "https://trihexdigital.shop/guides",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/guides",
  },
};

export default function GuidesPage() {
  const guides = getAllGuides();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-slate-950 p-6 md:p-10 mb-8 backdrop-blur-xl">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BookOpen className="w-3.5 h-3.5" />
              TRIHEX Editorial Knowledge Base
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Original Technical Guides & Systems Playbooks
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Researched, verified guides for Nepali developers, creators, and students. Complete with verifiable citations and printable PDF format.
            </p>
          </div>
        </div>

        {/* Guides Grid - Strictly 1 column on mobile (< 640px) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-6 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all shadow-lg"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                  {guide.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  {guide.readingTimeMinutes} min
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-2 leading-snug hover:text-blue-300 transition-colors">
                <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed mb-4 flex-1 line-clamp-3">
                {guide.summary}
              </p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                  {guide.author}
                </span>

                <Link
                  href={`/guides/${guide.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                >
                  Read Guide
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
