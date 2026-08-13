import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";

export default function AboutPage() {
  return (
    <StorefrontPageShell
      title="About TRIHEX DIGITAL"
      description="Independent digital commerce and services for Nepal."
    >
      <div className="prose prose-invert max-w-3xl space-y-4 text-text-muted">
        <p>
          TRIHEX DIGITAL helps Nepali creators, students, freelancers, and small
          businesses access digital tools and services with transparent NPR pricing,
          website-first ordering, and local support.
        </p>
        <p>
          We publish products only when supply authorization and compliance checks
          pass. Third-party trademarks belong to their owners; affiliation is stated
          only where verified.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/how-it-works">How it works</Button>
        <Button href="/contact" variant="secondary">
          Contact
        </Button>
      </div>
      <ComplianceDisclaimer className="mt-10" />
    </StorefrontPageShell>
  );
}
