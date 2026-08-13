import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { LegalReviewNotice } from "@/components/storefront/legal-review-notice";

export default function AcceptableUsePage() {
  return (
    <StorefrontPageShell title="Acceptable use" description="Prohibited uses of TRIHEX products and services.">
      <LegalReviewNotice />
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Customers may not resell credentials in violation of vendor terms, share
          stolen accounts, bypass regional restrictions unlawfully, or use products
          for spam, fraud, or harassment.
        </p>
        <p>
          TRIHEX may suspend service and report abuse consistent with Nepali law and
          vendor policies.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
