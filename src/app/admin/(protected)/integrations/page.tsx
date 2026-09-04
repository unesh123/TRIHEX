import { AdminHeader } from "@/components/admin/admin-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { getRegisteredProviders } from "@/lib/providers/registry";
import { IntegrationsManager } from "@/components/admin/integrations-manager";
import { getDailyUsageStats } from "@/lib/providers/budget";
import { Cpu, ShieldCheck, Zap, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default function IntegrationsDashboardPage() {
  const providers = getRegisteredProviders();
  const usageStats = getDailyUsageStats();

  const healthyCount = providers.filter((p) => p.healthStatus === "HEALTHY").length;
  const configuredCount = providers.filter((p) => p.healthStatus !== "NOT_CONFIGURED").length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <AdminHeader
        title="Provider Control Plane & External Integrations"
        description="Unified gateway management for LLMs, Web Indexing, Speech, Maps, and Creative APIs. Credentials remain strictly isolated on the server."
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Supported Adapters"
          value={providers.length}
          hint="Registered external service adapters"
          tone="default"
        />
        <KpiCard
          label="Configured Providers"
          value={configuredCount}
          hint="Keys present in server environment"
          tone="default"
        />
        <KpiCard
          label="Healthy Providers"
          value={healthyCount}
          hint="Passing live connection tests"
          tone="success"
        />
        <KpiCard
          label="Daily Budget Remaining"
          value={`$${(usageStats.budgetRemainingCents / 100).toFixed(2)}`}
          hint={`Of $${(usageStats.dailyBudgetCents / 100).toFixed(2)} daily ceiling`}
          tone="default"
        />
      </div>

      <IntegrationsManager initialProviders={providers} />
    </div>
  );
}
