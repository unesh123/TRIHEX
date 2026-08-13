import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoCatalogProducts } from "@/lib/catalog/demo-catalog";

export const metadata: Metadata = {
  title: "Business AI setup Nepal | TRIHEX DIGITAL",
  description:
    "Consultation and setup services to map AI tools to Nepali small-business workflows.",
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
      <ProductGrid
        products={products}
        emptyMessage="See our consultation listing on the products page."
      />
      <p className="mt-8 text-sm">
        <Link href="/products/small-business-ai-setup-consultation" className="text-primary hover:underline">
          Small Business AI Setup Consultation
        </Link>
      </p>
    </StorefrontPageShell>
  );
}
