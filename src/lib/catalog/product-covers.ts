import coverManifest from "@/lib/catalog/product-cover-manifest.json";

export type CoverMode = "ARTWORK_ONLY" | "FULL_CARD" | "SVG_FALLBACK";

export type ProductCoverEntry = {
  slug: string;
  family: string;
  canonical: string;
  publicPath: string;
  mode: CoverMode | string;
  sourceFile?: string;
  alt: string;
  resolutionNote?: string;
  artWidth?: number;
  artHeight?: number;
  lowResReplacementRecommended?: boolean;
};

const bySlug = new Map(
  (coverManifest as ProductCoverEntry[]).map((e) => [e.slug, e]),
);

export function getProductCover(slug: string): ProductCoverEntry | null {
  const entry = bySlug.get(slug) ?? null;
  if (!entry) return null;
  // Normalize legacy /products/covers paths if any remain
  if (entry.publicPath?.startsWith("/products/covers/")) {
    return {
      ...entry,
      publicPath: entry.publicPath.replace(
        "/products/covers/",
        "/media/covers/",
      ),
    };
  }
  return entry;
}

export function getAllProductCovers(): ProductCoverEntry[] {
  return (coverManifest as ProductCoverEntry[]).map(
    (e) => getProductCover(e.slug) ?? e,
  );
}

export function isRasterCover(entry: ProductCoverEntry | null): boolean {
  return Boolean(entry?.publicPath && entry.mode !== "SVG_FALLBACK");
}
