import { ProductCard } from "@/components/storefront/product-card";
import type { ProductCardProps } from "@/components/storefront/product-card";
import {
  getMerchCardBySlug,
  type MerchCard,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import { resolveBrandFamily } from "@/components/storefront/family-artwork";

function toMerch(product: MerchCard | ProductCardProps): MerchCard {
  if ("title" in product && "brandFamily" in product && "visibility" in product) {
    return product;
  }
  const legacy = product as ProductCardProps;
  const fromSeed = getMerchCardBySlug(legacy.slug);
  if (fromSeed) return fromSeed;
  return {
    slug: legacy.slug,
    brandSlug: "generic",
    brandName: legacy.brandName ?? "TRIHEX",
    brandFamily: resolveBrandFamily("generic", legacy.slug),
    categorySlug: "general",
    categoryName: legacy.categoryName ?? "General",
    categoryLabel: legacy.categoryName ?? "General",
    title: legacy.name,
    packageLabel: legacy.duration ?? "Standard package",
    shortDescription: legacy.shortDescription ?? "",
    durationLabel: legacy.duration ?? null,
    activationLabel: legacy.activationType,
    fulfillmentEstimate: legacy.fulfillmentEstimate,
    warrantyLabel: legacy.warranty ?? null,
    priceNprMinor: legacy.priceNprMinor,
    compareAtPriceNprMinor: null,
    discountPercent: null,
    showPrice: true,
    visibility:
      legacy.stockStatus === "out_of_stock" ? "OUT_OF_STOCK" : "AVAILABLE",
    purchasable: legacy.stockStatus !== "out_of_stock",
    variantSku: "",
    featured: Boolean(legacy.featured),
    sourceListingText: legacy.name,
    features: [],
    stockQty: null,
    stockLabel: null,
  };
}

export function ProductGrid({
  products,
  emptyMessage = "No products match your filters.",
}: {
  products: Array<MerchCard | ProductCardProps>;
  emptyMessage?: string;
}) {
  const normalizedCards = products.map(toMerch);
  const cards = normalizedCards.length > 0 && normalizedCards.every((card) => card.isFamilyCard)
    ? normalizedCards
    : withFamilyGrouping(normalizedCards);

  if (!cards.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--page-soft)] px-6 py-16 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-5 sm:max-w-none sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
