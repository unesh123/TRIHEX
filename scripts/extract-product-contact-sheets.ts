/**
 * Extract individual product cards from TRIHEX contact sheets.
 * Creates full-card masters + artwork-only public covers (MODE B preferred).
 *
 * Usage: npx tsx scripts/extract-product-contact-sheets.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createHash } from "crypto";

const ROOT = process.cwd();
const OUT_FULL = path.join(ROOT, "assets", "product-media", "full-cards");
const OUT_ART = path.join(ROOT, "public", "products", "covers");
const OUT_SOURCE = path.join(ROOT, "assets", "product-media", "source-sheets");

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function hashFile(buf: Buffer) {
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

type SheetSpec = {
  file: string;
  id: string;
  /** Uniform grid extraction */
  cols: number;
  rows: number;
  /** Optional: only take first N cells left-to-right, top-to-bottom */
  take?: number;
  /** Margins as fraction of width/height */
  marginX?: number;
  marginY?: number;
  gapX?: number;
  gapY?: number;
  /** For irregular bottom rows: cells as [col,row] with cols spanning */
  cells?: Array<{ col: number; row: number; colSpan?: number }>;
};

/**
 * Sheet layouts calibrated for 1254×1254 contact sheets.
 * Values are fractions of image size.
 */
const SHEETS: SheetSpec[] = [
  {
    file: "Designer.png",
    id: "designer-master",
    cols: 5,
    rows: 7,
    take: 31,
    marginX: 0.018,
    marginY: 0.018,
    gapX: 0.012,
    gapY: 0.012,
  },
  {
    file: "first 10 products images.png",
    id: "sheet-first-10",
    cols: 5,
    rows: 2,
    take: 10,
    marginX: 0.02,
    marginY: 0.02,
    gapX: 0.015,
    gapY: 0.02,
  },
  {
    file: "second 5 product imges.png",
    id: "sheet-second-5",
    cols: 3,
    rows: 2,
    take: 5,
    marginX: 0.03,
    marginY: 0.03,
    gapX: 0.02,
    gapY: 0.04,
    cells: [
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ],
  },
  {
    file: "third 5 products images ..png",
    id: "sheet-third-5",
    cols: 3,
    rows: 2,
    take: 5,
    marginX: 0.03,
    marginY: 0.03,
    gapX: 0.02,
    gapY: 0.04,
    cells: [
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ],
  },
  {
    file: "fourth 5 product images.png",
    id: "sheet-fourth-5",
    cols: 3,
    rows: 2,
    take: 5,
    marginX: 0.03,
    marginY: 0.03,
    gapX: 0.02,
    gapY: 0.04,
    cells: [
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ],
  },
  {
    file: "5th ohere remining product images.png",
    id: "sheet-fifth-15",
    cols: 5,
    rows: 3,
    take: 15,
    marginX: 0.015,
    marginY: 0.015,
    gapX: 0.01,
    gapY: 0.015,
  },
];

