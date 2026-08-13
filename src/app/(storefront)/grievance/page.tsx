import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { LegalReviewNotice } from "@/components/storefront/legal-review-notice";

export default function GrievancePage() {
  return (
    <StorefrontPageShell title="Grievance redressal" description="How to escalate complaints.">
      <LegalReviewNotice />
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Submit grievances with order number, contact details, and a factual
          description. We acknowledge within a published window once operations are
          live.
        </p>
        <p>
          Officer name, postal address, and regulatory registration details will be
          added after business disclosures are finalized.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
