import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoProductsByBrand } from "@/lib/catalog/demo-catalog";

export const dynamic = "force-dynamic";

export default function NewArrivalsPage() {
  const products = getDemoProductsByBrand("trihex");

  return (
    <StorefrontPageShell
      title="New arrivals"
      description="Recently published TRIHEX-owned products on the public storefront."
    >
      <p className="mb-8 text-sm text-text-muted">
        This page lists our newest verified listings. Availability and pricing are
        confirmed at checkout on the website.
      </p>
      <ProductGrid products={products} />
    </StorefrontPageShell>
  );
}
