import { Metadata } from "next";
import Link from "next/link";
import { getAllNews } from "@/lib/news/store";
import { Newspaper, Flame, Plus, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "News Intelligence Manager · TRIHEX Admin",
};

export default function AdminNewsPage() {
  const articles = getAllNews();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Content Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Live News Intelligence</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor syndicated RSS feeds, manage breaking headlines, and verify fair-use summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/news"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <span>View Live Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="text-[11px] text-slate-400">Total Ingested Articles</div>
          <div className="text-2xl font-bold text-white mt-1">{articles.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="text-[11px] text-slate-400">Pinned Breaking Alerts</div>
          <div className="text-2xl font-bold text-red-400 mt-1">
            {articles.filter((a) => a.isPinned).length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="text-[11px] text-slate-400">Mapped Geo Events</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {articles.filter((a) => a.geoCoordinates).length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="text-[11px] text-slate-400">Average Hot Score</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {Math.round(articles.reduce((acc, a) => acc + a.hotScore, 0) / (articles.length || 1))}
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Active Intelligence Feed</h2>
          <span className="text-xs text-slate-400 font-mono">15-min background sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-mono text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3.5">Headline &amp; Topic</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Source</th>
                <th className="p-3.5">Hot Score</th>
                <th className="p-3.5">Geo Tag</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 max-w-sm">
                    <div className="font-semibold text-white leading-snug">{a.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{a.slug}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {a.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-medium">{a.source}</td>
                  <td className="p-3.5 font-mono font-bold text-amber-400">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {a.hotScore}
                    </span>
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-400">
                    {a.geoCoordinates ? a.geoCoordinates.locationName : "—"}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/news/${a.slug}`}
                      target="_blank"
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
