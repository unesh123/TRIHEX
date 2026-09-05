import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";
import { ProductSearchAutocomplete } from "@/components/storefront/product-search-autocomplete";
import { TrustStrip } from "@/components/storefront/trust-strip";
import { EmptyState } from "@/components/storefront/empty-state";
import { PricingTrustSection } from "@/components/storefront/pricing-trust-section";
import {
  getLiveMerchandisingCatalogue,
  withFamilyGrouping,
  type CatalogueVisibility,
} from "@/lib/catalog/merchandising";
import { getCatalogueStats } from "@/lib/catalog/catalogue-stats";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

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

const FILTERS: Array<{ id: string; label: string; visibility?: CatalogueVisibility[] }> = [
  { id: "all", label: "All" },
  { id: "available", label: "Available", visibility: ["AVAILABLE"] },
  { id: "review", label: "Under Review", visibility: ["AVAILABILITY_UNDER_REVIEW", "COMING_SOON"] },
  { id: "blocked", label: "Unavailable", visibility: ["BLOCKED", "OUT_OF_STOCK"] },
];

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
  searchParams: Promise<{
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
  const params = await searchParams;
  const filter = FILTERS.find((f) => f.id === (params.filter ?? "all")) ?? FILTERS[0]!;
  const minPrice = params.min ? Number(params.min) : undefined;
  const maxPrice = params.max ? Number(params.max) : undefined;

  const [allForFacets, stats] = await Promise.all([
    getLiveMerchandisingCatalogue({ includeBlocked: true }),
    getCatalogueStats(),
  ]);
  const brands = Array.from(
    new Map(allForFacets.map((c) => [c.brandSlug, c.brandName])).entries(),
  ).sort((a, b) => a[1].localeCompare(b[1]));

  let products = await getLiveMerchandisingCatalogue({
    query: params.q,
    categorySlug: params.category,
    brandSlug: params.brand,
    visibility: filter.visibility,
    includeBlocked: true,
    minPriceNpr: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPriceNpr: Number.isFinite(maxPrice) ? maxPrice : undefined,
    duration: params.duration,
  });

  // One card per product line — durations switch inside the product page
  products = withFamilyGrouping(products);

  const sort = params.sort ?? "featured";
  if (sort === "price-asc") {
    products = [...products].sort(
      (a, b) => (a.priceNprMinor ?? Number.MAX_SAFE_INTEGER) - (b.priceNprMinor ?? Number.MAX_SAFE_INTEGER),
    );
  } else if (sort === "price-desc") {
    products = [...products].sort(
      (a, b) => (b.priceNprMinor ?? 0) - (a.priceNprMinor ?? 0),
    );
  } else {
    products = [...products].sort((a, b) => {
      const rank = (c: typeof a) => {
        if (c.categorySlug === "ai-tools") return 0;
        if (c.categorySlug === "services" || c.categorySlug === "digital-assets")
          return 3;
        if (c.featured) return 1;
        return 2;
      };
      const d = rank(a) - rank(b);
      if (d !== 0) return d;
      return Number(b.featured) - Number(a.featured);
    });
  }

  const availableCount = allForFacets.filter((c) => c.visibility === "AVAILABLE").length;

  function hrefWith(extra: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = {
      filter: filter.id,
      q: params.q,
      sort,
      brand: params.brand,
      min: params.min,
      max: params.max,
      duration: params.duration,
      ...extra,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    const qs = sp.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <StorefrontPageShell
      title="Products"
      description="Browse AI assistants, creative tools, learning packages, and TRIHEX services. Unavailable packages stay visible for comparison but cannot be ordered until approved."
    >
      <div className="mb-5">
        <TrustStrip />
      </div>

      <div className="mb-7 overflow-hidden rounded-[1.65rem] border border-[var(--border)] bg-white shadow-[0_18px_42px_rgba(16,24,39,.08)]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] bg-[linear-gradient(135deg,#f4f8fc,#eef8f4)] px-4 py-4 sm:px-5 sm:py-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--primary)]">Curated discovery</p>
            <p className="mt-1 font-[family-name:var(--font-sora)] text-lg font-semibold tracking-[-0.025em] text-[var(--text)]">Find a package with confidence.</p>
          </div>
          <p className="rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-sm">
            {stats.availableProductLines} product lines ({stats.availableSkus} SKUs) ready to order now
          </p>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:p-5">
        <form action="/products" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input type="hidden" name="filter" value={filter.id} />
          <ProductSearchAutocomplete defaultQuery={params.q ?? ""} />
          <select
            name="brand"
            defaultValue={params.brand ?? ""}
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none"
            aria-label="Brand"
          >
            <option value="">All brands</option>
            {brands.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
          <select
            name="duration"
            defaultValue={params.duration ?? ""}
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none"
            aria-label="Duration"
          >
            <option value="">Any duration</option>
            {DURATIONS.filter(Boolean).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            name="min"
            type="number"
            min={0}
            defaultValue={params.min ?? ""}
            placeholder="Min Rs"
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none sm:w-28"
            aria-label="Minimum price"
          />
          <input
            name="max"
            type="number"
            min={0}
            defaultValue={params.max ?? ""}
            placeholder="Max Rs"
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none sm:w-28"
            aria-label="Maximum price"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none"
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <button
            type="submit"
            className="h-11 rounded-xl bg-[var(--surface-ink)] px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Apply
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const href = hrefWith({ filter: f.id });
            const active = f.id === filter.id;
            return (
              <a
                key={f.id}
                href={href}
                className={
                  active
                    ? "rounded-full bg-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
                    : "rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] transition hover:border-[var(--primary)]/30 hover:bg-[var(--primary-soft)]"
                }
              >
                {f.label}
              </a>
            );
          })}
        </div>

        <p className="border-t border-[var(--border)] pt-3 text-sm text-[var(--text-secondary)]">
          Showing <strong>{products.length}</strong> active product lines ({products.filter(p => !(p.brandSlug === "trihex" && (p.categorySlug === "services" || p.categorySlug === "digital-assets"))).length} software subscriptions &amp; {products.filter(p => p.brandSlug === "trihex" && (p.categorySlug === "services" || p.categorySlug === "digital-assets")).length} managed services). Duration choices live inside each product page, and each package shows its current availability before checkout.
        </p>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No packages match"
          body="Try clearing filters or search another brand. You can also inquire on WhatsApp."
          primaryHref="/products"
          primaryLabel="Clear filters"
          secondaryHref="/inquire"
          secondaryLabel="Inquire list"
        />
      ) : (
        <ProductGrid products={products} />
      )}

      <div className="mt-14 -mx-4 sm:-mx-6 lg:-mx-8">
        <PricingTrustSection />
      </div>

      <div className="mt-10">
        <ComplianceDisclaimer />
      </div>
    </StorefrontPageShell>
  );
}
