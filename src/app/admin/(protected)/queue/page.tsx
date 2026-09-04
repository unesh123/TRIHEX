import { AdminHeader } from "@/components/admin/admin-header";
import { getAllDealCandidates } from "@/lib/deals/store";
import { DealVerificationQueue } from "@/components/admin/deal-verification-queue";

export const dynamic = "force-dynamic";

export default async function AdminVerificationQueuePage() {
  const deals = getAllDealCandidates();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Deal Verification Queue"
        description="Audit crawled deal candidates against official vendor HTTP status, domain provenance, and eligibility terms before publishing live to the TRIHEX Deal Radar."
      />
      <DealVerificationQueue initialDeals={deals} />
    </div>
  );
}
