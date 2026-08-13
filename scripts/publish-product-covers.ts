/**
 * Publish MODE B artwork covers from highest-resolution mapped full-card crops.
 * Usage: npx tsx scripts/publish-product-covers.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const FULL = path.join(ROOT, "assets", "product-media", "full-cards");
const OUT = path.join(ROOT, "public", "media", "covers");

type Entry = {
  slug: string;
  family: string;
  canonical: string;
  sourceFile: string | null;
  mode: "ARTWORK_ONLY" | "SVG_FALLBACK";
  alt: string;
  resolutionNote: "HIGH_RES_SHEET" | "LOW_RES_DESIGNER" | "MISSING";
};

/** Visual-content mapping — prefer larger marketing sheets over Designer. */
const ENTRIES: Entry[] = [
  {
    slug: "gemini-pro-5tb-1-year",
    family: "gemini",
    canonical: "gemini-pro-5tb-1-year.webp",
    sourceFile: "sheet-first-10-card-01.png",
    mode: "ARTWORK_ONLY",
    alt: "Gemini Pro one-year package artwork in blue and violet on a white card.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "gemini-pro-18-months-link",
    family: "gemini",
    canonical: "gemini-pro-18-month-upgrade.webp",
    sourceFile: "designer-master-card-02.png",
    mode: "ARTWORK_ONLY",
    alt: "Gemini Pro eighteen-month package artwork in blue and violet.",
    resolutionNote: "LOW_RES_DESIGNER",
  },
  {
    slug: "gemini-pro-4-month-link",
    family: "gemini",
    canonical: "gemini-pro-4-months.webp",
    sourceFile: "designer-master-card-03.png",
    mode: "ARTWORK_ONLY",
    alt: "Gemini Pro four-month package artwork in blue and violet.",
    resolutionNote: "LOW_RES_DESIGNER",
  },
  {
    slug: "gemini-pro-upgrade-link-18-months",
    family: "gemini",
    canonical: "gemini-upgrade-link-18-months.webp",
    sourceFile: "sheet-first-10-card-02.png",
    mode: "ARTWORK_ONLY",
    alt: "Gemini Pro eighteen-month upgrade package artwork in blue and violet.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "gemini-pro-cdk-12-months",
    family: "gemini",
    canonical: "gemini-pro-12-month-redeem.webp",
    sourceFile: "sheet-second-5-card-01.png",
    mode: "ARTWORK_ONLY",
    alt: "Gemini Pro twelve-month redeem-code package artwork in blue and violet.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "gemini-ai-pro-5tb-12m-mail-a",
    family: "gemini",
    canonical: "gemini-ai-pro-5tb-12-months-a.webp",
    sourceFile: "sheet-second-5-card-02.png",
    mode: "ARTWORK_ONLY",
    alt: "Gemini AI Pro 5 TB twelve-month variant A artwork in blue and violet.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "gemini-ai-pro-5tb-12m-mail-b",
    family: "gemini",
    canonical: "gemini-ai-pro-5tb-12-months-b.webp",
    sourceFile: "sheet-second-5-card-03.png",
    mode: "ARTWORK_ONLY",
    alt: "Gemini AI Pro 5 TB twelve-month variant B artwork in blue and violet.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "chatgpt-go-3-months",
    family: "chatgpt",
    canonical: "chatgpt-go-3-months.webp",
    sourceFile: "designer-master-card-08.png",
    mode: "ARTWORK_ONLY",
    alt: "ChatGPT Go three-month package artwork in emerald and white.",
    resolutionNote: "LOW_RES_DESIGNER",
  },
  {
    slug: "chatgpt-plus-1-month-fw",
    family: "chatgpt",
    canonical: "chatgpt-plus-1-month-full-warranty.webp",
    sourceFile: "sheet-first-10-card-03.png",
    mode: "ARTWORK_ONLY",
    alt: "ChatGPT Plus one-month package artwork in emerald and white.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "chatgpt-plus-1-month-gmail-w15d",
    family: "chatgpt",
    canonical: "chatgpt-plus-1-month-limited-a.webp",
    sourceFile: "sheet-fifth-15-card-12.png",
    mode: "ARTWORK_ONLY",
    alt: "ChatGPT Plus one-month limited-warranty package artwork.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "gpt-plus-apple-pay-gmail-w3d",
    family: "chatgpt",
    canonical: "chatgpt-plus-1-month-limited-b.webp",
    sourceFile: "sheet-fifth-15-card-14.png",
    mode: "ARTWORK_ONLY",
    alt: "ChatGPT Plus one-month Apple Pay package artwork in emerald and white.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "supergrok-12-months",
    family: "grok",
    canonical: "supergrok-12-months.webp",
    sourceFile: "sheet-fifth-15-card-15.png",
    mode: "ARTWORK_ONLY",
    alt: "SuperGrok twelve-month package artwork with a black orbital AI core.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "grok-super-1-year-fww",
    family: "grok",
    canonical: "grok-super-1-year.webp",
    sourceFile: "sheet-first-10-card-04.png",
    mode: "ARTWORK_ONLY",
    alt: "Grok Super one-year package artwork with a black orbital AI core.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "grok-super-3-months",
    family: "grok",
    canonical: "grok-super-3-months.webp",
    sourceFile: "sheet-second-5-card-04.png",
    mode: "ARTWORK_ONLY",
    alt: "Grok Super three-month package artwork with a black orbital AI core.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "claude-x20-w30d",
    family: "claude",
    canonical: "claude-x20-30-days.webp",
    sourceFile: "sheet-first-10-card-05.png",
    mode: "ARTWORK_ONLY",
    alt: "Claude thirty-day x20 package artwork in orange and cream.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "claude-x5-personal-30d",
    family: "claude",
    canonical: "claude-x5-30-days.webp",
    sourceFile: "sheet-fourth-5-card-02.png",
    mode: "ARTWORK_ONLY",
    alt: "Claude thirty-day x5 package artwork in orange and cream.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "adobe-cc-2-months",
    family: "adobe",
    canonical: "adobe-creative-cloud-2-months.webp",
    sourceFile: "sheet-first-10-card-06.png",
    mode: "ARTWORK_ONLY",
    alt: "Adobe Creative Cloud two-month package artwork with colorful creative elements.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "canva-pro-slot-1-year",
    family: "canva",
    canonical: "canva-pro-slot-1-year.webp",
    sourceFile: "sheet-first-10-card-07.png",
    mode: "ARTWORK_ONLY",
    alt: "Canva Pro slot one-year package artwork in cyan and violet.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "canva-pro-1-year",
    family: "canva",
    canonical: "canva-pro-1-year.webp",
    sourceFile: "sheet-fourth-5-card-04.png",
    mode: "ARTWORK_ONLY",
    alt: "Canva Pro one-year package artwork in cyan and violet.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "canva-edu-1-year",
    family: "canva",
    canonical: "canva-edu-1-year.webp",
    sourceFile: "designer-master-card-20.png",
    mode: "ARTWORK_ONLY",
    alt: "Canva EDU one-year package artwork in cyan and violet.",
    resolutionNote: "LOW_RES_DESIGNER",
  },
  {
    slug: "coursera-premium-1-year",
    family: "coursera",
    canonical: "coursera-premium-1-year.webp",
    sourceFile: "sheet-fourth-5-card-05.png",
    mode: "ARTWORK_ONLY",
    alt: "Coursera Premium one-year learning package artwork in blue.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "capcut-pro-7-days",
    family: "capcut",
    canonical: "capcut-pro-7-days.webp",
    sourceFile: "sheet-fifth-15-card-01.png",
    mode: "ARTWORK_ONLY",
    alt: "CapCut Pro seven-day video-editing package artwork.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "capcut-pro-30-days",
    family: "capcut",
    canonical: "capcut-pro-30-days.webp",
    sourceFile: "sheet-first-10-card-08.png",
    mode: "ARTWORK_ONLY",
    alt: "CapCut Pro thirty-day video-editing package artwork.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "capcut-pro-6-months",
    family: "capcut",
    canonical: "capcut-pro-6-months.webp",
    sourceFile: "sheet-third-5-card-02.png",
    mode: "ARTWORK_ONLY",
    alt: "CapCut Pro six-month video-editing package artwork.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "kling-standard-680-750-credits",
    family: "kling",
    canonical: "kling-standard-680-750-credits.webp",
    sourceFile: "sheet-first-10-card-09.png",
    mode: "ARTWORK_ONLY",
    alt: "Kling Standard credit package artwork in black and gold.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "kling-ultra-26k-credits",
    family: "kling",
    canonical: "kling-ultra-26k-credits.webp",
    sourceFile: "sheet-third-5-card-04.png",
    mode: "ARTWORK_ONLY",
    alt: "Kling Ultra high-credit AI video package artwork in black and gold.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "cursor-ultra",
    family: "cursor",
    canonical: "cursor-ultra.webp",
    sourceFile: "sheet-fifth-15-card-06.png",
    mode: "ARTWORK_ONLY",
    alt: "Cursor Ultra developer-tool package artwork in graphite and violet.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "cursor-pro-plus",
    family: "cursor",
    canonical: "cursor-pro-plus.webp",
    sourceFile: "sheet-fifth-15-card-07.png",
    mode: "ARTWORK_ONLY",
    alt: "Cursor Pro Plus developer-tool package artwork in graphite and violet.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "cursor-pro-30-days",
    family: "cursor",
    canonical: "cursor-pro-30-days.webp",
    sourceFile: "sheet-first-10-card-10.png",
    mode: "ARTWORK_ONLY",
    alt: "Cursor Pro thirty-day developer-tool package artwork in graphite and violet.",
    resolutionNote: "HIGH_RES_SHEET",
  },
  {
    slug: "ai-prompt-starter-pack",
    family: "trihex",
    canonical: "trihex-prompt-pack.webp",
    sourceFile: null,
    mode: "SVG_FALLBACK",
    alt: "TRIHEX AI prompt starter pack artwork on a light card.",
    resolutionNote: "MISSING",
  },
  {
    slug: "small-business-ai-setup-consultation",
    family: "trihex",
    canonical: "trihex-ai-setup.webp",
    sourceFile: null,
    mode: "SVG_FALLBACK",
    alt: "TRIHEX small business AI setup consultation artwork.",
    resolutionNote: "MISSING",
  },
  {
    slug: "custom-workflow-automation-discovery",
    family: "trihex",
    canonical: "trihex-automation.webp",
    sourceFile: null,
    mode: "SVG_FALLBACK",
    alt: "TRIHEX workflow automation discovery service artwork.",
    resolutionNote: "MISSING",
  },
];

