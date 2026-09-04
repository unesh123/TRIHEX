import manifest from "./product-cover-manifest.json";

export type ManifestItem = {
  slug: string;
  publicPath?: string;
  thumbnailPath?: string;
  infographicPath?: string;
  coverUrl?: string;
  thumbnailUrl?: string;
  infographicUrl?: string;
};

const manifestList = manifest as ManifestItem[];
const manifestBySlug = new Map<string, ManifestItem>(
  manifestList.map((item) => [item.slug, item]),
);

/**
 * Family aliases mapping duration/variant sub-slugs to their canonical parent assets.
 */
const CANONICAL_FAMILY_MAP: Record<string, string> = {
  "cursor-pro-1-month": "cursor-pro-12m",
  "cursor-pro-plus": "cursor-pro-12m",
  "cursor-pro-30-days": "cursor-pro-12m",
  "cursor-ultra": "cursor-pro-12m",
  "capcut-pro-7-days": "capcut-pro",
  "capcut-pro-30-days": "capcut-pro",
  "capcut-pro-6-months": "capcut-pro",
  "notion-business-3-months": "notion-business-12m",
  "elevenlabs-1-month": "elevenlabs-creator-shared",
  "grok-super-3-months": "supergrok-3-months",
  "grok-super-10-months": "supergrok-3-months",
  "grok-super-1-year-fww": "supergrok-3-months",
  "gemini-pro-cdk-12-months": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-12m-mail-a": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-12m-mail-b": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-12m": "gemini-pro-18-months-link",
  "chatgpt-plus-1-month-no-warranty": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-coupon": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-slot": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-mail": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-upgrade-link": "chatgpt-plus-1-month-fw",
  "canva-edu-1-year": "canva-edu-1-year",
  "office365-100gb-lifetime": "office365-100gb-lifetime",
  "office365-1tb-lifetime": "office365-1tb-lifetime",
};

export const FALLBACK_PRODUCT_IMAGE = "/media/products/fallback-product.webp";

/**
 * Normalizes any image URL:
 * - Converts backslashes to forward slashes
 * - Strips local /public or public/ prefixes
 * - Ensures a clean leading slash for local paths
 * - Preserves full remote http/https URLs
 */
export function normalizePublicUrl(value?: string | null): string | null {
  if (!value) return null;

  const path = value.trim().replaceAll("\\", "/");
  if (!path) return null;

  // Remote URLs
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Strip public prefix
  if (path.startsWith("/public/")) {
    return path.slice("/public".length);
  }
  if (path.startsWith("public/")) {
    return `/${path.slice("public/".length)}`;
  }

  // Reject deprecated generator paths that might be stuck in stale cache
  if (path.includes("trihex-generated/")) {
    return null;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export interface ResolveProductInput {
  slug: string;
  thumbnailPublicPath?: string | null;
  coverPublicPath?: string | null;
  infographicPublicPath?: string | null;
}

/**
 * Central resolver for product card thumbnail images (4:5 ratio).
 */
export function resolveProductThumbnail(
  productOrSlug: string | ResolveProductInput,
  dbThumbnail?: string | null,
  legacyCover?: string | null,
): string {
  const slug = typeof productOrSlug === "string" ? productOrSlug : productOrSlug.slug;
  const inputThumb = typeof productOrSlug === "object" ? productOrSlug.thumbnailPublicPath : dbThumbnail;
  const inputCover = typeof productOrSlug === "object" ? productOrSlug.coverPublicPath : legacyCover;

  // 1. Direct explicit V2 thumbnail on product
  const normThumb = normalizePublicUrl(inputThumb);
  if (normThumb && normThumb.startsWith("/media/products/")) {
    return normThumb;
  }

  // 2. Exact slug V2 product thumbnail
  const exactV2 = `/media/products/${slug}/${slug}-thumbnail.webp`;
  const exactManifest = manifestBySlug.get(slug);
  if (exactManifest?.thumbnailPath || exactManifest?.publicPath?.startsWith("/media/products/")) {
    return exactManifest.thumbnailPath ?? exactManifest.publicPath!;
  }

  // 3. Canonical family alias V2 thumbnail
  const canonicalSlug = CANONICAL_FAMILY_MAP[slug];
  if (canonicalSlug) {
    return `/media/products/${canonicalSlug}/${canonicalSlug}-thumbnail.webp`;
  }

  // 4. Fallback to default exact V2 path
  if (exactManifest) {
    return exactV2;
  }

  // 5. Normalized legacy cover if not broken
  const normCover = normalizePublicUrl(inputCover);
  if (normCover && !normCover.includes("trihex-generated/")) {
    return normCover;
  }

  // 6. Generic V2 fallback image
  return FALLBACK_PRODUCT_IMAGE;
}

/**
 * Central resolver for full feature infographic posters (2:3 ratio).
 */
export function resolveProductInfographic(
  productOrSlug: string | ResolveProductInput,
  dbInfographic?: string | null,
): string {
  const slug = typeof productOrSlug === "string" ? productOrSlug : productOrSlug.slug;
  const inputInfo = typeof productOrSlug === "object" ? productOrSlug.infographicPublicPath : dbInfographic;

  const normInfo = normalizePublicUrl(inputInfo);
  if (normInfo && normInfo.startsWith("/media/products/")) {
    return normInfo;
  }

  const exactManifest = manifestBySlug.get(slug);
  if (exactManifest?.infographicPath) {
    return exactManifest.infographicPath;
  }

  const canonicalSlug = CANONICAL_FAMILY_MAP[slug];
  if (canonicalSlug) {
    return `/media/products/${canonicalSlug}/${canonicalSlug}-infographic.webp`;
  }

  return `/media/products/${slug}/${slug}-infographic.webp`;
}

/**
 * Central resolver for PDP image galleries.
 */
export function resolveProductGallery(
  productOrSlug: string | ResolveProductInput,
): string[] {
  const info = resolveProductInfographic(productOrSlug);
  const thumb = resolveProductThumbnail(productOrSlug);

  const set = new Set<string>();
  if (info) set.add(info);
  if (thumb) set.add(thumb);

  if (set.size === 0) set.add(FALLBACK_PRODUCT_IMAGE);
  return Array.from(set);
}
