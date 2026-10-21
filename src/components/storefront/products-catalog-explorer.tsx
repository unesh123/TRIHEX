"use client";

import { useState, useMemo, useTransition, useCallback } from "react";
import { Search, X, RotateCcw, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { ProductGrid } from "@/components/storefront/product-grid";
import { EmptyState } from "@/components/storefront/empty-state";
import type { MerchCard } from "@/lib/catalog/merchandising";
import type { CatalogueStats } from "@/lib/catalog/catalogue-stats";

export interface ProductsCatalogExplorerProps {
  allProducts: MerchCard[];
  brands: [string, string][];
  durations: string[];
  stats: CatalogueStats;
  initialFilter?: string;
  initialQuery?: string;
  initialBrand?: string;
  initialDuration?: string;
  initialMin?: string;
  initialMax?: string;
  initialSort?: string;
}

const TABS = [
  { id: "all", label: "All Packages" },
  { id: "available", label: "Available Now" },
  { id: "review", label: "Under Review" },
  { id: "blocked", label: "Unavailable" },
] as const;

export function ProductsCatalogExplorer({
  allProducts,
  brands,
  durations,
  stats,
  initialFilter = "all",
  initialQuery = "",
  initialBrand = "",
  initialDuration = "",
  initialMin = "",
  initialMax = "",
  initialSort = "featured",
}: ProductsCatalogExplorerProps) {
  const [, startTransition] = useTransition();

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [query, setQuery] = useState(initialQuery);
  const [brand, setBrand] = useState(initialBrand);
  const [duration, setDuration] = useState(initialDuration);
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [sort, setSort] = useState(initialSort);

  // Sync URL in background without triggering Next.js RSC fetch
  const syncUrl = useCallback(
    (updates: {
      filter?: string;
      q?: string;
      brand?: string;
      duration?: string;
      min?: string;
      max?: string;
      sort?: string;
    }) => {
      if (typeof window === "undefined") return;
      try {
        const url = new URL(window.location.href);
        const nextFilter = updates.filter !== undefined ? updates.filter : activeFilter;
        const nextQ = updates.q !== undefined ? updates.q : query;
        const nextBrand = updates.brand !== undefined ? updates.brand : brand;
        const nextDur = updates.duration !== undefined ? updates.duration : duration;
        const nextMin = updates.min !== undefined ? updates.min : minPrice;
        const nextMax = updates.max !== undefined ? updates.max : maxPrice;
        const nextSort = updates.sort !== undefined ? updates.sort : sort;

        if (nextFilter && nextFilter !== "all") url.searchParams.set("filter", nextFilter);
        else url.searchParams.delete("filter");

        if (nextQ.trim()) url.searchParams.set("q", nextQ.trim());
        else url.searchParams.delete("q");

        if (nextBrand) url.searchParams.set("brand", nextBrand);
        else url.searchParams.delete("brand");

        if (nextDur) url.searchParams.set("duration", nextDur);
        else url.searchParams.delete("duration");

        if (nextMin) url.searchParams.set("min", nextMin);
        else url.searchParams.delete("min");

        if (nextMax) url.searchParams.set("max", nextMax);
        else url.searchParams.delete("max");

        if (nextSort && nextSort !== "featured") url.searchParams.set("sort", nextSort);
        else url.searchParams.delete("sort");

        window.history.replaceState(null, "", url.toString());
      } catch {
        /* Ignore browser history error */
      }
    },
    [activeFilter, query, brand, duration, minPrice, maxPrice, sort],
  );

  const handleTabClick = (tabId: string) => {
    startTransition(() => {
      setActiveFilter(tabId);
      syncUrl({ filter: tabId });
    });
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    syncUrl({ q: val });
  };

  const handleBrandChange = (val: string) => {
    setBrand(val);
    syncUrl({ brand: val });
  };

  const handleDurationChange = (val: string) => {
    setDuration(val);
    syncUrl({ duration: val });
  };

  const handleMinChange = (val: string) => {
    setMinPrice(val);
    syncUrl({ min: val });
  };

  const handleMaxChange = (val: string) => {
    setMaxPrice(val);
    syncUrl({ max: val });
  };

  const handleSortChange = (val: string) => {
    setSort(val);
    syncUrl({ sort: val });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      setActiveFilter("all");
      setQuery("");
      setBrand("");
      setDuration("");
      setMinPrice("");
      setMaxPrice("");
      setSort("featured");
      syncUrl({
        filter: "all",
        q: "",
        brand: "",
        duration: "",
        min: "",
        max: "",
        sort: "featured",
      });
    });
  };

  // Instant tab counts
  const tabCounts = useMemo(() => {
    return {
      all: allProducts.length,
      available: allProducts.filter((p) => p.visibility === "AVAILABLE").length,
      review: allProducts.filter(
        (p) =>
          p.visibility === "AVAILABILITY_UNDER_REVIEW" ||
          p.visibility === "COMING_SOON",
      ).length,
      blocked: allProducts.filter(
        (p) => p.visibility === "BLOCKED" || p.visibility === "OUT_OF_STOCK",
      ).length,
    };
  }, [allProducts]);

  // Instant filtered products
  const filteredProducts = useMemo(() => {
    let list = allProducts;

    // 1. Tab filter
    if (activeFilter === "available") {
      list = list.filter((p) => p.visibility === "AVAILABLE");
    } else if (activeFilter === "review") {
      list = list.filter(
        (p) =>
          p.visibility === "AVAILABILITY_UNDER_REVIEW" ||
          p.visibility === "COMING_SOON",
      );
    } else if (activeFilter === "blocked") {
      list = list.filter(
        (p) => p.visibility === "BLOCKED" || p.visibility === "OUT_OF_STOCK",
      );
    }

    // 2. Query search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q) ||
          p.packageLabel.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q)),
      );
    }

    // 3. Brand
    if (brand) {
      list = list.filter((p) => p.brandSlug === brand);
    }

    // 4. Duration
    if (duration) {
      const d = duration.toLowerCase();
      list = list.filter((p) =>
        (p.durationLabel ?? p.packageLabel).toLowerCase().includes(d),
      );
    }

    // 5. Min price (rupees)
    if (minPrice && Number.isFinite(Number(minPrice))) {
      const minMinor = Number(minPrice) * 100;
      list = list.filter(
        (p) => p.priceNprMinor != null && p.priceNprMinor >= minMinor,
      );
    }

    // 6. Max price (rupees)
    if (maxPrice && Number.isFinite(Number(maxPrice))) {
      const maxMinor = Number(maxPrice) * 100;
      list = list.filter(
        (p) => p.priceNprMinor != null && p.priceNprMinor <= maxMinor,
      );
    }

    // 7. Sort
    if (sort === "price-asc") {
      list = [...list].sort(
        (a, b) =>
          (a.priceNprMinor ?? Number.MAX_SAFE_INTEGER) -
          (b.priceNprMinor ?? Number.MAX_SAFE_INTEGER),
      );
    } else if (sort === "price-desc") {
      list = [...list].sort(
        (a, b) => (b.priceNprMinor ?? 0) - (a.priceNprMinor ?? 0),
      );
    } else {
      list = [...list].sort((a, b) => {
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

    return list;
  }, [allProducts, activeFilter, query, brand, duration, minPrice, maxPrice, sort]);

  const hasActiveFilters =
    activeFilter !== "all" ||
    query.trim().length > 0 ||
    brand !== "" ||
    duration !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    sort !== "featured";

  return (
    <div>
      {/* Discovery & Facets Box */}
      <div className="mb-7 overflow-hidden rounded-[1.65rem] border border-[var(--border)] bg-white shadow-[0_18px_42px_rgba(16,24,39,.08)]">
        {/* Banner Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] bg-[linear-gradient(135deg,#f4f8fc,#eef8f4)] px-4 py-4 sm:px-5 sm:py-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--primary)]">
              Curated discovery
            </p>
            <p className="mt-1 font-[family-name:var(--font-sora)] text-lg font-semibold tracking-[-0.025em] text-[var(--text)]">
              Find a package with confidence.
            </p>
          </div>
          <p className="rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-sm">
            {stats.availableProductLines} product lines ({stats.availableSkus} SKUs) ready to order now
          </p>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          {/* Controls toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Live Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search brand, package or tool..."
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--page)] pl-9 pr-8 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleQueryChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Brand Dropdown */}
            <select
              value={brand}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none"
              aria-label="Filter by brand"
            >
              <option value="">All brands</option>
              {brands.map(([slug, name]) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>

            {/* Duration Dropdown */}
            <select
              value={duration}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none"
              aria-label="Filter by duration"
            >
              <option value="">Any duration</option>
              {durations.filter(Boolean).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Price inputs */}
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder="Min Rs"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none sm:w-24"
              aria-label="Minimum price"
            />
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => handleMaxChange(e.target.value)}
              placeholder="Max Rs"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none sm:w-24"
              aria-label="Maximum price"
            />

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 text-sm text-[var(--text)] shadow-sm transition focus:border-[var(--primary)] focus:outline-none"
              aria-label="Sort products"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold transition hover:bg-red-100 active:scale-[0.98]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 0ms Instant Tab Switcher */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]/70">
            {TABS.map((t) => {
              const isActive = activeFilter === t.id;
              const count = tabCounts[t.id as keyof typeof tabCounts] ?? 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTabClick(t.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-sm ring-2 ring-[var(--primary)]/20"
                      : "border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary-soft)]"
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Summary Row */}
          <p className="border-t border-[var(--border)] pt-3 text-xs sm:text-sm text-[var(--text-secondary)]">
            Showing <strong>{filteredProducts.length}</strong> active product lines ({filteredProducts.filter(p => !(p.brandSlug === "trihex" && (p.categorySlug === "services" || p.categorySlug === "digital-assets"))).length} software subscriptions &amp; {filteredProducts.filter(p => p.brandSlug === "trihex" && (p.categorySlug === "services" || p.categorySlug === "digital-assets")).length} managed services). Duration choices live inside each product page with instant availability.
          </p>
        </div>
      </div>

      {/* Render Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No packages match your search"
          body="Try clearing filters or search another term. You can also contact our team on WhatsApp for custom requests."
          primaryHref="#"
          primaryLabel="Clear all filters"
          secondaryHref="/inquire"
          secondaryLabel="Inquire list"
        />
      ) : (
        <ProductGrid products={filteredProducts} showFilters={false} />
      )}
    </div>
  );
}
