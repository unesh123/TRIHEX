import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoCatalogProducts } from "@/lib/catalog/demo-catalog";

export const dynamic = "force-dynamic";

export default function BestValuePage() {
  const products = getDemoCatalogProducts();

  return (
    <StorefrontPageShell
      title="Best value"
      description="Transparent NPR pricing on products we can fulfill with verified supply."
    >
      <p className="mb-8 text-sm text-text-muted">
        Value means honest pricing, clear fulfillment steps, and local support — not
        artificial markdowns. Compare duration, activation type, and fulfillment
        estimates on each product card.
      </p>
      <ProductGrid products={products} />
    </StorefrontPageShell>
  );
}
