import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { CartView } from "@/components/storefront/cart-view";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import type { DemoCatalogItem } from "@/lib/catalog/demo-catalog";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const catalog: DemoCatalogItem[] = (
    await getLiveMerchandisingCatalogue({
      visibility: ["AVAILABLE"],
    })
  ).map((p) => ({
    slug: p.slug,
    name: p.title,
    shortDescription: p.shortDescription,
    brandName: p.brandName,
    categoryName: p.categoryName,
    duration: p.durationLabel ?? undefined,
    activationType: p.activationLabel,
    warranty: p.warrantyLabel ?? undefined,
    priceNprMinor: p.priceNprMinor ?? 0,
    stockStatus: "in_stock",
    fulfillmentEstimate: p.fulfillmentEstimate,
    authorizationVerified: true,
    featured: p.featured,
    variantSku: p.variantSku,
    variantName: p.packageLabel,
  }));

  return (
    <StorefrontPageShell
      title="Cart"
      description="Review items before checkout. Totals are recalculated server-side."
    >
      <CartView catalog={catalog} />
    </StorefrontPageShell>
  );
}
