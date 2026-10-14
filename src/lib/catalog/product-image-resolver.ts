import manifest from "./product-cover-manifest.json";
import { productFamilyKey } from "./product-families";

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
  // CapCut
  "capcut-pro": "capcut-pro",
  "capcut-pro-7-days": "capcut-pro",
  "capcut-pro-30-days": "capcut-pro",
  "capcut-pro-1-month": "capcut-pro",
  "capcut-pro-3-months": "capcut-pro",
  "capcut-pro-6-months": "capcut-pro",
  "capcut-pro-12-months": "capcut-pro",

  // ChatGPT
  "chatgpt-plus": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-fw": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-3-months": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-6-months": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-12-months": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-no-warranty": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-coupon": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-slot": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-mail": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-1-month-upgrade-link": "chatgpt-plus-1-month-fw",
  "chatgpt-plus-gmail-w15d": "chatgpt-plus-1-month-fw",
  "chatgpt-team-1-month": "chatgpt-plus-1-month-fw",
  "chatgpt-go-1-month": "chatgpt-plus-1-month-fw",
  "chatgpt-go-3-months": "chatgpt-plus-1-month-fw",
  "chatgpt-go-3-months-coupon": "chatgpt-plus-1-month-fw",

  // ElevenLabs
  elevenlabs: "elevenlabs-creator-shared",
  "elevenlabs-1-month": "elevenlabs-creator-shared",
  "elevenlabs-creator-shared": "elevenlabs-creator-shared",
  "elevenlabs-creator-1-month": "elevenlabs-creator-shared",
  "elevenlabs-creator-12-months": "elevenlabs-creator-shared",
  "elevenlabs-starter-1-month": "elevenlabs-creator-shared",
  "elevenlabs-pro-1-month": "elevenlabs-creator-shared",

  // Claude
  "claude-pro": "claude-pro-1-month",
  "claude-pro-1-month": "claude-pro-1-month",
  "claude-pro-3-months": "claude-pro-1-month",
  "claude-pro-6-months": "claude-pro-1-month",
  "claude-pro-12-months": "claude-pro-1-month",
  "claude-team-1-month": "claude-pro-1-month",
  "claude-code-api-access": "claude-code-api-access",

  // Gemini
  "gemini-pro": "gemini-pro-18-months-link",
  "gemini-pro-18-months-link": "gemini-pro-18-months-link",
  "gemini-ai-pro-1-month": "gemini-pro-18-months-link",
  "gemini-ai-pro-3-months": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-6-months": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-12-months": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-18-months": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-12m-mail-a": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-12m-mail-b": "gemini-pro-18-months-link",
  "gemini-ai-pro-5tb-12m": "gemini-pro-18-months-link",
  "gemini-pro-cdk-12-months": "gemini-pro-18-months-link",
  "gemini-pro-5tb-1-year": "gemini-pro-18-months-link",
  "google-one-ai-premium-12-months": "gemini-pro-18-months-link",

  // Cursor
  "cursor-pro": "cursor-pro-12m",
  "cursor-pro-12m": "cursor-pro-12m",
  "cursor-pro-1-month": "cursor-pro-12m",
  "cursor-pro-plus": "cursor-pro-12m",
  "cursor-pro-30-days": "cursor-pro-12m",
  "cursor-ultra": "cursor-pro-12m",

  // Grok
  "grok-super": "grok-super-3-months",
  "super-grok": "grok-super-3-months",
  "supergrok-3-months": "grok-super-3-months",
  "super-grok-1-month": "grok-super-3-months",
  "super-grok-3-months": "grok-super-3-months",
  "super-grok-6-months": "grok-super-3-months",
  "super-grok-9-months": "grok-super-3-months",
  "super-grok-12-months": "grok-super-3-months",
  "grok-super-1-month": "grok-super-3-months",
  "grok-super-3-months": "grok-super-3-months",
  "grok-super-6-months": "grok-super-3-months",
  "grok-super-10-months": "grok-super-10-months",
  "grok-super-12-months": "grok-super-3-months",

  // Canva, Adobe & others
  "canva-pro": "canva-pro-1-year",
  "canva-pro-1-year": "canva-pro-1-year",
  "canva-edu-1-year": "canva-edu-1-year",
  "adobe-cc-2-months": "adobe-cc-2-months",
  "office365-100gb-lifetime": "office365-100gb-lifetime",
  "office365-1tb-lifetime": "office365-1tb-lifetime",
  "notion-business-3-months": "notion-business-12m",
  "notion-business-12m": "notion-business-12m",
  "coursera-plus-1-month": "coursera-premium-1-year",
  "coursera-plus-12-months": "coursera-premium-1-year",
  "coursera-premium-1-year": "coursera-premium-1-year",
  "figma-edu-2-years": "figma-edu-2-years",
  "grammarly-pro-1-year": "grammarly-pro-1-year",
  "youtube-premium-1-year": "youtube-premium-1-year",
};

