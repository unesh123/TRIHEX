/**
 * FIX broken covers — never use designer-master-art-*.webp (those are ~20KB blanks).
 * Rebuild ALL live covers from TRIHEX_PRODUCT_IMAGES HQ PNGs (1–2MB sources).
 *
 * Usage: npx tsx scripts/fix-hq-covers.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const BASE = path.join(ROOT, "TRIHEX_PRODUCT_IMAGES", "TRIHEX_PRODUCT_IMAGES");
const OUT = path.join(ROOT, "public", "media", "covers");
const MANIFEST = path.join(
  ROOT,
  "src",
  "lib",
  "catalog",
  "product-cover-manifest.json",
);

type Kind = "ABSTRACT" | "POSTER";

type Entry = {
  slug: string;
  family: string;
  canonical: string;
  source: string;
  alt: string;
  kind: Kind;
  /** Optional color grade for uniqueness when sharing a base abstract */
  modulate?: { brightness?: number; saturation?: number; hue?: number };
  position?: "centre" | "north" | "south" | "east" | "west" | "attention";
};

const ENTRIES: Entry[] = [
  // TRIHEX owned — HQ posters
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
  // Gemini
  {
    slug: "gemini-pro-18-months-link",
    family: "gemini",
    canonical: "gemini-pro-18-month-upgrade.webp",
    source: "01_single_product_covers/google-ai-pro-18month-rs399-poster.png",
    alt: "Gemini Pro eighteen-month package artwork.",
    kind: "POSTER",
  },
  {
    slug: "gemini-pro-cdk-12-months",
    family: "gemini",
    canonical: "gemini-pro-12-month-redeem.webp",
    source: "01_single_product_covers/gemini-star-portrait.png",
    alt: "Gemini Pro CDK twelve-month artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "gemini-ai-pro-5tb-12m-mail-a",
    family: "gemini",
    canonical: "gemini-ai-pro-5tb-12-months-a.webp",
    source: "01_single_product_covers/gemini-star-portrait-2.png",
    alt: "Gemini AI Pro 5TB twelve-month artwork.",
    kind: "ABSTRACT",
  },
  // ChatGPT
  {
    slug: "chatgpt-plus-1-month-fw",
    family: "chatgpt",
    canonical: "chatgpt-plus-1-month-full-warranty.webp",
    source: "02_abstract_artwork/green-molecular-abstract.png",
    alt: "ChatGPT Plus one-month abstract artwork.",
    kind: "ABSTRACT",
    position: "attention",
  },
  // CapCut — unique HQ video abstracts (NOT blank designer crops)
  {
    slug: "capcut-pro-7-days",
    family: "capcut",
    canonical: "capcut-pro-7-days.webp",
    // NEVER use video-ai-abstract.png — that file is a misnamed Grok poster
    source: "02_abstract_artwork/kling-gold-camera-abstract.png",
    alt: "CapCut Pro seven-day video editing abstract artwork.",
    kind: "ABSTRACT",
    position: "north",
  },
  {
    slug: "capcut-pro-30-days",
    family: "capcut",
    canonical: "capcut-pro-30-days.webp",
    source: "02_abstract_artwork/kling-gold-camera-abstract.png",
    alt: "CapCut Pro thirty-day video editing abstract artwork.",
    kind: "ABSTRACT",
    position: "centre",
    modulate: { hue: 30, saturation: 1.1 },
  },
  {
    slug: "capcut-pro-6-months",
    family: "capcut",
    canonical: "capcut-pro-6-months.webp",
    source: "02_abstract_artwork/kling-gold-camera-abstract.png",
    alt: "CapCut Pro six-month video editing abstract artwork.",
    kind: "ABSTRACT",
    position: "south",
    modulate: { hue: -20, saturation: 1.15 },
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
    slug: "canva-edu-1-year",
    family: "canva",
    canonical: "canva-edu-1-year.webp",
    source: "02_abstract_artwork/canva-ribbon-abstract.png",
    alt: "Canva Edu one-year abstract ribbon artwork.",
    kind: "ABSTRACT",
    position: "east",
    modulate: { hue: 40, saturation: 1.05 },
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
    slug: "claude-pro-1-month",
    family: "claude",
    canonical: "claude-pro-1-month.webp",
    source: "02_abstract_artwork/claude-abstract-modular.png",
    alt: "Claude Pro abstract modular artwork.",
    kind: "ABSTRACT",
  },
  {
    slug: "adobe-creative-cloud-2-months",
    family: "adobe",
    canonical: "adobe-creative-cloud-2-months.webp",
    source: "02_abstract_artwork/business-setup-abstract.png",
    alt: "Adobe Creative Cloud abstract creative artwork.",
    kind: "ABSTRACT",
    modulate: { hue: -30, saturation: 1.2 },
  },
  // Kling / Grok / Cursor
  {
    slug: "kling-standard-680-750-credits",
    family: "kling",
    canonical: "kling-standard-680-750-credits.webp",
    source: "01_single_product_covers/kling-standard-750-rs1399-poster.png",
    alt: "Kling Standard credit package artwork.",
    kind: "POSTER",
  },
  {
    slug: "kling-ultra-26k-credits",
    family: "kling",
    canonical: "kling-ultra-26k-credits.webp",
    source: "01_single_product_covers/kling-ultra-26k-rs13999-poster.png",
    alt: "Kling Ultra credit package artwork.",
    kind: "POSTER",
  },
  {
    slug: "grok-super-3-months",
    family: "grok",
    canonical: "grok-super-3-months.webp",
    source: "01_single_product_covers/grok-super-3month-rs3499-poster.png",
    alt: "Grok Super three-month package artwork.",
    kind: "POSTER",
  },
  {
    slug: "cursor-pro-1-month",
    family: "cursor",
    canonical: "cursor-pro-1-month.webp",
    source: "02_abstract_artwork/cursor-code-abstract.png",
    alt: "Cursor Pro developer abstract artwork.",
    kind: "ABSTRACT",
  },
  // Brands without dedicated art — HQ tinted bases (still real photos, not blank SVG)
  {
    slug: "office365-100gb-lifetime",
    family: "microsoft",
    canonical: "office365-100gb-lifetime.webp",
    source: "02_abstract_artwork/business-setup-abstract.png",
    alt: "Microsoft Office 365 100GB OneDrive abstract cover.",
    kind: "ABSTRACT",
    position: "west",
    modulate: { hue: 200, brightness: 1.05, saturation: 0.9 },
  },
  {
    slug: "office365-1tb-lifetime",
    family: "microsoft",
    canonical: "office365-1tb-lifetime.webp",
    source: "02_abstract_artwork/business-setup-abstract.png",
    alt: "Microsoft Office 365 1TB OneDrive abstract cover.",
    kind: "ABSTRACT",
    position: "east",
    modulate: { hue: 220, brightness: 0.95, saturation: 1.1 },
  },
  {
    slug: "microsoft-365-family-10-months",
    family: "microsoft",
    canonical: "microsoft-365-family-10-months.webp",
    source: "02_abstract_artwork/business-setup-abstract.png",
    alt: "Microsoft 365 Family abstract cover.",
    kind: "ABSTRACT",
    position: "north",
    modulate: { hue: 260, saturation: 1.15 },
  },
  {
    slug: "grammarly-pro-1-year",
    family: "grammarly",
    canonical: "grammarly-pro-1-year.webp",
    source: "02_abstract_artwork/coursera-learning-abstract.png",
    alt: "Grammarly Pro writing abstract cover.",
    kind: "ABSTRACT",
    position: "south",
    modulate: { hue: 140, saturation: 1.2, brightness: 1.05 },
  },
  {
    slug: "youtube-premium-1-year",
    family: "youtube",
    canonical: "youtube-premium-1-year.webp",
    source: "02_abstract_artwork/kling-gold-camera-abstract.png",
    alt: "YouTube Premium abstract cover.",
    kind: "ABSTRACT",
    position: "attention",
    modulate: { hue: -40, saturation: 1.35, brightness: 0.92 },
  },
  {
    slug: "figma-edu-2-years",
    family: "figma",
    canonical: "figma-edu-2-years.webp",
    source: "02_abstract_artwork/canva-ribbon-abstract.png",
    alt: "Figma Edu abstract design cover.",
    kind: "ABSTRACT",
    position: "west",
    modulate: { hue: 300, saturation: 1.25 },
  },
  {
    slug: "elevenlabs-1-month",
    family: "elevenlabs",
    canonical: "elevenlabs-1-month.webp",
    source: "02_abstract_artwork/automation-hexagon-abstract.png",
    alt: "ElevenLabs voice AI abstract cover.",
    kind: "ABSTRACT",
    position: "centre",
    modulate: { hue: 250, brightness: 0.85, saturation: 1.1 },
  },
  {
    slug: "notion-business-3-months",
    family: "notion",
    canonical: "notion-business-3-months.webp",
    source: "02_abstract_artwork/automation-hexagon-abstract-2.png",
    alt: "Notion Business abstract cover.",
    kind: "ABSTRACT",
    position: "centre",
    modulate: { saturation: 0.35, brightness: 1.08 },
  },
];

