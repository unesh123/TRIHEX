import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoProductsByBrand } from "@/lib/catalog/demo-catalog";

export const dynamic = "force-dynamic";

export default function DealsPage() {
  const products = getDemoProductsByBrand("trihex");

  return (
    <StorefrontPageShell
      title="Current offers"
      description="Standard TRIHEX pricing on owned digital products and services. We do not show inflated reference prices or fake percentage discounts."
    >
      <p className="mb-8 rounded-md border border-border bg-surface-raised/50 px-3 py-2 text-sm text-text-muted">
        Every price listed is the actual checkout price unless noted at order time.
        Promotional pricing, when offered, will be labeled explicitly with start and
        end dates.
      </p>
      <ProductGrid products={products} />
    </StorefrontPageShell>
  );
}
