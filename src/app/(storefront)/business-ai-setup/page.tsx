import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { QuoteRequestForm } from "@/components/storefront/quote-request-form";
import { getDemoCatalogProducts } from "@/lib/catalog/demo-catalog";

export const metadata: Metadata = {
  title: "Business AI Setup in Nepal | TRIHEX DIGITAL",
  description:
    "Practical AI setup for Nepali small businesses: workflow discovery, tool selection, scoped NPR proposals, and responsible implementation support.",
  keywords: [
    "business AI setup Nepal",
    "AI tools for small business Nepal",
    "small business AI consultation Nepal",
    "AI workflow setup Kathmandu",
  ],
  alternates: { canonical: "/business-ai-setup" },
};

export default function BusinessAiSetupPage() {
  const products = getDemoCatalogProducts().filter((p) =>
    p.slug.includes("business") || p.slug.includes("consultation"),
  );

  return (
    <StorefrontPageShell
      title="Business AI setup"
      description="Hands-on consultation for Nepali teams adopting AI responsibly."
    >
      <div className="mb-8 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Small businesses in Kathmandu, Pokhara, and across Nepal want practical AI
          adoption — not hype. TRIHEX offers a structured consultation to map tools to
          your existing workflows, data boundaries, and budget in NPR.
        </p>
        <p>
          Sessions are scheduled after website checkout and verified payment. We document
          recommendations you can implement internally or continue with TRIHEX managed
          setup services.
        </p>
      </div>
      <div className="mb-10">
        <QuoteRequestForm />
      </div>
      <div className="border-t border-[var(--border)] pt-10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
          Start with an available service
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold text-[var(--text)]">
          Service packages
        </h2>
        <ProductGrid
          products={products}
          emptyMessage="See our consultation listing on the products page."
        />
      </div>
      <p className="mt-8 text-sm">
        <Link href="/products/small-business-ai-setup-consultation" className="text-primary hover:underline">
          Small Business AI Setup Consultation
        </Link>
      </p>
    </StorefrontPageShell>
  );
}
