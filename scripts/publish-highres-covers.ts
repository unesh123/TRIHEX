/**
 * Publish high-res individual covers (MODE B artwork when baked text conflicts).
 * Usage: npx tsx scripts/publish-highres-covers.ts
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

type Entry = {
  slug: string;
  family: string;
  canonical: string;
  sourceFile: string;
  alt: string;
  /** Prefer full card only when no conflicting baked price/status — we use ARTWORK_ONLY for all priced posters */
  mode: "ARTWORK_ONLY";
};

/** Visual-content mapping to highest-res SINGLE covers (not contact sheets). */
const ENTRIES: Entry[] = [
  {
    slug: "gemini-pro-18-months-link",
    family: "gemini",
    canonical: "gemini-pro-18-month-upgrade.webp",
    sourceFile: "gemenai 18 monts plan rs 399.png",
    alt: "Gemini AI Pro eighteen-month package artwork in blue and violet.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "gemini-pro-upgrade-link-18-months",
    family: "gemini",
    canonical: "gemini-upgrade-link-18-months.webp",
    sourceFile: "Designer (3).png",
    alt: "Gemini Pro eighteen-month upgrade package artwork.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "gemini-pro-4-month-link",
    family: "gemini",
    canonical: "gemini-pro-4-months.webp",
    sourceFile: "Designer (11).png", // fallback visual family if no dedicated 4m — prefer 18m art only if missing; use Designer (11) is 18m — keep previous cover if no 4m single
    alt: "Gemini Pro four-month package artwork.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "google-ai-pro-5tb-18-months",
    family: "gemini",
    canonical: "google-ai-pro-5tb-18-months.webp",
    sourceFile: "Designer (14).png",
    alt: "Google AI Pro five-terabyte eighteen-month package artwork.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "gemini-ai-pro-5tb-12m-mail-a",
    family: "gemini",
    canonical: "gemini-ai-pro-5tb-12-months-a.webp",
    sourceFile: "google ai pro rs 399.jpg",
    alt: "Google AI Pro five-terabyte package artwork.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "chatgpt-plus-1-month-fw",
    family: "chatgpt",
    canonical: "chatgpt-plus-1-month-full-warranty.webp",
    sourceFile: "Designer (13).png",
    alt: "ChatGPT Plus one-month package artwork in emerald and white.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "grok-super-3-months",
    family: "grok",
    canonical: "grok-super-3-months.webp",
    sourceFile: "supergrok 3month package rs3499.png",
    alt: "Grok Super three-month package artwork with a black orbital AI core.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "grok-super-1-year-fww",
    family: "grok",
    canonical: "grok-super-1-year.webp",
    sourceFile: "Designer (4).png",
    alt: "Grok Super one-year package artwork with a black orbital AI core.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "supergrok-12-months",
    family: "grok",
    canonical: "supergrok-12-months.webp",
    sourceFile: "Designer (9).png",
    alt: "SuperGrok twelve-month package artwork.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "coursera-premium-1-year",
    family: "coursera",
    canonical: "coursera-premium-1-year.webp",
    sourceFile: "Designer (10).png",
    alt: "Coursera Premium one-year learning package artwork in blue.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "canva-pro-1-year",
    family: "canva",
    canonical: "canva-pro-1-year.webp",
    sourceFile: "Designer (8).png",
    alt: "Canva Pro one-year package artwork in cyan and violet.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "canva-pro-slot-1-year",
    family: "canva",
    canonical: "canva-pro-slot-1-year.webp",
    sourceFile: "Designer (8).png",
    alt: "Canva Pro slot one-year package artwork in cyan and violet.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "kling-ultra-26k-credits",
    family: "kling",
    canonical: "kling-ultra-26k-credits.webp",
    sourceFile: "kling ai 26k credits plan rs 13999.png",
    alt: "Kling Ultra high-credit AI video package artwork in black and gold.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "kling-standard-680-750-credits",
    family: "kling",
    canonical: "kling-standard-680-750-credits.webp",
    sourceFile: "kling ai 750 creditss kling standard.png",
    alt: "Kling Standard credit package artwork in black and gold.",
    mode: "ARTWORK_ONLY",
  },
  {
    slug: "adobe-cc-2-months",
    family: "adobe",
    canonical: "adobe-creative-cloud-2-months.webp",
    sourceFile: "Designer (27).png", // contact sheet — skip if contact; prefer keep existing until single found
    alt: "Adobe Creative Cloud two-month package artwork.",
    mode: "ARTWORK_ONLY",
  },
];

