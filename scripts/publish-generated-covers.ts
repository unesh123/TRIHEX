/**
 * Publish generated product covers into public/media/covers + manifest + DB media.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";

const ROOT = process.cwd();
const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-unesh-OneDrive-all-my-cloud-stroge-Desktop-AITRIHEX",
  "assets",
);
const OUT = path.join(ROOT, "public", "media", "covers");
const MANIFEST = path.join(
  ROOT,
  "src",
  "lib",
  "catalog",
  "product-cover-manifest.json",
);

const MAP: Array<{
  slug: string;
  family: string;
  file: string;
  alt: string;
}> = [
  {
    slug: "office365-100gb-lifetime",
    family: "microsoft",
    file: "cover-office365-100gb.png",
    alt: "Microsoft Office 365 100GB OneDrive cover artwork.",
  },
  {
    slug: "office365-1tb-lifetime",
    family: "microsoft",
    file: "cover-office365-1tb.png",
    alt: "Microsoft Office 365 1TB OneDrive cover artwork.",
  },
  {
    slug: "microsoft-365-family-10-months",
    family: "microsoft",
    file: "cover-m365-family.png",
    alt: "Microsoft 365 Family cover artwork.",
  },
  {
    slug: "grammarly-pro-1-year",
    family: "grammarly",
    file: "cover-grammarly.png",
    alt: "Grammarly Pro writing cover artwork.",
  },
  {
    slug: "youtube-premium-1-year",
    family: "youtube",
    file: "cover-youtube.png",
    alt: "YouTube Premium cover artwork.",
  },
  {
    slug: "figma-edu-2-years",
    family: "figma",
    file: "cover-figma.png",
    alt: "Figma Edu cover artwork.",
  },
  {
    slug: "elevenlabs-1-month",
    family: "elevenlabs",
    file: "cover-elevenlabs.png",
    alt: "ElevenLabs voice AI cover artwork.",
  },
  {
    slug: "notion-business-3-months",
    family: "notion",
    file: "cover-notion.png",
    alt: "Notion Business cover artwork.",
  },
  {
    slug: "adobe-cc-2-months",
    family: "adobe",
    file: "cover-adobe.png",
    alt: "Adobe Creative Cloud cover artwork.",
  },
  // CapCut already generated earlier
  {
    slug: "capcut-pro-7-days",
    family: "capcut",
    file: "capcut-pro-cover-short.png",
    alt: "CapCut Pro seven-day cover artwork.",
  },
  {
    slug: "capcut-pro-30-days",
    family: "capcut",
    file: "capcut-pro-cover-base.png",
    alt: "CapCut Pro thirty-day cover artwork.",
  },
  {
    slug: "capcut-pro-6-months",
    family: "capcut",
    file: "capcut-pro-cover-alt.png",
    alt: "CapCut Pro six-month cover artwork.",
  },
];

async function main() {
  const bySlug = new Map(
    (
      JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Array<
        Record<string, unknown>
      >
    ).map((e) => [String(e.slug), e]),
  );

  const published: Array<{ slug: string; url: string; alt: string }> = [];

  for (const item of MAP) {
    const src = path.join(ASSETS, item.file);
    if (!fs.existsSync(src)) {
      console.warn("MISSING", item.file);
      continue;
    }
    const dir = path.join(OUT, item.family);
    fs.mkdirSync(dir, { recursive: true });
    // Also copy into repo assets for permanence
    const repoCopyDir = path.join(ROOT, "assets", "product-media", "generated");
    fs.mkdirSync(repoCopyDir, { recursive: true });
    fs.copyFileSync(src, path.join(repoCopyDir, item.file));

    const canonical = `${item.slug}.webp`;
    const dest = path.join(dir, canonical);
    const buf = await sharp(src)
      .resize(1200, 1200, { fit: "cover", position: "attention" })
      .toColorspace("srgb")
      .webp({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(dest, buf);
    const publicPath = `/media/covers/${item.family}/${canonical}`;
    bySlug.set(item.slug, {
      slug: item.slug,
      family: item.family,
      canonical,
      publicPath,
      mode: "ARTWORK_ONLY",
      sourceFile: `assets/product-media/generated/${item.file}`,
      alt: item.alt,
      resolutionNote: "GENERATED_HQ",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    });
    published.push({ slug: item.slug, url: publicPath, alt: item.alt });
    console.log("PUBLISHED", item.slug, `${Math.round(buf.length / 1024)}KB`);
  }

  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n",
  );

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (dbUrl) {
    const sql = postgres(dbUrl, { prepare: false, max: 1 });
    for (const p of published) {
      const rows = await sql`select id from products where slug = ${p.slug} limit 1`;
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

  console.log("DONE", published.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
