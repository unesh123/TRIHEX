import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { LegalReviewNotice } from "@/components/storefront/legal-review-notice";

export default function BusinessDisclosuresPage() {
  return (
    <StorefrontPageShell
      title="Business disclosures"
      description="Legal entity and registration information."
    >
      <LegalReviewNotice />
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Registered business name, PAN/VAT numbers, registered address, and
          authorized signatory will be published here before accepting production
          payments.
        </p>
        <p>
          TRIHEX DIGITAL operates as an independent retailer unless a specific
          authorized partnership is disclosed on a product page.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