/** Dedicated singles only — skip known contact sheets */
const CONTACT_SHEETS = new Set([
  "Designer.png",
  "designer 2.png",
  "Designer (2).png",
  "Designer (5).png",
  "Designer (6).png",
  "Designer (18).png",
  "Designer (19).png",
  "Designer (20).png",
  "Designer (21).png",
  "Designer (22).png",
  "Designer (23).png",
  "Designer (24).png",
  "Designer (26).png",
  "Designer (27).png",
  "Designer (28).png",
  "Designer (29).png",
  "Designer (30).png",
  "Designer (31).png",
  "Designer (32).png",
]);

async function artworkFromSingle(src: string): Promise<Buffer> {
  const meta = await sharp(src).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  const isTall = h / w > 1.2;

  // Tall posters: central hero art (avoid price footer / title header)
  // Square covers: center-weighted crop
  const left = Math.round(w * (isTall ? 0.06 : 0.1));
  const top = Math.round(h * (isTall ? 0.28 : 0.18));
  const width = Math.round(w * (isTall ? 0.88 : 0.8));
  const height = Math.round(h * (isTall ? 0.4 : 0.55));

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
      withoutEnlargement: false,
    })
    .webp({ quality: 90 })
    .toBuffer();
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Array<
    Record<string, unknown>
  >;
  const bySlug = new Map(existing.map((e) => [String(e.slug), e]));

  for (const entry of ENTRIES) {
    if (CONTACT_SHEETS.has(entry.sourceFile)) {
      console.log("SKIP_CONTACT_SHEET", entry.slug, entry.sourceFile);
      continue;
    }
    // Don't use Gemini 18m art for 4-month SKU
    if (
      entry.slug === "gemini-pro-4-month-link" &&
      entry.sourceFile === "Designer (11).png"
    ) {
      console.log("SKIP_WRONG_PACKAGE", entry.slug);
      continue;
    }

    const src = path.join(ROOT, entry.sourceFile);
    if (!fs.existsSync(src)) {
      console.log("MISSING", entry.sourceFile);
      continue;
    }

    const meta = await sharp(src).metadata();
    const familyDir = path.join(OUT, entry.family);
    fs.mkdirSync(familyDir, { recursive: true });
    const dest = path.join(familyDir, entry.canonical);
    const buf = await artworkFromSingle(src);
    fs.writeFileSync(dest, buf);

    const publicPath = `/media/covers/${entry.family}/${entry.canonical}`;
    bySlug.set(entry.slug, {
      slug: entry.slug,
      family: entry.family,
      canonical: entry.canonical,
      publicPath,
      mode: entry.mode,
      sourceFile: entry.sourceFile,
      alt: entry.alt,
      resolutionNote: "HIGH_RES_SINGLE",
      artWidth: 1200,
      artHeight: 1200,
      sourceWidth: meta.width ?? 0,
      sourceHeight: meta.height ?? 0,
      lowResReplacementRecommended: false,
    });
    console.log(
      "UPGRADED",
      entry.slug,
      "←",
      entry.sourceFile,
      `${meta.width}x${meta.height}`,
    );
  }

  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(Array.from(bySlug.values()), null, 2),
  );
  console.log("MANIFEST", bySlug.size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
