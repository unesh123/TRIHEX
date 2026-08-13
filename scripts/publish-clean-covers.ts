/**
 * Remap ALL storefront covers from curated TRIHEX_PRODUCT_IMAGES.
 *
 * CRITICAL: Some files in 02_abstract_artwork are misnamed posters:
 *   - video-ai-abstract.png          → actually SuperGrok 3-Month poster (Rs.3499)
 *   - video-abstract-portrait.png    → actually Grok Super 1-Year poster (Rs.13999)
 * Never use those for CapCut/VEO. Use true abstracts (no baked text) instead.
 *
 * Usage: npx tsx scripts/publish-clean-covers.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "media", "covers");
const MANIFEST = path.join(
  ROOT,
  "src",
  "lib",
  "catalog",
  "product-cover-manifest.json",
);
const BASE = path.join(
  ROOT,
  "TRIHEX_PRODUCT_IMAGES",
  "TRIHEX_PRODUCT_IMAGES",
);

type Kind = "ABSTRACT" | "POSTER";

type Entry = {
  slug: string;
  family: string;
  canonical: string;
  /** Relative to BASE */
  source: string;
  alt: string;
  kind: Kind;
};

/**
 * Visual-content mapping (verified by opening files).
 * Prefer true abstracts (no price text). Posters always crop artwork-only.
 */
