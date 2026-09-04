import { AdminHeader } from "@/components/admin/admin-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { checkSystemHealth } from "@/lib/system/system-health";
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Server, 
  Database, 
  Key, 
  Map, 
  Cpu, 
  ShieldCheck 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SystemHealthPage() {
  const report = await checkSystemHealth();

  const healthyCount = report.components.filter((c) => c.status === "HEALTHY").length;
  const attentionCount = report.components.filter((c) => c.status === "DEGRADED" || c.status === "CRITICAL").length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <AdminHeader
        title="System Observability & Diagnostic Health"
        description="Comprehensive real-time health check across database connections, cryptographic secrets, background jobs, geodetic maps, and ingestion firewalls."
      />

      {/* Overall Health Status Banner */}
      <div className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        report.overallStatus === "HEALTHY"
          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
          : report.overallStatus === "DEGRADED"
          ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
          : "bg-rose-950/20 border-rose-500/40 text-rose-300"
      }`}>
        <div className="flex items-center gap-3">
          {report.overallStatus === "HEALTHY" ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          ) : report.overallStatus === "DEGRADED" ? (
            <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
          )}
          <div>
            <h2 className="text-lg font-bold text-white">
              System State: {report.overallStatus}
            </h2>
            <p className="text-xs opacity-80 mt-0.5">
              All critical commerce and intelligence infrastructure diagnostic probes executed.
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400 self-end sm:self-auto">
          Checked: <span className="text-white">{new Date(report.checkedAt).toLocaleTimeString("en-US")}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Components"
          value={report.components.length}
          hint="Subsystems under diagnostic probe"
          tone="default"
        />
        <KpiCard
          label="Healthy Components"
          value={healthyCount}
          hint="Passing all assertions"
          tone="success"
        />
        <KpiCard
          label="Attention Required"
          value={attentionCount}
          hint="Degraded or fallback active"
          tone={attentionCount > 0 ? "warning" : "default"}
        />
        <KpiCard
          label="Server Environment"
          value={process.env.NODE_ENV === "production" ? "Production" : "Development"}
          hint="Timezone: Asia/Kathmandu"
          tone="default"
        />
      </div>

      {/* Detailed Diagnostic Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Subsystem Diagnostics
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {report.components.map((comp) => {
            const isHealthy = comp.status === "HEALTHY";
            const isDegraded = comp.status === "DEGRADED";
            const isCritical = comp.status === "CRITICAL";

            return (
              <div
                key={comp.name}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isHealthy
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : isDegraded
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : isCritical
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {comp.status}
                    </span>

                    <h3 className="text-sm font-semibold text-white">
                      {comp.name}
                    </h3>

                    {comp.latencyMs != null && (
                      <span className="text-[11px] font-mono text-slate-400">
                        ({comp.latencyMs}ms)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {comp.message}
                  </p>

                  {comp.details && (
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-slate-400">
                      {Object.entries(comp.details).map(([key, val]) => (
                        <span key={key} className="px-2 py-0.5 rounded bg-black/40 border border-white/5">
                          {key}: <strong className="text-slate-200">{String(val)}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0 self-end sm:self-auto">
                  {isHealthy ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isDegraded ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : isCritical ? (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
