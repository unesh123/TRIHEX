import Link from "next/link";
import { NewsArticle } from "@/lib/news/types";
import { Flame, Clock, ExternalLink, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const categoryLabels: Record<NewsArticle["category"], { label: string; color: string }> = {
    NEPAL_TECH: { label: "Nepal Tech", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    AI_GLOBAL: { label: "Global AI", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
    ECONOMIC_POLICY: { label: "Economic Policy", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    CIVIC_INFRASTRUCTURE: { label: "Civic Infra", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  };

  const badge = categoryLabels[article.category];
  const timeAgo = Math.max(1, Math.round((Date.now() - new Date(article.publishedAt).getTime()) / 3600000));

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-blue-500/40 hover:bg-slate-900/90 transition shadow-md group">
      <div className="space-y-3">
        {/* Top metadata row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border font-mono ${badge.color}`}>
              {badge.label}
            </span>
            {article.isPinned && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                Pinned
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Flame className={`w-3.5 h-3.5 ${article.hotScore >= 90 ? "text-red-400 fill-red-400" : "text-amber-400"}`} />
            <span className="font-bold text-white">{article.hotScore}</span>
            <span className="text-[10px] text-slate-500">HOT</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/news/${article.slug}`}>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition leading-snug line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>

        {/* Key Takeaways */}
        {article.bulletPoints && article.bulletPoints.length > 0 && (
          <ul className="space-y-1 pt-1 border-t border-white/5">
            {article.bulletPoints.slice(0, 2).map((bp, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{bp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer metadata */}
      <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-300 truncate max-w-[120px]">{article.source}</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            {timeAgo}h ago
          </span>
        </div>

        <Link
          href={`/news/${article.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300"
        >
          <span>Briefing</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </article>
  );
}
