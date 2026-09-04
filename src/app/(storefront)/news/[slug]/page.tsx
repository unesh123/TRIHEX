import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getNewsBySlug, getAllNews } from "@/lib/news/store";
import { 
  ArrowLeft, 
  Clock, 
  ExternalLink, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Share2,
  Sparkles,
  Tag
} from "lucide-react";

export const dynamic = "force-dynamic";

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) return { title: "News Briefing Not Found" };

  return {
    title: `${article.title} · TRIHEX Intelligence`,
    description: article.excerpt,
    alternates: { canonical: `https://trihexdigital.shop/news/${article.slug}` },
    openGraph: {
      title: `${article.title} · TRIHEX News Briefing`,
      description: article.excerpt,
      url: `https://trihexdigital.shop/news/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default async function NewsArticleDetailPage({
  params,
}: NewsArticlePageProps) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) notFound();

  const related = getAllNews({ category: article.category })
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  const timeAgo = Math.max(1, Math.round((Date.now() - new Date(article.publishedAt).getTime()) / 3600000));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to News Intelligence
          </Link>
        </div>

        {/* Article Container */}
        <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-10 space-y-6 shadow-2xl backdrop-blur-xl">
          {/* Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {article.category.replace("_", " ")}
              </span>
              <span className="text-slate-400 font-medium">{article.source}</span>
              <span>•</span>
              <span className="text-slate-400">{timeAgo} hours ago</span>
            </div>

            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>Hot Score {article.hotScore}/100</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Geographic Tag if present */}
          {article.geoCoordinates && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-cyan-300 w-fit">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mapped Location: {article.geoCoordinates.locationName}</span>
              <Link href="/map" className="text-blue-400 hover:underline font-semibold ml-2">
                View on Map →
              </Link>
            </div>
          )}

          {/* Fair-Use Factual Excerpt */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-blue-500/20 text-slate-200 text-sm leading-relaxed">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Factual Executive Summary
            </div>
            <p>{article.excerpt}</p>
          </div>

          {/* Verified Key Takeaways */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Key Strategic Takeaways &amp; Implications
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {article.bulletPoints.map((bp, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950/50 border border-white/5 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{bp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-white/10">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 text-xs border border-white/5 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Canonical Source Credit & Outbound Link */}
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-300">
              <span className="font-semibold text-white">Original Source Attribution:</span> Published by {article.source}.
            </div>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-md"
            >
              <span>Read Original Publisher</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </article>

        {/* Related Intelligence */}
        {related.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-lg font-bold text-white">Related Intelligence</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-blue-500/40 transition block space-y-1.5"
                >
                  <span className="text-[10px] font-mono text-blue-400">{item.source}</span>
                  <h4 className="text-xs font-bold text-white line-clamp-2">{item.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
