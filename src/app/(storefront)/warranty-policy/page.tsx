import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { LegalReviewNotice } from "@/components/storefront/legal-review-notice";

export default function WarrantyPolicyPage() {
  return (
    <StorefrontPageShell title="Warranty policy" description="Service commitments where explicitly offered.">
      <LegalReviewNotice />
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          TRIHEX does not infer warranty from third-party marketing copy. Warranty
          applies only where documented for a specific SKU or service package.
        </p>
        <p>
          Third-party subscription products may carry manufacturer terms separate
          from TRIHEX fulfillment support.
        </p>
        <p>
          Warranty claims require order verification and may need diagnostic
          information without sharing passwords or OTPs.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
