import { getProductCover, type ProductCoverEntry } from "@/lib/catalog/product-covers";

export interface ProductImageSet {
  slug: string;
  brandFamily: string;
  title: string;
  thumbnailUrl: string;
  infographicUrl: string;
  galleryUrls: string[];
  alt: string;
}

/**
 * Returns the complete image set for a given product slug:
 * - thumbnailUrl: 4:5 optimized for catalogue grids, cards, search, mobile.
 * - infographicUrl: 2:3 high-res detailed infographic sales poster.
 * - galleryUrls: Ordered list of images for product detail page and lightbox.
 */
export function getProductImageSet(
  slug: string,
  title?: string,
  family?: string,
): ProductImageSet {
  const cover: ProductCoverEntry | null = getProductCover(slug);
  const brandFamily = family || cover?.family || "trihex";
  const displayTitle = title || cover?.alt || slug;

  // Dedicated V2 media folder check
  const v2Thumbnail = `/media/products/${slug}/${slug}-thumbnail.webp`;
  const v2Infographic = `/media/products/${slug}/${slug}-infographic.webp`;

  // Fallback to existing cover if v2 not yet deployed
  const fallbackCover = cover?.publicPath || `/media/covers/${brandFamily}/${slug}.webp`;

  const thumbnailUrl = v2Thumbnail;
  const infographicUrl = v2Infographic;
  const galleryUrls = [infographicUrl, thumbnailUrl];

  return {
    slug,
    brandFamily,
    title: displayTitle,
    thumbnailUrl,
    infographicUrl,
    galleryUrls,
    alt: `${displayTitle} — TRIHEX DIGITAL Nepal`,
  };
}

/** Returns thumbnail image path for product grids/cards */
export function getProductThumbnail(slug: string, fallback?: string | null): string {
  return `/media/products/${slug}/${slug}-thumbnail.webp` || fallback || "/brand/trihex-mark.webp";
}

/** Returns full detailed infographic poster for PDP and lightbox */
export function getProductInfographic(slug: string, fallback?: string | null): string {
  return `/media/products/${slug}/${slug}-infographic.webp` || fallback || "/brand/trihex-mark.webp";
}
