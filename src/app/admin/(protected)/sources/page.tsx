import { AdminHeader } from "@/components/admin/admin-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { getAllSources } from "@/lib/sources/source-registry";
import { 
  Radio, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  RefreshCw 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SourcesDashboardPage() {
  const sources = await getAllSources();

  const healthyCount = sources.filter((s) => s.healthStatus === "HEALTHY").length;
  const degradedCount = sources.filter((s) => s.healthStatus === "DEGRADED" || s.healthStatus === "STALE").length;
  const offlineCount = sources.filter((s) => s.healthStatus === "OFFLINE" || s.healthStatus === "RATE_LIMITED").length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <AdminHeader
        title="External Sources & Feed Reliability"
        description="Health monitoring, trust levels, licensing audit, and synchronization status for all external data providers."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Feeds"
          value={sources.length}
          hint="Registered external APIs & datasets"
          tone="default"
        />
        <KpiCard
          label="Healthy Feeds"
          value={healthyCount}
          hint="Passing automated health checks"
          tone="success"
        />
        <KpiCard
          label="Degraded / Stale"
          value={degradedCount}
          hint="Temporary delays or fallback baseline"
          tone="warning"
        />
        <KpiCard
          label="Offline Feeds"
          value={offlineCount}
          hint="Circuit breaker active / unreachable"
          tone={offlineCount > 0 ? "danger" : "default"}
        />
      </div>

      {/* Sources Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-bold text-white">Registered External Providers</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Auto-verified via SafeFetch 2.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((source) => {
            const isHealthy = source.healthStatus === "HEALTHY";
            const isDegraded = source.healthStatus === "DEGRADED" || source.healthStatus === "STALE";

            return (
              <div
                key={source.id}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-4 flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isHealthy
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : isDegraded
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {source.healthStatus}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {source.ingestionMethod}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {source.trustLevel}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-white mt-2">
                        {source.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-slate-400 truncate">
                    {source.baseUrl}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {source.licenseNotes}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                    <div>
                      Interval: <span className="text-slate-200">{source.refreshIntervalMinutes}m</span>
                    </div>
                    <div>
                      Failures: <span className={source.consecutiveFailures > 0 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                        {source.consecutiveFailures}
                      </span>
                    </div>
                    <div className="col-span-2">
                      Last Sync: <span className="text-slate-200">
                        {source.lastSuccessfulSyncAt
                          ? new Date(source.lastSuccessfulSyncAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={source.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Inspect Source URL <ExternalLink className="w-3 h-3" />
                    </a>

                    <span className="text-[10px] text-slate-500 font-mono">
                      id: {source.slug}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
