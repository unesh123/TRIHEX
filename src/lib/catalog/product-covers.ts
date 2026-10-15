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
  "claude-pro-12-months": "claude-pro-1-month",
};

/**
 * Pristine 1200x900 / 1200x1200 artwork posters imported from the verified Trihex complete kit
 */
const TRIHEX_PRISTINE_POSTERS: Record<string, string> = {
  "ai-money-maker-digital-products-course": "/trihex/products/ai-money-maker-digital-products-course.webp",
  "ai-prompt-starter-pack": "/trihex/products/ai-prompt-starter-pack.webp",
  "canva-pro": "/trihex/products/canva-pro.webp",
  "canva-pro-slot-1-year": "/trihex/products/canva-pro.webp",
  "capcut-pro": "/trihex/products/capcut-pro.webp",
  "chatgpt-plus": "/trihex/products/chatgpt-plus.webp",
  "chatgpt-plus-1-month-fw": "/trihex/products/chatgpt-plus.webp",
  "chatgpt-plus-1-month-gmail-w15d": "/trihex/products/chatgpt-plus.webp",
  "claude-code-api-access": "/trihex/products/claude-code-api-access.webp",
  "claude-code-api": "/trihex/products/claude-code-api-access.webp",
  "claude-pro": "/trihex/products/claude-pro.webp",
  "claude-pro-1-month": "/trihex/products/claude-pro.webp",
  "claude-pro-12-months": "/trihex/products/claude-pro.webp",
  "coursera-plus": "/trihex/products/coursera-plus.webp",
  "coursera-premium-1-year": "/trihex/products/coursera-plus.webp",
  "cursor-pro": "/trihex/products/cursor-pro.webp",
  "cursor-pro-1-month": "/trihex/products/cursor-pro.webp",
  "elevenlabs-creator": "/trihex/products/elevenlabs-creator.webp",
  "elevenlabs-creator-1-month": "/trihex/products/elevenlabs-creator.webp",
  "factory-droid-ai": "/trihex/products/factory-droid-ai.webp",
  "framer-pro": "/trihex/products/framer-pro.webp",
  "gamma-app-pro": "/trihex/products/gamma-app-pro.webp",
  "gemini-5-tb-ai-pro": "/trihex/products/gemini-5-tb-ai-pro.webp",
  "gemini-pro-5-tb": "/trihex/products/gemini-pro-5-tb.webp",
  "gemini-pro-5tb-1-year": "/trihex/products/gemini-pro-5-tb.webp",
  "gemini-pro-18-months-link": "/trihex/products/gemini-pro-5-tb.webp",
  "gemini-pro-4-month-link": "/trihex/products/gemini-pro-5-tb.webp",
  "grammarly-pro": "/trihex/products/grammarly-pro.webp",
  "granola-business": "/trihex/products/granola-business.webp",
  "gumloop-pro": "/trihex/products/gumloop-pro.webp",
  "higgsfield-pro": "/trihex/products/higgsfield-pro.webp",
  "lovable-ai-pro": "/trihex/products/lovable-ai-pro.webp",
  "manus-ai-pro": "/trihex/products/manus-ai-pro.webp",
  "mobbin-pro-10x-seat": "/trihex/products/mobbin-pro-10x-seat.webp",
  "n8n-starter": "/trihex/products/n8n-starter.webp",
  "notion-business": "/trihex/products/notion-business.webp",
  "passive-rebel-antisocial-leads": "/trihex/products/passive-rebel-antisocial-leads.webp",
  "psychology-of-closing-bundle": "/trihex/products/psychology-of-closing-bundle.webp",
  "railway-hobby": "/trihex/products/railway-hobby.webp",
  "runway-pro": "/trihex/products/runway-pro.webp",
  "small-business-ai-setup": "/trihex/products/small-business-ai-setup.webp",
  "supabase-pro": "/trihex/products/supabase-pro.webp",
  "super-grok": "/trihex/products/super-grok.webp",
  "super-grok-1-month": "/trihex/products/super-grok.webp",
  "super-grok-3-months": "/trihex/products/super-grok.webp",
  "super-grok-6-months": "/trihex/products/super-grok.webp",
  "super-grok-9-months": "/trihex/products/super-grok.webp",
  "super-grok-12-months": "/trihex/products/super-grok.webp",
  "supergrok-12-months": "/trihex/products/super-grok.webp",
  "supergrok-3-months": "/trihex/products/super-grok.webp",
  "udemy-16-package-ai-agent-pack": "/trihex/products/udemy-16-package-ai-agent-pack.webp",
  "veo-3-ultra": "/trihex/products/veo-3-ultra.webp",
  "warp-build": "/trihex/products/warp-build.webp",
  "workflow-automation-discovery": "/trihex/products/workflow-automation-discovery.webp",
};

const bySlug = new Map(
  (coverManifest as ProductCoverEntry[]).map((e) => [e.slug, e]),
);

export function getProductCover(slug: string): ProductCoverEntry | null {
  const targetSlug = CANONICAL_FAMILY_MAP[slug] ?? slug;

  // 1. Check pristine verified Trihex product poster
  const pristinePath = TRIHEX_PRISTINE_POSTERS[slug] ?? TRIHEX_PRISTINE_POSTERS[targetSlug];
  if (pristinePath) {
    const raw = bySlug.get(targetSlug) ?? bySlug.get(slug);
    return {
      slug,
      family: raw?.family ?? slug.split("-")[0],
      canonical: pristinePath.split("/").pop() ?? `${slug}.webp`,
      publicPath: pristinePath,
      mode: "ARTWORK_ONLY",
      alt: raw?.alt ?? `${slug} official artwork`,
      artWidth: 1200,
      artHeight: 900,
      lowResReplacementRecommended: false,
    };
  }

  // 2. Fall back to manifest mapping
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
