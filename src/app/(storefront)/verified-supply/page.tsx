import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";

export default function VerifiedSupplyPage() {
  return (
    <StorefrontPageShell
      title="Verified supply"
      description="How TRIHEX evaluates authorization before listing third-party products."
    >
      <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Public catalogue items must pass compliance review: approved compliance
          status, verified vendor proof where required, and a permitted supply
          authorization type (authorized reseller, official codes, customer email
          activation, or TRIHEX-owned assets and services).
        </p>
        <p>
          Screenshot-derived draft listings remain non-public until documentation
          is complete. Adobe individual-account transfers and consumer account
          resale patterns are blocked by policy.
        </p>
        <p>
          Product pages show a verified authorization badge only when these gates
          pass in our system — not based on marketing claims in supplier text.
        </p>
      </div>
      <ComplianceDisclaimer className="mt-10" />
    </StorefrontPageShell>
  );
}