/** Canonical mapping: designer-master index (0-based) → slug + family + preferred art path */
const DESIGNER_MAP: Array<{
  index: number;
  slug: string;
  family: string;
  canonical: string;
  mode: "ARTWORK_ONLY" | "FULL_CARD";
}> = [
  { index: 0, slug: "gemini-pro-5tb-1-year", family: "gemini", canonical: "gemini-pro-5tb-1-year.webp", mode: "ARTWORK_ONLY" },
  { index: 1, slug: "gemini-pro-18-months-link", family: "gemini", canonical: "gemini-pro-18-month-upgrade.webp", mode: "ARTWORK_ONLY" },
  { index: 2, slug: "gemini-pro-4-month-link", family: "gemini", canonical: "gemini-pro-4-months.webp", mode: "ARTWORK_ONLY" },
  { index: 3, slug: "gemini-pro-upgrade-link-18-months", family: "gemini", canonical: "gemini-upgrade-link-18-months.webp", mode: "ARTWORK_ONLY" },
  { index: 4, slug: "gemini-pro-cdk-12-months", family: "gemini", canonical: "gemini-pro-12-month-redeem.webp", mode: "ARTWORK_ONLY" },
  { index: 5, slug: "gemini-ai-pro-5tb-12m-mail-a", family: "gemini", canonical: "gemini-ai-pro-5tb-12-months-a.webp", mode: "ARTWORK_ONLY" },
  { index: 6, slug: "gemini-ai-pro-5tb-12m-mail-b", family: "gemini", canonical: "gemini-ai-pro-5tb-12-months-b.webp", mode: "ARTWORK_ONLY" },
  { index: 7, slug: "chatgpt-go-3-months", family: "chatgpt", canonical: "chatgpt-go-3-months.webp", mode: "ARTWORK_ONLY" },
  { index: 8, slug: "chatgpt-plus-1-month-fw", family: "chatgpt", canonical: "chatgpt-plus-1-month-full-warranty.webp", mode: "ARTWORK_ONLY" },
  { index: 9, slug: "chatgpt-plus-1-month-gmail-w15d", family: "chatgpt", canonical: "chatgpt-plus-1-month-limited-a.webp", mode: "ARTWORK_ONLY" },
  { index: 10, slug: "gpt-plus-apple-pay-gmail-w3d", family: "chatgpt", canonical: "chatgpt-plus-1-month-limited-b.webp", mode: "ARTWORK_ONLY" },
  { index: 11, slug: "supergrok-12-months", family: "grok", canonical: "supergrok-12-months.webp", mode: "ARTWORK_ONLY" },
  { index: 12, slug: "grok-super-1-year-fww", family: "grok", canonical: "grok-super-1-year.webp", mode: "ARTWORK_ONLY" },
  { index: 13, slug: "grok-super-3-months", family: "grok", canonical: "grok-super-3-months.webp", mode: "ARTWORK_ONLY" },
  { index: 14, slug: "claude-x20-w30d", family: "claude", canonical: "claude-x20-30-days.webp", mode: "ARTWORK_ONLY" },
  { index: 15, slug: "claude-x5-personal-30d", family: "claude", canonical: "claude-x5-30-days.webp", mode: "ARTWORK_ONLY" },
  { index: 16, slug: "adobe-cc-2-months", family: "adobe", canonical: "adobe-creative-cloud-2-months.webp", mode: "ARTWORK_ONLY" },
  { index: 17, slug: "canva-pro-slot-1-year", family: "canva", canonical: "canva-pro-slot-1-year.webp", mode: "ARTWORK_ONLY" },
  { index: 18, slug: "canva-pro-1-year", family: "canva", canonical: "canva-pro-1-year.webp", mode: "ARTWORK_ONLY" },
  { index: 19, slug: "canva-edu-1-year", family: "canva", canonical: "canva-edu-1-year.webp", mode: "ARTWORK_ONLY" },
  { index: 20, slug: "coursera-premium-1-year", family: "coursera", canonical: "coursera-premium-1-year.webp", mode: "ARTWORK_ONLY" },
  { index: 21, slug: "capcut-pro-7-days", family: "capcut", canonical: "capcut-pro-7-days.webp", mode: "ARTWORK_ONLY" },
  { index: 22, slug: "capcut-pro-30-days", family: "capcut", canonical: "capcut-pro-30-days.webp", mode: "ARTWORK_ONLY" },
  { index: 23, slug: "capcut-pro-6-months", family: "capcut", canonical: "capcut-pro-6-months.webp", mode: "ARTWORK_ONLY" },
  { index: 24, slug: "kling-standard-680-750-credits", family: "kling", canonical: "kling-standard-680-750-credits.webp", mode: "ARTWORK_ONLY" },
  { index: 25, slug: "kling-ultra-26k-credits", family: "kling", canonical: "kling-ultra-26k-credits.webp", mode: "ARTWORK_ONLY" },
  { index: 26, slug: "cursor-ultra", family: "cursor", canonical: "cursor-ultra.webp", mode: "ARTWORK_ONLY" },
  { index: 27, slug: "cursor-pro-plus", family: "cursor", canonical: "cursor-pro-plus.webp", mode: "ARTWORK_ONLY" },
  { index: 28, slug: "cursor-pro-30-days", family: "cursor", canonical: "cursor-pro-30-days.webp", mode: "ARTWORK_ONLY" },
  { index: 29, slug: "ai-prompt-starter-pack", family: "trihex", canonical: "trihex-prompt-pack.webp", mode: "ARTWORK_ONLY" },
  { index: 30, slug: "small-business-ai-setup-consultation", family: "trihex", canonical: "trihex-ai-setup.webp", mode: "ARTWORK_ONLY" },
];

