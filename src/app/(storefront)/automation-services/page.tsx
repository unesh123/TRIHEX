import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { QuoteRequestForm } from "@/components/storefront/quote-request-form";
import { getDemoProductsByCategory } from "@/lib/catalog/demo-catalog";

export const metadata: Metadata = {
  title: "AI Automation Services in Nepal | TRIHEX DIGITAL",
  description:
    "Plan practical AI workflow automation for Nepali businesses: discovery, scoped implementation, NPR proposals, and accountable delivery through TRIHEX DIGITAL.",
  keywords: [
    "AI automation services Nepal",
    "business workflow automation Nepal",
    "small business AI setup Nepal",
    "AI workflow consultation Nepal",
  ],
  alternates: { canonical: "/automation-services" },
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
      <div className="mb-10">
        <QuoteRequestForm />
      </div>
      <div className="border-t border-[var(--border)] pt-10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
          Available service packages
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold text-[var(--text)]">
          Start with a clear scope
        </h2>
        <ProductGrid products={products} />
      </div>
      <p className="mt-8 text-sm">
        <Link href="/products/custom-workflow-automation-discovery" className="text-primary hover:underline">
          Custom Workflow Automation Discovery Session
        </Link>
      </p>
    </StorefrontPageShell>
  );
}
