"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import type { ProductCardProps } from "@/components/storefront/product-card";
import {
  getMerchCardBySlug,
  type MerchCard,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import { resolveBrandFamily } from "@/components/storefront/family-artwork";
import { resolveProductThumbnail } from "@/lib/catalog/product-image-resolver";
import { Search, Sparkles, Filter, PackageCheck } from "lucide-react";

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
    visibility: legacy.stockStatus === "out_of_stock" ? "OUT_OF_STOCK" : "AVAILABLE",
    purchasable: legacy.stockStatus !== "out_of_stock",
    variantSku: "",
    featured: Boolean(legacy.featured),
    sourceListingText: legacy.name,
    features: [],
    stockQty: null,
    stockLabel: null,
    coverPublicPath: resolveProductThumbnail(legacy.slug, null, legacy.coverPublicPath),
    thumbnailPublicPath: resolveProductThumbnail(legacy.slug, null, legacy.coverPublicPath),
  };
}

const CATEGORY_TABS = [
  { id: "all", label: "🔥 All Products" },
  { id: "ai", label: "🤖 AI Subscriptions" },
  { id: "creative", label: "🎨 Video & Creative" },
  { id: "dev", label: "💻 Dev & Cloud" },
  { id: "vip", label: "👑 VIP Passes" },
  { id: "deals", label: "⚡ Top Deals" },
] as const;

export function ProductGrid({
  products,
  emptyMessage = "No products match your filters.",
  showFilters = true,
}: {
  products: Array<MerchCard | ProductCardProps>;
  emptyMessage?: string;
  showFilters?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [query, setQuery] = useState("");

  const normalizedCards = useMemo(() => {
    const list = products.map(toMerch);
    return list.length > 0 && list.every((card) => card.isFamilyCard)
      ? list
      : withFamilyGrouping(list);
  }, [products]);

  const filtered = useMemo(() => {
    let result = normalizedCards;

    // Filter by category tab
    if (activeTab === "ai") {
      result = result.filter((p) => {
        const s = `${p.title} ${p.categorySlug} ${p.brandSlug}`.toLowerCase();
        return (
          s.includes("gpt") ||
          s.includes("openai") ||
          s.includes("gemini") ||
          s.includes("claude") ||
          s.includes("grok") ||
          s.includes("ai") ||
          s.includes("deepseek") ||
          s.includes("kling")
        );
      });
    } else if (activeTab === "creative") {
      result = result.filter((p) => {
        const s = `${p.title} ${p.categorySlug} ${p.brandSlug}`.toLowerCase();
        return (
          s.includes("capcut") ||
          s.includes("canva") ||
          s.includes("adobe") ||
          s.includes("video") ||
          s.includes("kling") ||
          s.includes("veo")
        );
      });
    } else if (activeTab === "dev") {
      result = result.filter((p) => {
        const s = `${p.title} ${p.categorySlug} ${p.brandSlug}`.toLowerCase();
        return (
          s.includes("cursor") ||
          s.includes("cloud") ||
          s.includes("coursera") ||
          s.includes("academy") ||
          s.includes("code") ||
          s.includes("developer")
        );
      });
    } else if (activeTab === "vip") {
      result = result.filter((p) => {
        const s = `${p.title} ${p.slug} ${p.categorySlug}`.toLowerCase();
        return s.includes("vip") || s.includes("lifetime") || s.includes("pass");
      });
    } else if (activeTab === "deals") {
      result = result.filter(
        (p) => (p.discountPercent != null && p.discountPercent > 0) || Boolean(p.featured),
      );
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.brandName?.toLowerCase().includes(q) ||
          p.categoryLabel?.toLowerCase().includes(q) ||
          (p.shortDescription || "").toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [normalizedCards, activeTab, query]);

  return (
    <div className="space-y-6">
      {/* ── Optional Interactive Filter Bar (NimbusStore style) ── */}
      {showFilters && (
        <div className="space-y-3.5">
          {/* Search bar & Live product counter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search software packages, AI tools, CapCut, Gemini..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 rounded-lg px-2.5 py-1">
                <PackageCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>{filtered.length} products available</span>
              </span>
            </div>
          </div>

          {/* Category Tabs Pill Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2 Products Per Row on Mobile (Grid) ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">{emptyMessage}</p>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveTab("all");
              }}
              className="mt-3 text-xs font-bold text-blue-600 hover:underline"
            >
              Clear filters and show all products
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