async function artworkFromCard(src: string): Promise<Buffer> {
  const meta = await sharp(src).metadata();
  const w = meta.width ?? 400;
  const h = meta.height ?? 600;

  // Tall marketing cards: illustration sits in upper-middle.
  // Wide/short designer cards: illustration sits mid-right.
  const isTall = h / w > 1.4;
  const left = Math.round(w * (isTall ? 0.08 : 0.42));
  const top = Math.round(h * (isTall ? 0.22 : 0.18));
  const width = Math.round(w * (isTall ? 0.84 : 0.5));
  const height = Math.round(h * (isTall ? 0.38 : 0.55));

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
    .webp({ quality: 88 })
    .toBuffer();
}

async function main() {
  const manifest: Array<Record<string, string | number | boolean>> = [];

  for (const entry of ENTRIES) {
    const familyDir = path.join(OUT, entry.family);
    fs.mkdirSync(familyDir, { recursive: true });

    if (!entry.sourceFile || entry.mode === "SVG_FALLBACK") {
      manifest.push({
        slug: entry.slug,
        family: entry.family,
        canonical: entry.canonical,
        publicPath: "",
        mode: "SVG_FALLBACK",
        sourceFile: "",
        alt: entry.alt,
        resolutionNote: entry.resolutionNote,
        artWidth: 0,
        artHeight: 0,
      });
      console.log("SVG_FALLBACK", entry.slug);
      continue;
    }

    const src = path.join(FULL, entry.sourceFile);
    if (!fs.existsSync(src)) {
      console.log("MISSING_SOURCE", entry.slug, entry.sourceFile);
      manifest.push({
        slug: entry.slug,
        family: entry.family,
        canonical: entry.canonical,
        publicPath: "",
        mode: "SVG_FALLBACK",
        sourceFile: entry.sourceFile,
        alt: entry.alt,
        resolutionNote: "MISSING",
        artWidth: 0,
        artHeight: 0,
      });
      continue;
    }

    const dest = path.join(familyDir, entry.canonical);
    const buf = await artworkFromCard(src);
    fs.writeFileSync(dest, buf);
    const publicPath = `/media/covers/${entry.family}/${entry.canonical}`;
    manifest.push({
      slug: entry.slug,
      family: entry.family,
      canonical: entry.canonical,
      publicPath,
      mode: entry.mode,
      sourceFile: entry.sourceFile,
      alt: entry.alt,
      resolutionNote: entry.resolutionNote,
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: entry.resolutionNote === "LOW_RES_DESIGNER",
    });
    console.log("PUBLISHED", publicPath, "from", entry.sourceFile);
  }

  const manifestPath = path.join(
    ROOT,
    "src",
    "lib",
    "catalog",
    "product-cover-manifest.json",
  );
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("MANIFEST", manifest.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

