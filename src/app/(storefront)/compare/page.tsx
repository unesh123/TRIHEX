import type { Metadata } from "next";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductCompare, type CompareProductItem } from "@/components/tools/product-compare";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";

export const metadata: Metadata = {
  title: "Compare AI Tools & Digital Products — TRIHEX DIGITAL Nepal",
  description:
    "Side-by-side comparison of AI software plans, pricing in NPR, activation mechanisms, warranty terms, and delivery SLAs.",
  alternates: { canonical: "/compare" },
};

export const dynamic = "force-dynamic";

interface ComparePageProps {
  searchParams: Promise<{ items?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { items } = await searchParams;
  const catalogue = await getLiveMerchandisingCatalogue();

  const allAvailableProducts: CompareProductItem[] = catalogue.map((p) => ({
    slug: p.slug,
    title: p.title,
    packageLabel: p.packageLabel,
    durationLabel: p.durationLabel ?? null,
    priceNprMinor: p.showPrice ? p.priceNprMinor : null,
    categoryLabel: p.categoryLabel,
    activationLabel: p.activationLabel,
    fulfillmentEstimate: p.fulfillmentEstimate,
    warrantyLabel: p.warrantyLabel ?? null,
    features: p.features,
    purchasable: p.purchasable,
    coverPublicPath: p.coverPublicPath ?? p.thumbnailPublicPath ?? null,
  }));

  const itemSlugs = (items ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const initialItems = itemSlugs
    .map((slug) => allAvailableProducts.find((p) => p.slug === slug))
    .filter((p): p is CompareProductItem => Boolean(p));

  return (
    <StorefrontPageShell
      title="Product Comparison Engine"
      description="Compare AI tools and packages side-by-side on verified pricing, warranty coverage, activation terms, and delivery SLAs."
    >
      <ProductCompare
        initialItems={initialItems}
        allAvailableProducts={allAvailableProducts}
      />
    </StorefrontPageShell>
  );
}
