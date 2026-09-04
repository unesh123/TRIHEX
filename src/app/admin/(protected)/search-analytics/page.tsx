import { AdminHeader } from "@/components/admin/admin-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { getSearchAnalyticsSummary } from "@/lib/search/analytics";
import { 
  Search, 
  HelpCircle, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  PlusCircle, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SearchAnalyticsPage() {
  const analytics = await getSearchAnalyticsSummary();

  const zeroRate = analytics.totalSearches > 0
    ? ((analytics.zeroResultCount / analytics.totalSearches) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <AdminHeader
        title="Search & Demand Intelligence"
        description="Customer intent analytics, high-frequency search keywords, and zero-result queries that identify unmet demand."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Searches"
          value={analytics.totalSearches}
          hint="Aggregated customer search queries"
          tone="default"
        />
        <KpiCard
          label="Zero-Result Queries"
          value={analytics.zeroResultCount}
          hint="Unmet customer demand signals"
          tone="warning"
        />
        <KpiCard
          label="Zero-Result Rate"
          value={`${zeroRate}%`}
          hint="Searches without direct matches"
          tone="danger"
        />
        <KpiCard
          label="Top Trending Query"
          value={analytics.topQueries[0]?.query || "None"}
          hint={analytics.topQueries[0] ? `${analytics.topQueries[0].count} total searches` : "No query volume"}
          tone="success"
        />
      </div>

      {/* Zero-Result Queries — Unmet Customer Demand */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Zero-Result Demand Intelligence
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Users actively searched for these terms but TRIHEX returned zero catalog or deal results. Use this list to prioritize new software inventory, deal radar candidates, and prompts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/deal-radar"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Create Deal Candidate
            </Link>
          </div>
        </div>

        {analytics.zeroResultQueries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono border border-dashed border-white/10 rounded-xl">
            Zero empty searches recorded. All queries have matching catalog entities.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-3">Unmatched Query</th>
                  <th className="px-4 py-3">Search Count</th>
                  <th className="px-4 py-3">Last Searched</th>
                  <th className="px-4 py-3">Suggested Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {analytics.zeroResultQueries.map((item) => (
                  <tr key={item.query} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-amber-300">
                      &quot;{item.query}&quot;
                    </td>
                    <td className="px-4 py-3 text-white">
                      {item.count} {item.count === 1 ? "time" : "times"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(item.lastSearchedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/new?title=${encodeURIComponent(item.query)}`}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-sans font-medium"
                        >
                          Add Product <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Search Queries */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-bold text-white">
            Top Search Volume Keywords
          </h2>
        </div>

        {analytics.topQueries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono border border-dashed border-white/10 rounded-xl">
            No search traffic recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-3">Query</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Last Result Count</th>
                  <th className="px-4 py-3">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {analytics.topQueries.map((item) => (
                  <tr key={item.query} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">
                      {item.query}
                    </td>
                    <td className="px-4 py-3 text-blue-400 font-bold">
                      {item.count}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.lastResultCount > 0 ? (
                        <span className="text-emerald-400 font-semibold">{item.lastResultCount} items</span>
                      ) : (
                        <span className="text-amber-400">0 items</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(item.lastSearchedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Searches Stream */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-bold text-white">
            Recent Searches Audit Stream
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Raw Query</th>
                <th className="px-4 py-3">Results</th>
                <th className="px-4 py-3">Privacy Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {analytics.recentSearches.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {new Date(item.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    &quot;{item.queryText}&quot;
                  </td>
                  <td className="px-4 py-3">
                    {item.resultCount > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                        {item.resultCount} found
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-bold">
                        0 found
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[10px]">
                    {item.ipHash ? `ip-${item.ipHash}` : "anon"}
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