async function extractGrid(sheet: SheetSpec) {
  const srcPath = path.join(ROOT, sheet.file);
  if (!fs.existsSync(srcPath)) {
    console.log("MISSING_SHEET", sheet.file);
    return [] as Array<{
      sheetId: string;
      index: number;
      fullPath: string;
      artPath: string;
      hash: string;
      width: number;
      height: number;
    }>;
  }

  ensureDir(OUT_SOURCE);
  ensureDir(OUT_FULL);
  const destSheet = path.join(OUT_SOURCE, `${sheet.id}.png`);
  if (!fs.existsSync(destSheet)) {
    fs.copyFileSync(srcPath, destSheet);
  }

  const image = sharp(srcPath);
  const meta = await image.metadata();
  const W = meta.width ?? 1254;
  const H = meta.height ?? 1254;
  const marginX = Math.round(W * (sheet.marginX ?? 0.02));
  const marginY = Math.round(H * (sheet.marginY ?? 0.02));
  const gapX = Math.round(W * (sheet.gapX ?? 0.015));
  const gapY = Math.round(H * (sheet.gapY ?? 0.015));
  const usableW = W - marginX * 2 - gapX * (sheet.cols - 1);
  const usableH = H - marginY * 2 - gapY * (sheet.rows - 1);
  const cardW = Math.floor(usableW / sheet.cols);
  const cardH = Math.floor(usableH / sheet.rows);

  const positions: Array<{ col: number; row: number }> = [];
  if (sheet.cells) {
    for (const c of sheet.cells) positions.push({ col: c.col, row: c.row });
  } else {
    const take = sheet.take ?? sheet.cols * sheet.rows;
    let n = 0;
    for (let row = 0; row < sheet.rows && n < take; row++) {
      for (let col = 0; col < sheet.cols && n < take; col++) {
        positions.push({ col, row });
        n++;
      }
    }
  }

  const results = [];
  for (let i = 0; i < positions.length; i++) {
    const { col, row } = positions[i]!;
    const left = marginX + col * (cardW + gapX);
    const top = marginY + row * (cardH + gapY);
    const extract = {
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: Math.min(cardW, W - left),
      height: Math.min(cardH, H - top),
    };

    const fullBuf = await sharp(srcPath)
      .extract(extract)
      .png()
      .toBuffer();

    const fullName = `${sheet.id}-card-${String(i + 1).padStart(2, "0")}.png`;
    const fullPath = path.join(OUT_FULL, fullName);
    fs.writeFileSync(fullPath, fullBuf);

    // Artwork-only: middle band of card (exclude title/price/status)
    const artTop = Math.round(extract.height * 0.28);
    const artHeight = Math.round(extract.height * 0.42);
    const artLeft = Math.round(extract.width * 0.08);
    const artWidth = Math.round(extract.width * 0.84);

    const artBuf = await sharp(fullBuf)
      .extract({
        left: artLeft,
        top: artTop,
        width: artWidth,
        height: artHeight,
      })
      .resize(1200, 1200, {
        fit: "contain",
        background: { r: 247, g: 248, b: 252, alpha: 1 },
      })
      .webp({ quality: 86 })
      .toBuffer();

    const artName = `${sheet.id}-art-${String(i + 1).padStart(2, "0")}.webp`;
    const artTmp = path.join(OUT_FULL, artName);
    fs.writeFileSync(artTmp, artBuf);

    results.push({
      sheetId: sheet.id,
      index: i,
      fullPath: path.relative(ROOT, fullPath).replace(/\\/g, "/"),
      artPath: path.relative(ROOT, artTmp).replace(/\\/g, "/"),
      hash: hashFile(fullBuf),
      width: extract.width,
      height: extract.height,
    });
    console.log("EXTRACTED", sheet.id, i + 1, extract.width + "x" + extract.height);
  }
  return results;
}

async function publishCanonical(designerResults: Awaited<ReturnType<typeof extractGrid>>) {
  const manifest: Array<Record<string, string | number>> = [];
  for (const map of DESIGNER_MAP) {
    const crop = designerResults.find((r) => r.index === map.index);
    if (!crop) {
      console.log("MAP_MISSING", map.slug);
      continue;
    }
    const familyDir = path.join(OUT_ART, map.family);
    ensureDir(familyDir);
    const dest = path.join(familyDir, map.canonical);
    const artAbs = path.join(ROOT, crop.artPath);
    const webp = await sharp(artAbs).webp({ quality: 88 }).toBuffer();
    fs.writeFileSync(dest, webp);

    // Also copy full card for admin/archive reference
    const fullDest = path.join(familyDir, map.canonical.replace(/\.webp$/, "-full.png"));
    fs.copyFileSync(path.join(ROOT, crop.fullPath), fullDest);

    const publicPath = `/products/covers/${map.family}/${map.canonical}`;
    manifest.push({
      slug: map.slug,
      family: map.family,
      canonical: map.canonical,
      publicPath,
      mode: map.mode,
      sourceSheet: "designer-master",
      sourceIndex: map.index + 1,
      hash: crop.hash,
      artWidth: 1200,
      artHeight: 1200,
    });
    console.log("PUBLISHED", publicPath);
  }

  const workflowSlug = "custom-workflow-automation-discovery";
  // No card 32 on designer sheet — keep SVG fallback for workflow service
  manifest.push({
    slug: workflowSlug,
    family: "trihex",
    canonical: "trihex-automation.webp",
    publicPath: "",
    mode: "SVG_FALLBACK",
    sourceSheet: "none",
    sourceIndex: 0,
    hash: "",
    artWidth: 0,
    artHeight: 0,
  });

  const manifestPath = path.join(ROOT, "src", "lib", "catalog", "product-cover-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("MANIFEST", manifestPath, "entries", manifest.length);
  return manifest;
}

async function main() {
  ensureDir(OUT_FULL);
  ensureDir(OUT_ART);
  const all = [];
  for (const sheet of SHEETS) {
    const rows = await extractGrid(sheet);
    all.push(...rows);
  }
  const designer = all.filter((r) => r.sheetId === "designer-master");
  await publishCanonical(designer);
  console.log("TOTAL_CROPS", all.length);
  console.log("DESIGNER_CROPS", designer.length);
  console.log("UNIQUE_HASHES", new Set(all.map((r) => r.hash)).size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
