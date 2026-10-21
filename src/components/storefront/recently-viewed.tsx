"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Eye, Trash2, ArrowRight } from "lucide-react";
import { ProductCover } from "@/components/storefront/product-cover";
import { formatStorePrice } from "@/lib/catalog/merchandising";
import type { BrandFamily } from "@/components/storefront/family-artwork";
import {
  recordProductView,
  getRecentlyViewedProducts,
  clearRecentlyViewedProducts,
  type RecentlyViewedProduct,
} from "@/lib/storefront/recently-viewed";

interface RecentlyViewedProps {
  currentProduct?: {
    slug: string;
    title: string;
    packageLabel?: string;
    priceNprMinor: number | null;
    coverPublicPath?: string | null;
    brandFamily?: BrandFamily;
  };
  excludeCurrent?: boolean;
}

export function RecentlyViewed({
  currentProduct,
  excludeCurrent = true,
}: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentlyViewedProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (currentProduct) {
      recordProductView(currentProduct);
    }

    const loadItems = () => {
      const all = getRecentlyViewedProducts();
      if (excludeCurrent && currentProduct) {
        setItems(all.filter((item) => item.slug !== currentProduct.slug));
      } else {
        setItems(all);
      }
    };

    loadItems();

    window.addEventListener("trihex-recently-viewed-updated", loadItems);
    return () => {
      window.removeEventListener("trihex-recently-viewed-updated", loadItems);
    };
  }, [currentProduct, excludeCurrent]);

  if (!mounted || items.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 rounded-2xl border border-[var(--border)] bg-gradient-to-b from-slate-50/50 to-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-sora)] text-base font-semibold text-slate-900">
              Recently Viewed by You
            </h3>
            <p className="text-xs text-slate-500">
              Continue exploring plans you recently checked out
            </p>
          </div>
        </div>

        <button
          onClick={() => clearRecentlyViewedProducts()}
          title="Clear browsing history"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.slug}
            href={`/products/${item.slug}`}
            className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-3 transition hover:border-indigo-400 hover:shadow-md"
          >
            <div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100 mb-2.5">
                <ProductCover
                  slug={item.slug}
                  family={item.brandFamily ?? "generic"}
                  title={item.title}
                  coverPublicPath={item.coverPublicPath}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              <h4 className="line-clamp-2 text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                {item.title}
              </h4>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
              <span className="font-bold text-slate-900">
                {item.priceNprMinor != null
                  ? formatStorePrice(item.priceNprMinor)
                  : "Inquire"}
              </span>
              <span className="text-[11px] text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
                View <ArrowRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
