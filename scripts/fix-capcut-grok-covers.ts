/**
 * Fix CapCut/Grok swapped covers.
 * video-ai-abstract.png and video-abstract-portrait.png are MISNAMED Grok posters — never use for CapCut.
 *
 * CapCut ← generated HQ covers
 * Grok 3m ← real grok-super-3month poster (artwork crop)
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
const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-unesh-OneDrive-all-my-cloud-stroge-Desktop-AITRIHEX",
  "assets",
);
const ZIP = path.join(
  ROOT,
  "TRIHEX_PRODUCT_IMAGES",
  "TRIHEX_PRODUCT_IMAGES",
);

async function publish(
  slug: string,
  family: string,
  canonical: string,
  src: string,
  alt: string,
  kind: "ABSTRACT" | "POSTER",
  bySlug: Map<string, Record<string, unknown>>,
) {
  if (!fs.existsSync(src)) throw new Error(`Missing source: ${src}`);
  const dir = path.join(OUT, family);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, canonical);

  let buf: Buffer;
  if (kind === "POSTER") {
    const meta = await sharp(src).metadata();
    const w = meta.width ?? 1024;
    const h = meta.height ?? 1024;
    const isTall = h / w > 1.15;
    const left = Math.round(w * (isTall ? 0.08 : 0.12));
    const top = Math.round(h * (isTall ? 0.22 : 0.16));
    const width = Math.round(w * (isTall ? 0.84 : 0.76));
    const height = Math.round(h * (isTall ? 0.42 : 0.55));
    buf = await sharp(src)
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
      .toBuffer();
  } else {
    buf = await sharp(src)
      .resize(1200, 1200, { fit: "cover", position: "attention" })
      .toColorspace("srgb")
      .webp({ quality: 90 })
      .toBuffer();
  }

  fs.writeFileSync(dest, buf);
  bySlug.set(slug, {
    slug,
    family,
    canonical,
    publicPath: `/media/covers/${family}/${canonical}`,
    mode: "ARTWORK_ONLY",
    sourceFile: src.replace(ROOT + path.sep, "").replace(/\\/g, "/"),
    alt,
    resolutionNote: "CORRECTED_UNIQUE_COVER",
    artWidth: 1200,
    artHeight: 1200,
    lowResReplacementRecommended: false,
  });
  console.log("FIXED", slug, `${Math.round(buf.length / 1024)}KB`);
}

async function main() {
  const bySlug = new Map(
    (
      JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Array<
        Record<string, unknown>
      >
    ).map((e) => [String(e.slug), e]),
  );

  // CapCut — generated unique covers (NOT misnamed Grok posters)
  await publish(
    "capcut-pro-7-days",
    "capcut",
    "capcut-pro-7-days.webp",
    path.join(ASSETS, "capcut-pro-cover-short.png"),
    "CapCut Pro seven-day video editing cover artwork.",
    "ABSTRACT",
    bySlug,
  );
  await publish(
    "capcut-pro-30-days",
    "capcut",
    "capcut-pro-30-days.webp",
    path.join(ASSETS, "capcut-pro-cover-base.png"),
    "CapCut Pro thirty-day video editing cover artwork.",
    "ABSTRACT",
    bySlug,
  );
  await publish(
    "capcut-pro-6-months",
    "capcut",
    "capcut-pro-6-months.webp",
    path.join(ASSETS, "capcut-pro-cover-alt.png"),
    "CapCut Pro six-month video editing cover artwork.",
    "ABSTRACT",
    bySlug,
  );

  // True camera abstract backup also for youtube (was wrongly on video-ai = Grok)
  await publish(
    "youtube-premium-1-year",
    "youtube",
    "youtube-premium-1-year.webp",
    path.join(ZIP, "02_abstract_artwork/kling-gold-camera-abstract.png"),
    "YouTube Premium abstract video cover artwork.",
    "ABSTRACT",
    bySlug,
  );

  // Grok 3 months — real Grok poster crop (not CapCut)
  await publish(
    "grok-super-3-months",
    "grok",
    "grok-super-3-months.webp",
    path.join(ZIP, "01_single_product_covers/grok-super-3month-rs3499-poster.png"),
    "Grok Super three-month package artwork.",
    "POSTER",
    bySlug,
  );

  // Also refresh 1-year grok if present
  const grok1y = path.join(
    ZIP,
    "01_single_product_covers/grok-super-1year-rs13999-poster.png",
  );
  if (fs.existsSync(grok1y)) {
    await publish(
      "grok-super-1-year-fww",
      "grok",
      "grok-super-1-year.webp",
      grok1y,
      "Grok Super one-year package artwork.",
      "POSTER",
      bySlug,
    );
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