async function render(entry: Entry, src: string): Promise<Buffer> {
  let pipeline = sharp(src);
  if (entry.kind === "POSTER") {
    const meta = await sharp(src).metadata();
    const w = meta.width ?? 1024;
    const h = meta.height ?? 1024;
    const isTall = h / w > 1.15;
    const left = Math.round(w * (isTall ? 0.08 : 0.12));
    const top = Math.round(h * (isTall ? 0.22 : 0.16));
    const width = Math.round(w * (isTall ? 0.84 : 0.76));
    const height = Math.round(h * (isTall ? 0.42 : 0.55));
    pipeline = sharp(src).extract({
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: Math.min(width, w - left),
      height: Math.min(height, h - top),
    });
  }

  let img = pipeline.resize(1200, 1200, {
    fit: entry.kind === "POSTER" ? "contain" : "cover",
    position: entry.position ?? "attention",
    background: { r: 247, g: 248, b: 252, alpha: 1 },
  });

  if (entry.modulate) {
    img = img.modulate(entry.modulate);
  }

  // Soft unique badge for Office storage tiers only (readable, not a price)
  if (entry.slug.includes("office365")) {
    const label = entry.slug.includes("1tb") ? "1TB" : "100GB";
    const badge = Buffer.from(`<?xml version="1.0"?>
<svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="40" width="220" height="72" rx="36" fill="rgba(15,23,42,0.72)"/>
  <text x="150" y="88" text-anchor="middle" font-family="Arial,sans-serif"
    font-size="36" font-weight="700" fill="#fff">${label}</text>
</svg>`);
    return img
      .composite([{ input: await sharp(badge).png().toBuffer(), top: 0, left: 0 }])
      .toColorspace("srgb")
      .webp({ quality: 90 })
      .toBuffer();
  }

  return img.toColorspace("srgb").webp({ quality: 90 }).toBuffer();
}

