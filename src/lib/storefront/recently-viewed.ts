"use client";

import type { BrandFamily } from "@/components/storefront/family-artwork";

export interface RecentlyViewedProduct {
  slug: string;
  title: string;
  packageLabel?: string;
  priceNprMinor: number | null;
  coverPublicPath?: string | null;
  brandFamily?: BrandFamily;
  viewedAt: number;
}

const STORAGE_KEY = "trihex_recently_viewed_v1";
const MAX_ITEMS = 10;

export function recordProductView(
  product: Omit<RecentlyViewedProduct, "viewedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: RecentlyViewedProduct[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((item) => item.slug !== product.slug);
    const updated: RecentlyViewedProduct[] = [
      { ...product, viewedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("trihex-recently-viewed-updated"));
  } catch (err) {
    console.warn("[RecentlyViewed] Failed to save view to localStorage", err);
  }
}

export function getRecentlyViewedProducts(): RecentlyViewedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearRecentlyViewedProducts(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("trihex-recently-viewed-updated"));
  } catch (err) {
    console.warn("[RecentlyViewed] Failed to clear views", err);
  }
}
