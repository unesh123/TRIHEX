import { AdminHeader } from "@/components/admin/admin-header";
import { getDailyUsageStats, getFailoverEvents } from "@/lib/providers/budget";
import { ProviderUsageConsole } from "@/components/admin/provider-usage-console";

export const dynamic = "force-dynamic";

export default async function AdminProviderUsagePage() {
  const stats = getDailyUsageStats();
  const failoverEvents = getFailoverEvents();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="AI Usage & Budgets"
        description="Monitor provider token costs, enforce daily spending ceilings ($5.00 ceiling), track request throughput, and review failover event logs across Gemini, OpenAI, and You.com."
      />
      <ProviderUsageConsole stats={stats} failoverEvents={failoverEvents} />
    </div>
  );
}