async function main() {
  const bySlug = new Map<string, Record<string, unknown>>();
  if (fs.existsSync(MANIFEST)) {
    for (const e of JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Array<
      Record<string, unknown>
    >) {
      bySlug.set(String(e.slug), e);
    }
  }

  for (const entry of ENTRIES) {
    const src = path.join(BASE, entry.source);
    if (!fs.existsSync(src)) {
      console.error("MISSING_SOURCE", entry.slug, entry.source);
      continue;
    }
    const dir = path.join(OUT, entry.family);
    fs.mkdirSync(dir, { recursive: true });
    const dest = path.join(dir, entry.canonical);
    const buf = await render(entry, src);
    fs.writeFileSync(dest, buf);
    const kb = Math.round(buf.length / 1024);
    if (kb < 40) {
      console.warn("STILL_SMALL", entry.slug, `${kb}KB`);
    } else {
      console.log("HQ", entry.slug, `${kb}KB`, "←", entry.source);
    }
    bySlug.set(entry.slug, {
      slug: entry.slug,
      family: entry.family,
      canonical: entry.canonical,
      publicPath: `/media/covers/${entry.family}/${entry.canonical}`,
      mode: "ARTWORK_ONLY",
      sourceFile: entry.source,
      alt: entry.alt,
      resolutionNote: "HQ_ZIP_SOURCE",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: Boolean(entry.modulate),
    });
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
