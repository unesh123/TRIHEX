import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { LegalReviewNotice } from "@/components/storefront/legal-review-notice";

export default function DeliveryPolicyPage() {
  return (
    <StorefrontPageShell title="Delivery policy" description="Fulfillment timelines for digital products and services.">
      <LegalReviewNotice />
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Delivery is digital: downloads, email activation, account invites, voucher
          codes, or scheduled consultations depending on the product card.
        </p>
        <p>
          Fulfillment begins after payment verification unless a product explicitly
          allows pre-scheduling.
        </p>
        <p>
          Estimates on product pages are good-faith targets, not guaranteed SLAs,
          until operational SLAs are published here.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
