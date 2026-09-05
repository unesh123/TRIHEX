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

const CANONICAL_FAMILY_MAP: Record<string, string> = {
  "super-grok-1-month": "supergrok-3-months",
  "super-grok-3-months": "supergrok-3-months",
  "super-grok-6-months": "supergrok-3-months",
  "super-grok-9-months": "supergrok-3-months",
  "super-grok-12-months": "supergrok-3-months",
};

const bySlug = new Map(
  (coverManifest as ProductCoverEntry[]).map((e) => [e.slug, e]),
);

export function getProductCover(slug: string): ProductCoverEntry | null {
  const targetSlug = CANONICAL_FAMILY_MAP[slug] ?? slug;
  const raw = bySlug.get(targetSlug) ?? bySlug.get(slug) ?? null;
  if (!raw) return null;
  const entry = targetSlug !== slug ? { ...raw, slug } : raw;
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