const BRAND_DEFAULT_COVERS: Record<string, string> = {
  chatgpt: "/media/products/chatgpt-plus-1-month-fw/chatgpt-plus-1-month-fw-thumbnail.webp",
  openai: "/media/products/chatgpt-plus-1-month-fw/chatgpt-plus-1-month-fw-thumbnail.webp",
  capcut: "/media/products/capcut-pro/capcut-pro-thumbnail.webp",
  gemini: "/media/products/gemini-pro-18-months-link/gemini-pro-18-months-link-thumbnail.webp",
  google: "/media/products/gemini-pro-18-months-link/gemini-pro-18-months-link-thumbnail.webp",
  claude: "/media/products/claude-pro-1-month/claude-pro-1-month-thumbnail.webp",
  anthropic: "/media/products/claude-pro-1-month/claude-pro-1-month-thumbnail.webp",
  elevenlabs: "/media/products/elevenlabs-creator-shared/elevenlabs-creator-shared-thumbnail.webp",
  cursor: "/media/products/cursor-pro-12m/cursor-pro-12m-thumbnail.webp",
  canva: "/media/products/canva-pro-1-year/canva-pro-1-year-thumbnail.webp",
  grok: "/media/products/grok-super-3-months/grok-super-3-months-thumbnail.webp",
  adobe: "/media/products/adobe-cc-2-months/adobe-cc-2-months-thumbnail.webp",
  notion: "/media/products/notion-business-12m/notion-business-12m-thumbnail.webp",
  coursera: "/media/products/coursera-premium-1-year/coursera-premium-1-year-thumbnail.webp",
  figma: "/media/products/figma-edu-2-years/figma-edu-2-years-thumbnail.webp",
  grammarly: "/media/products/grammarly-pro-1-year/grammarly-pro-1-year-thumbnail.webp",
  nordvpn: "/media/products/fallback-product.webp",
  youtube: "/media/products/youtube-premium-1-year/youtube-premium-1-year-thumbnail.webp",
  microsoft: "/media/products/office365-1tb-lifetime/office365-1tb-lifetime-thumbnail.webp",
  office365: "/media/products/office365-1tb-lifetime/office365-1tb-lifetime-thumbnail.webp",
  kling: "/media/products/kling-ultra-26k-credits/kling-ultra-26k-credits-thumbnail.webp",
  gamma: "/media/products/gamma-pro-1-year/gamma-pro-1-year-thumbnail.webp",
  lovable: "/media/products/lovable-pro-12m/lovable-pro-12m-thumbnail.webp",
  manus: "/media/products/manus-ai-pro-12m/manus-ai-pro-12m-thumbnail.webp",
  runway: "/media/products/runway-pro-12m/runway-pro-12m-thumbnail.webp",
  framer: "/media/products/framer-pro-12m/framer-pro-12m-thumbnail.webp",
  railway: "/media/products/railway-hobby-12m/railway-hobby-12m-thumbnail.webp",
  supabase: "/media/products/supabase-pro-1-year/supabase-pro-1-year-thumbnail.webp",
  warp: "/media/products/warp-build-1-year/warp-build-1-year-thumbnail.webp",
  n8n: "/media/products/n8n-starter-1-year/n8n-starter-1-year-thumbnail.webp",
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

  // 2. Exact slug manifest thumbnail
  const exactManifest = manifestBySlug.get(slug);
  if (exactManifest?.thumbnailPath || (exactManifest?.publicPath && exactManifest.publicPath.startsWith("/media/products/"))) {
    return exactManifest.thumbnailPath ?? exactManifest.publicPath!;
  }

  // 3. Canonical family alias
  const canonicalSlug = CANONICAL_FAMILY_MAP[slug];
  if (canonicalSlug) {
    const aliasManifest = manifestBySlug.get(canonicalSlug);
    if (aliasManifest?.thumbnailPath || (aliasManifest?.publicPath && aliasManifest.publicPath.startsWith("/media/products/"))) {
      return aliasManifest.thumbnailPath ?? aliasManifest.publicPath!;
    }
    return `/media/products/${canonicalSlug}/${canonicalSlug}-thumbnail.webp`;
  }

  // 4. Product family key match (e.g. "chatgpt-plus-3-months" -> "chatgpt-plus")
  const familyKey = productFamilyKey(slug);
  const familyCanonical = CANONICAL_FAMILY_MAP[familyKey];
  if (familyCanonical) {
    const aliasManifest = manifestBySlug.get(familyCanonical);
    if (aliasManifest?.thumbnailPath || (aliasManifest?.publicPath && aliasManifest.publicPath.startsWith("/media/products/"))) {
      return aliasManifest.thumbnailPath ?? aliasManifest.publicPath!;
    }
    return `/media/products/${familyCanonical}/${familyCanonical}-thumbnail.webp`;
  }

  const familyManifest = manifestBySlug.get(familyKey);
  if (familyManifest?.thumbnailPath || (familyManifest?.publicPath && familyManifest.publicPath.startsWith("/media/products/"))) {
    return familyManifest.thumbnailPath ?? familyManifest.publicPath!;
  }

  // 5. Search manifest list for any item matching the familyKey
  for (const item of manifestList) {
    if (productFamilyKey(item.slug) === familyKey) {
      if (item.thumbnailPath || (item.publicPath && item.publicPath.startsWith("/media/products/"))) {
        return item.thumbnailPath ?? item.publicPath!;
      }
    }
  }

  // 6. Brand-level default cover
  const lowerSlug = slug.toLowerCase();
  for (const [brand, cover] of Object.entries(BRAND_DEFAULT_COVERS)) {
    if (lowerSlug.includes(brand) || familyKey.includes(brand)) {
      return cover;
    }
  }

  // 7. Normalized legacy cover if not broken
  const normCover = normalizePublicUrl(inputCover);
  if (normCover && !normCover.includes("trihex-generated/")) {
    return normCover;
  }

  // 8. Generic V2 fallback image
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
    const aliasManifest = manifestBySlug.get(canonicalSlug);
    if (aliasManifest?.infographicPath) {
      return aliasManifest.infographicPath;
    }
    return `/media/products/${canonicalSlug}/${canonicalSlug}-infographic.webp`;
  }

  const familyKey = productFamilyKey(slug);
  const familyCanonical = CANONICAL_FAMILY_MAP[familyKey];
  if (familyCanonical) {
    const aliasManifest = manifestBySlug.get(familyCanonical);
    if (aliasManifest?.infographicPath) {
      return aliasManifest.infographicPath;
    }
    return `/media/products/${familyCanonical}/${familyCanonical}-infographic.webp`;
  }

  const familyManifest = manifestBySlug.get(familyKey);
  if (familyManifest?.infographicPath) {
    return familyManifest.infographicPath;
  }

  for (const item of manifestList) {
    if (productFamilyKey(item.slug) === familyKey && item.infographicPath) {
      return item.infographicPath;
    }
  }

  // Brand-level fallback for infographics
  const lowerSlug = slug.toLowerCase();
  for (const [brand, cover] of Object.entries(BRAND_DEFAULT_COVERS)) {
    if (lowerSlug.includes(brand) || familyKey.includes(brand)) {
      return cover;
    }
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