const ENTRIES: Entry[] = [
  // TRIHEX owned
  {
    slug: "ai-prompt-starter-pack",
    family: "trihex",
    canonical: "trihex-prompt-pack.webp",
    source: "01_single_product_covers/trihex-ai-prompt-starter-pack.png",
    alt: "TRIHEX AI prompt starter pack cover artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "small-business-ai-setup-consultation",
    family: "trihex",
    canonical: "trihex-ai-setup.webp",
    source: "01_single_product_covers/trihex-small-business-ai-setup.png",
    alt: "TRIHEX small-business AI setup consultation cover artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "custom-workflow-automation-discovery",
    family: "trihex",
    canonical: "trihex-automation.webp",
    source: "01_single_product_covers/trihex-workflow-automation-discovery.png",
    alt: "TRIHEX workflow automation discovery cover artwork.",
    kind: "ABSTRACT",
  },
  // Cursor — true abstract (fixes broken sheet crops)
  {
    slug: "cursor-pro-plus",
    family: "cursor",
    canonical: "cursor-pro-plus.webp",
    source: "02_abstract_artwork/cursor-code-abstract.png",
    alt: "Cursor Pro Plus developer tool abstract artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "cursor-pro-30-days",
    family: "cursor",
    canonical: "cursor-pro-30-days.webp",
    source: "02_abstract_artwork/cursor-code-abstract.png",
    alt: "Cursor Pro thirty-day developer tool abstract artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "cursor-ultra",
    family: "cursor",
    canonical: "cursor-ultra.webp",
    source: "02_abstract_artwork/cursor-code-abstract.png",
    alt: "Cursor Ultra developer tool abstract artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "antigravity-ultra",
    family: "cursor",
    canonical: "antigravity-ultra.webp",
    source: "02_abstract_artwork/automation-hexagon-abstract-2.png",
    alt: "Antigravity Ultra abstract hexagon artwork.",
    kind: "ABSTRACT",
  },
  // VEO — MUST be true video/molecular abstracts (NOT the misnamed Grok posters)
  {
    slug: "veo3-ultra",
    family: "gemini",
    canonical: "veo3-ultra.webp",
    source: "02_abstract_artwork/kling-gold-camera-abstract.png",
    alt: "VEO3 Ultra AI video generation abstract camera artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "veo4-ultra-25k-30-days",
    family: "gemini",
    canonical: "veo4-ultra-25k-30-days.webp",
    source: "02_abstract_artwork/green-molecular-abstract.png",
    alt: "VEO4 Ultra AI video credits abstract molecular artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "veo4-ultra-25k-warranty",
    family: "gemini",
    canonical: "veo4-ultra-25k-warranty.webp",
    source: "02_abstract_artwork/green-molecular-abstract.png",
    alt: "VEO4 Ultra warranty package abstract molecular artwork.",
    kind: "ABSTRACT",
  },
  // Grok — use dedicated posters (artwork crop) OR true orbital abstract
  {
    slug: "grok-super-3-months",
    family: "grok",
    canonical: "grok-super-3-months.webp",
    source: "01_single_product_covers/grok-super-3month-rs3499-poster.png",
    alt: "Grok Super three-month package artwork with orbital AI core.",
    kind: "POSTER",
  },
  {
    slug: "grok-super-1-year-fww",
    family: "grok",
    canonical: "grok-super-1-year.webp",
    source: "01_single_product_covers/grok-super-1year-rs13999-poster.png",
    alt: "Grok Super one-year package artwork with orbital AI core.",
    kind: "POSTER",
  },
  {
    slug: "grok-super-10-months",
    family: "grok",
    canonical: "grok-super-10-months.webp",
    source: "02_abstract_artwork/grok-abstract-orbital.png",
    alt: "Grok Super ten-month package abstract orbital artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "supergrok-12-months",
    family: "grok",
    canonical: "supergrok-12-months.webp",
    source: "02_abstract_artwork/grok-abstract-orbital.png",
    alt: "SuperGrok twelve-month package abstract orbital artwork.",
    kind: "ABSTRACT",
  },
  // Gemini / Google AI
  {
    slug: "gemini-pro-18-months-link",
    family: "gemini",
    canonical: "gemini-pro-18-month-upgrade.webp",
    source: "01_single_product_covers/gemini-pro-18month-rs300-poster.png",
    alt: "Gemini Pro eighteen-month package artwork in blue and violet.",
    kind: "POSTER",
  },
  {
    slug: "gemini-pro-upgrade-link-18-months",
    family: "gemini",
    canonical: "gemini-upgrade-link-18-months.webp",
    source: "01_single_product_covers/google-ai-pro-18month-rs399-poster.png",
    alt: "Google AI Pro five-terabyte eighteen-month package artwork.",
    kind: "POSTER",
  },
  {
    slug: "google-ai-pro-5tb-18-months",
    family: "gemini",
    canonical: "google-ai-pro-5tb-18-months.webp",
    source: "01_single_product_covers/google-ai-pro-18month-rs399-poster.png",
    alt: "Google AI Pro five-terabyte eighteen-month package artwork.",
    kind: "POSTER",
  },
  {
    slug: "gemini-pro-4-month-link",
    family: "gemini",
    canonical: "gemini-pro-4-months.webp",
    source: "01_single_product_covers/gemini-star-portrait-2.png",
    alt: "Gemini Pro four-month package artwork in blue and violet.",
    kind: "ABSTRACT",
  },
  {
    slug: "gemini-pro-cdk-12-months",
    family: "gemini",
    canonical: "gemini-pro-12-month-redeem.webp",
    source: "01_single_product_covers/gemini-star-portrait.png",
    alt: "Gemini Pro twelve-month package artwork in blue and violet.",
    kind: "ABSTRACT",
  },
  {
    slug: "gemini-ai-pro-5tb-12m-mail-a",
    family: "gemini",
    canonical: "gemini-ai-pro-5tb-12-months-a.webp",
    source: "01_single_product_covers/gemini-star-portrait.png",
    alt: "Gemini AI Pro 5 TB package artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "gemini-ai-pro-5tb-12m-mail-b",
    family: "gemini",
    canonical: "gemini-ai-pro-5tb-12-months-b.webp",
    source: "01_single_product_covers/gemini-star-portrait-2.png",
    alt: "Gemini AI Pro 5 TB variant artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "gemini-pro-5tb-1-year",
    family: "gemini",
    canonical: "gemini-pro-5tb-1-year.webp",
    source: "01_single_product_covers/gemini-star-portrait.png",
    alt: "Gemini Pro one-year package artwork.",
    kind: "ABSTRACT",
  },
  // Kling
  {
    slug: "kling-standard-680-750-credits",
    family: "kling",
    canonical: "kling-standard-680-750-credits.webp",
    source: "01_single_product_covers/kling-standard-750-rs1399-poster.png",
    alt: "Kling Standard credit package artwork in black and gold.",
    kind: "POSTER",
  },
  {
    slug: "kling-ultra-26k-credits",
    family: "kling",
    canonical: "kling-ultra-26k-credits.webp",
    source: "01_single_product_covers/kling-ultra-26k-rs13999-poster.png",
    alt: "Kling Ultra high-credit AI video package artwork.",
    kind: "POSTER",
  },
  // CapCut — true camera abstract (no baked text)
  {
    slug: "capcut-pro-7-days",
    family: "capcut",
    canonical: "capcut-pro-7-days.webp",
    source: "02_abstract_artwork/kling-gold-camera-abstract.png",
    alt: "CapCut Pro seven-day video editing abstract artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "capcut-pro-30-days",
    family: "capcut",
    canonical: "capcut-pro-30-days.webp",
    source: "02_abstract_artwork/kling-gold-camera-abstract.png",
    alt: "CapCut Pro thirty-day video editing abstract artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "capcut-pro-6-months",
    family: "capcut",
    canonical: "capcut-pro-6-months.webp",
    source: "02_abstract_artwork/kling-gold-camera-abstract.png",
    alt: "CapCut Pro six-month video editing abstract artwork.",
    kind: "ABSTRACT",
  },
  // Canva / Coursera / Claude / Adobe
  {
    slug: "canva-pro-1-year",
    family: "canva",
    canonical: "canva-pro-1-year.webp",
    source: "02_abstract_artwork/canva-ribbon-abstract.png",
    alt: "Canva Pro one-year abstract ribbon artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "canva-pro-slot-1-year",
    family: "canva",
    canonical: "canva-pro-slot-1-year.webp",
    source: "02_abstract_artwork/canva-ribbon-abstract.png",
    alt: "Canva Pro slot one-year abstract ribbon artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "canva-edu-1-year",
    family: "canva",
    canonical: "canva-edu-1-year.webp",
    source: "02_abstract_artwork/canva-ribbon-abstract.png",
    alt: "Canva EDU one-year abstract ribbon artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "coursera-premium-1-year",
    family: "coursera",
    canonical: "coursera-premium-1-year.webp",
    source: "02_abstract_artwork/coursera-learning-abstract.png",
    alt: "Coursera Premium one-year learning abstract artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "claude-x20-w30d",
    family: "claude",
    canonical: "claude-x20-30-days.webp",
    source: "02_abstract_artwork/claude-abstract-modular.png",
    alt: "Claude package abstract modular artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "claude-x5-personal-30d",
    family: "claude",
    canonical: "claude-x5-30-days.webp",
    source: "02_abstract_artwork/claude-abstract-modular.png",
    alt: "Claude personal package abstract modular artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "adobe-cc-2-months",
    family: "adobe",
    canonical: "adobe-creative-cloud-2-months.webp",
    source: "02_abstract_artwork/business-setup-abstract.png",
    alt: "Adobe Creative Cloud package abstract creative artwork.",
    kind: "ABSTRACT",
  },
  // ChatGPT Plus — no dedicated abstract in zip; use green molecular (distinct from Grok/Cursor)
  {
    slug: "chatgpt-plus-1-month-fw",
    family: "chatgpt",
    canonical: "chatgpt-plus-1-month-full-warranty.webp",
    source: "02_abstract_artwork/green-molecular-abstract.png",
    alt: "ChatGPT Plus one-month package abstract artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "chatgpt-plus-1-month-gmail-w15d",
    family: "chatgpt",
    canonical: "chatgpt-plus-1-month-limited-a.webp",
    source: "02_abstract_artwork/green-molecular-abstract.png",
    alt: "ChatGPT Plus one-month package abstract artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "gpt-plus-apple-pay-gmail-w3d",
    family: "chatgpt",
    canonical: "chatgpt-plus-1-month-limited-b.webp",
    source: "02_abstract_artwork/green-molecular-abstract.png",
    alt: "ChatGPT Plus limited package abstract artwork.",
    kind: "ABSTRACT",
  },
];

