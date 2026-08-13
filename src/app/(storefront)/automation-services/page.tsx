import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoProductsByCategory } from "@/lib/catalog/demo-catalog";

export const metadata: Metadata = {
  title: "Automation services Nepal | TRIHEX DIGITAL",
  description:
    "Workflow automation discovery and managed setup for Nepali organizations.",
};

export default function AutomationServicesPage() {
  const products = getDemoProductsByCategory("services");

  return (
    <StorefrontPageShell
      title="Automation services"
      description="Discovery and implementation support for forms, notifications, and integrations."
    >
      <div className="mb-8 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Manual copy-paste between spreadsheets, chat apps, and web forms slows Nepali
          teams down. TRIHEX automation services start with a discovery session to map
          triggers, data stores, and approval steps before any build work.
        </p>
        <p>
          We scope honestly: not every workflow should be automated, and some vendors
          require official API access. Expect clear deliverables and NPR pricing on the
          website — no open-ended WhatsApp quotes as the system of record.
        </p>
      </div>
      <ProductGrid products={products} />
      <p className="mt-8 text-sm">
        <Link href="/products/custom-workflow-automation-discovery" className="text-primary hover:underline">
          Custom Workflow Automation Discovery Session
        </Link>
      </p>
    </StorefrontPageShell>
  );
}
