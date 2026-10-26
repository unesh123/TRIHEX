import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";
import { TrustStrip } from "@/components/storefront/trust-strip";
import { PricingTrustSection } from "@/components/storefront/pricing-trust-section";
import { ProductsCatalogExplorer } from "@/components/storefront/products-catalog-explorer";
import {
  compactMerchCardForList,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/live-merchandising";
import { getCatalogueStats } from "@/lib/catalog/catalogue-stats";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Products & Subscriptions — Buy in Nepal",
  description:
    "Browse verified AI subscriptions, design tools, developer environments, and digital licenses in Nepal with transparent NPR pricing and instant local payment support.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "All Products & Subscriptions | TRIHEX DIGITAL Nepal",
    description:
      "Browse verified AI subscriptions, design tools, developer environments, and digital licenses in Nepal with transparent NPR pricing and instant local payment support.",
    url: "https://trihexdigital.shop/products",
    type: "website",
  },
};

const DURATIONS = [
  "",
  "7 Days",
  "1 Month",
  "3 Months",
  "6 Months",
  "12 Months",
  "1 Year",
];

interface ProductsPageProps {
  searchParams?: Promise<{
    q?: string;
    filter?: string;
    category?: string;
    sort?: string;
    brand?: string;
    min?: string;
    max?: string;
    duration?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams ? await searchParams : {};

  const [allRaw, stats] = await Promise.all([
    getLiveMerchandisingCatalogue({ includeBlocked: true }),
    getCatalogueStats(),
  ]);

  const brands = Array.from(
    new Map(allRaw.map((c) => [c.brandSlug, c.brandName])).entries(),
  ).sort((a, b) => a[1].localeCompare(b[1]));

  // One card per product line — durations switch inside the product page
  const allProducts = withFamilyGrouping(allRaw).map(compactMerchCardForList);

  return (
    <StorefrontPageShell
      title="Products"
      description="Browse AI assistants, creative tools, learning packages, and TRIHEX services. Unavailable packages stay visible for comparison but cannot be ordered until approved."
    >
      <div className="mb-5">
        <TrustStrip />
      </div>

      <ProductsCatalogExplorer
        allProducts={allProducts}
        brands={brands}
        durations={DURATIONS.filter(Boolean)}
        stats={stats}
        initialFilter={params.filter ?? "all"}
        initialQuery={params.q ?? ""}
        initialBrand={params.brand ?? ""}
        initialDuration={params.duration ?? ""}
        initialMin={params.min ?? ""}
        initialMax={params.max ?? ""}
        initialSort={params.sort ?? "featured"}
      />

      <div className="mt-14 -mx-4 sm:-mx-6 lg:-mx-8">
        <PricingTrustSection />
      </div>

      <div className="mt-10">
        <ComplianceDisclaimer />
      </div>
    </StorefrontPageShell>
  );
}
