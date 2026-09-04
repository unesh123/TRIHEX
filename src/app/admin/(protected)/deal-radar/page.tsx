import { AdminHeader } from "@/components/admin/admin-header";
import { getAllDealCandidates } from "@/lib/deals/store";
import { DealRadarManager } from "@/components/admin/deal-radar-manager";

export const dynamic = "force-dynamic";

export default async function AdminDealRadarPage() {
  const deals = getAllDealCandidates();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="TRIHEX Deal Radar"
        description="Ingest, verify, and approve developer deals, cloud credits, and AI trials. Compare third-party claims against official vendor terms before publishing live."
      />
      <DealRadarManager initialDeals={deals} />
    </div>
  );
}
