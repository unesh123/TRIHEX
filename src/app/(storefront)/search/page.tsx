import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search TRIHEX DIGITAL",
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const products = await getLiveMerchandisingCatalogue({ query: query || undefined });

  return (
    <StorefrontPageShell
      title={query ? `Search: ${query}` : "Search"}
      description="Search brands, packages, and categories across the TRIHEX catalogue."
    >
      <form action="/search" className="mb-8 max-w-lg" role="search">
        <label htmlFor="search-q" className="sr-only">
          Search query
        </label>
        <input
          id="search-q"
          name="q"
          defaultValue={query}
          placeholder="Search products…"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </form>
      {query ? (
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          {products.length} result{products.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          Enter a search term to find packages.
        </p>
      )}
      <ProductGrid products={products} />
    </StorefrontPageShell>
  );
}
