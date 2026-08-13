import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { LegalReviewNotice } from "@/components/storefront/legal-review-notice";

export default function RefundPolicyPage() {
  return (
    <StorefrontPageShell title="Refund policy" description="When refunds may apply.">
      <LegalReviewNotice />
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Refund eligibility depends on product type, delivery status, and whether
          activation has occurred. Consultations and completed downloads may not be
          refundable.
        </p>
        <p>
          Duplicate payments verified in our receiving account are refunded or
          adjusted after finance review.
        </p>
        <p>
          Contact support with your order number to request review. Final policy text
          requires owner sign-off.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
