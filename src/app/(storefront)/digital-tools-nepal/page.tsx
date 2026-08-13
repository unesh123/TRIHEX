import type { Metadata } from "next";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoCatalogProducts } from "@/lib/catalog/demo-catalog";

export const metadata: Metadata = {
  title: "Digital tools Nepal | TRIHEX DIGITAL",
  description:
    "Digital tools, assets, and services for Nepali customers with verified supply.",
};

export default function DigitalToolsNepalPage() {
  const products = getDemoCatalogProducts();

  return (
    <StorefrontPageShell
      title="Digital tools in Nepal"
      description="Software, assets, and services with website ordering and local support."
    >
      <div className="mb-8 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          From productivity apps to creative suites, digital tools should be purchased
          through channels that respect vendor authorization. TRIHEX publishes clear
          NPR prices and documents how each product is fulfilled after verified payment.
        </p>
        <p>
          This page highlights our current public catalogue. Availability changes as
          compliance documentation is completed — we prefer fewer honest listings over
          speculative screenshots.
        </p>
      </div>
      <ProductGrid products={products} />
    </StorefrontPageShell>
  );
}
