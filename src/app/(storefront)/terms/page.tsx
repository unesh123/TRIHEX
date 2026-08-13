import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { LegalReviewNotice } from "@/components/storefront/legal-review-notice";

export default function TermsPage() {
  return (
    <StorefrontPageShell title="Terms of service" description="Website terms for TRIHEX DIGITAL customers.">
      <LegalReviewNotice />
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          By using this website and placing orders you agree to provide accurate
          contact information, pay listed NPR amounts using selected methods, and
          comply with acceptable use rules for digital products and services.
        </p>
        <p>
          TRIHEX may refuse or cancel orders that fail compliance checks, involve
          blocked products, or appear fraudulent. Digital goods and services may be
          non-refundable once delivered — see the refund policy.
        </p>
        <p>
          These terms are a draft for internal review and do not constitute legal
          advice.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
