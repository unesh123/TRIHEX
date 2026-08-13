/**
 * Re-publish correct Grok covers (never video/CapCut abstract art).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "media", "covers", "grok");
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

const ITEMS = [
  {
    slug: "grok-super-3-months",
    file: "cover-grok-super-3m.png",
    alt: "Grok Super three-month AI cover artwork.",
  },
  {
    slug: "grok-super-10-months",
    file: "cover-grok-super-10m.png",
    alt: "Grok Super ten-month AI cover artwork.",
  },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const bySlug = new Map(
    (
      JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Array<
        Record<string, unknown>
      >
    ).map((e) => [String(e.slug), e]),
  );

  const published: Array<{ slug: string; url: string; alt: string }> = [];

  for (const item of ITEMS) {
    const src = path.join(ASSETS, item.file);
    if (!fs.existsSync(src)) throw new Error(`Missing ${src}`);
    const canonical = `${item.slug}.webp`;
    const buf = await sharp(src)
      .resize(1200, 1200, { fit: "cover", position: "attention" })
      .toColorspace("srgb")
      .webp({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(OUT, canonical), buf);
    const repoCopy = path.join(ROOT, "assets", "product-media", "generated");
    fs.mkdirSync(repoCopy, { recursive: true });
    fs.copyFileSync(src, path.join(repoCopy, item.file));
    const publicPath = `/media/covers/grok/${canonical}`;
    bySlug.set(item.slug, {
      slug: item.slug,
      family: "grok",
      canonical,
      publicPath,
      mode: "ARTWORK_ONLY",
      sourceFile: `assets/product-media/generated/${item.file}`,
      alt: item.alt,
      resolutionNote: "GENERATED_HQ_GROK",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    });
    published.push({ slug: item.slug, url: publicPath, alt: item.alt });
    console.log("PUBLISHED", item.slug, `${Math.round(buf.length / 1024)}KB`);
  }

  // Crop Grok 1-year poster artwork (misnamed video-abstract-portrait.png)
  const poster1y = path.join(ASSETS, "video-abstract-portrait.png");
  const inspectPoster = path.join(
    ROOT,
    "assets",
    "_inspect",
    "video-abstract-portrait.png",
  );
  const posterSrc = fs.existsSync(poster1y)
    ? poster1y
    : fs.existsSync(inspectPoster)
      ? inspectPoster
      : null;

  if (posterSrc) {
    const meta = await sharp(posterSrc).metadata();
    const w = meta.width ?? 1024;
    const h = meta.height ?? 1536;
    const left = Math.round(w * 0.08);
    const top = Math.round(h * 0.18);
    const width = Math.round(w * 0.84);
    const height = Math.round(h * 0.38);
    const buf = await sharp(posterSrc)
      .extract({
        left,
        top,
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
    const canonical = "grok-super-1-year.webp";
    fs.writeFileSync(path.join(OUT, canonical), buf);
    const publicPath = `/media/covers/grok/${canonical}`;
    bySlug.set("grok-super-1-year-fww", {
      slug: "grok-super-1-year-fww",
      family: "grok",
      canonical,
      publicPath,
      mode: "ARTWORK_ONLY",
      sourceFile: "assets/_inspect/video-abstract-portrait.png",
      alt: "Grok Super one-year package artwork.",
      resolutionNote: "POSTER_CROP_HQ",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    });
    // Also update alias used by some manifests
    bySlug.set("grok-super-1-year", {
      slug: "grok-super-1-year",
      family: "grok",
      canonical,
      publicPath,
      mode: "ARTWORK_ONLY",
      sourceFile: "assets/_inspect/video-abstract-portrait.png",
      alt: "Grok Super one-year package artwork.",
      resolutionNote: "POSTER_CROP_HQ",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    });
    console.log("PUBLISHED grok-super-1-year", `${Math.round(buf.length / 1024)}KB`);
  }

  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n",
  );

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (dbUrl) {
    const sql = postgres(dbUrl, { prepare: false, max: 1 });
    for (const p of published) {
      const rows =
        await sql`select id from products where slug = ${p.slug} limit 1`;
      if (!rows[0]) continue;
      const productId = rows[0].id as string;
      await sql`delete from product_media where product_id = ${productId}`;
      await sql`
        insert into product_media (product_id, url, alt_text, sort_order, is_primary)
        values (${productId}, ${p.url}, ${p.alt}, 0, true)
      `;
      console.log("DB", p.slug);
    }
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
