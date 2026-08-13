import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { LegalReviewNotice } from "@/components/storefront/legal-review-notice";

export default function PrivacyPage() {
  return (
    <StorefrontPageShell title="Privacy policy" description="How TRIHEX handles customer data.">
      <LegalReviewNotice />
      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          We collect name, email, phone, order details, and payment verification
          artifacts necessary to fulfill orders and comply with finance controls.
        </p>
        <p>
          Marketing email is opt-in only at checkout. WhatsApp updates require
          separate optional consent.
        </p>
        <p>
          Data retention, processor list, and Nepal-specific rights will be finalized
          before production launch.
        </p>
      </div>
    </StorefrontPageShell>
  );
}