/** True abstracts: cover-fit square. Posters: artwork-only extract then contain. */
async function fromAbstract(src: string): Promise<Buffer> {
  return sharp(src)
    .resize(1200, 1200, { fit: "cover", position: "attention" })
    .toColorspace("srgb")
    .webp({ quality: 90 })
    .withMetadata({})
    .toBuffer();
}

async function fromPoster(src: string): Promise<Buffer> {
  const meta = await sharp(src).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  const isTall = h / w > 1.15;
  const left = Math.round(w * (isTall ? 0.08 : 0.12));
  const top = Math.round(h * (isTall ? 0.22 : 0.16));
  const width = Math.round(w * (isTall ? 0.84 : 0.76));
  const height = Math.round(h * (isTall ? 0.42 : 0.55));

  return sharp(src)
    .extract({
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: Math.min(width, w - left),
      height: Math.min(height, h - top),
    })
    .resize(1200, 1200, {
      fit: "contain",
      background: { r: 247, g: 248, b: 252, alpha: 1 },
    })
    .toColorspace("srgb")
    .webp({ quality: 90 })
    .withMetadata({})
    .toBuffer();
}

async function main() {
  const bySlug = new Map<string, Record<string, unknown>>();

  for (const entry of ENTRIES) {
    if (entry.source.includes("03_contact")) {
      console.log("SKIP_CONTACT", entry.slug);
      continue;
    }
    const src = path.join(BASE, entry.source);
    if (!fs.existsSync(src)) {
      console.log("MISSING", entry.slug, entry.source);
      continue;
    }
    const meta = await sharp(src).metadata();
    const familyDir = path.join(OUT, entry.family);
    fs.mkdirSync(familyDir, { recursive: true });
    const dest = path.join(familyDir, entry.canonical);
    const buf =
      entry.kind === "ABSTRACT"
        ? await fromAbstract(src)
        : await fromPoster(src);
    fs.writeFileSync(dest, buf);

    const publicPath = `/media/covers/${entry.family}/${entry.canonical}`;
    bySlug.set(entry.slug, {
      slug: entry.slug,
      family: entry.family,
      canonical: entry.canonical,
      publicPath,
      mode: "ARTWORK_ONLY",
      sourceFile: entry.source,
      alt: entry.alt,
      resolutionNote:
        entry.kind === "ABSTRACT" ? "HIGH_RES_ABSTRACT" : "HIGH_RES_POSTER_CROP",
      artWidth: 1200,
      artHeight: 1200,
      sourceWidth: meta.width ?? 0,
      sourceHeight: meta.height ?? 0,
      lowResReplacementRecommended: false,
    });
    console.log("OK", entry.slug, "<-", entry.source, entry.kind);
  }

  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n",
  );
  console.log("MANIFEST", bySlug.size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
