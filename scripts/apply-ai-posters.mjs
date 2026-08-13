/**
 * Apply AI-generated brand posters onto key product slugs.
 * Usage: node --env-file=.env.local scripts/apply-ai-posters.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import postgres from "postgres";
import { randomUUID } from "crypto";

const ROOT = process.cwd();
const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-unesh-OneDrive-all-my-cloud-stroge-Desktop-AITRIHEX",
  "assets",
);
const OUT = path.join(ROOT, "public", "media", "covers");
const MANIFEST = path.join(ROOT, "src/lib/catalog/product-cover-manifest.json");

const MAP = [
  {
    file: "poster-chatgpt-plus.png",
    family: "chatgpt",
    slugs: [
      "chatgpt-plus-1-month-fw",
      "chatgpt-plus-1-month-1d",
      "chatgpt-plus-1-month-2d",
      "chatgpt-plus-1-month-20d",
      "chatgpt-plus-1-month-no-warranty",
      "chatgpt-plus-apple-pay-1d",
      "chatgpt-plus-apple-pay-full-warranty",
      "chatgpt-plus-mail-icloud-no-warranty",
      "chatgpt-go-3-months",
    ],
  },
  {
    file: "poster-capcut-pro.png",
    family: "capcut",
    slugs: [
      "capcut-pro-30-days",
      "capcut-pro-6-months",
      "capcut-pro-7-days",
      "capcut-pro-team-1-month",
      "capcut-team-7-seats",
    ],
  },
  {
    file: "poster-netflix.png",
    family: "netflix",
    slugs: ["netflix-private-1-month"],
  },
  {
    file: "poster-spotify.png",
    family: "spotify",
    slugs: ["spotify-premium-3-months"],
  },
  {
    file: "poster-canva.png",
    family: "canva",
    slugs: ["canva-edu-1-year", "canva-pro-1-year"],
  },
  {
    file: "poster-nordvpn.png",
    family: "nordvpn",
    slugs: ["nordvpn-3-months"],
  },
  {
    file: "poster-windows.png",
    family: "microsoft",
    slugs: ["windows-10-11-pro-retail-key"],
  },
  {
    file: "poster-zoom.png",
    family: "zoom",
    slugs: ["zoom-pro-14-days", "zoom-pro-28-days"],
  },
  {
    file: "poster-duolingo.png",
    family: "duolingo",
    slugs: ["duolingo-super-1-year"],
  },
  {
    file: "poster-prime.png",
    family: "amazon",
    slugs: ["prime-video-1-month", "prime-video-6-months"],
  },
  {
    file: "poster-gemini.png",
    family: "gemini",
    slugs: [
      "gemini-pro-18-months-link",
      "gemini-pro-cdk-12-months",
      "gemini-ai-5tb-upgrade-1-year",
      "google-5tb-pixel-no-warranty",
      "google-ai-ultra-25k-1-month",
      "veo-3-ultra-45k-1-month",
    ],
  },
  {
    file: "poster-grok.png",
    family: "grok",
    slugs: [
      "grok-super-1-month",
      "grok-super-3-months",
      "grok-super-6-months",
      "grok-super-10-months",
      "grok-super-12-months",
      "grok-upgrade-own-account-1-month",
    ],
  },
  {
    file: "poster-apple-music.png",
    family: "apple",
    slugs: ["apple-music-6-months"],
  },
  {
    file: "poster-m365.png",
    family: "microsoft",
    slugs: [
      "microsoft-365-5-devices-1-year",
      "microsoft-365-family-trial-1-year",
      "microsoft-365-family-10-months",
      "outlook-trust-mail",
      "office365-100gb-lifetime",
      "office365-1tb-lifetime",
    ],
  },
];

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  prepare: false,
  max: 1,
});
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const bySlug = new Map(manifest.map((e) => [e.slug, e]));

for (const item of MAP) {
  const src = path.join(ASSETS, item.file);
  if (!fs.existsSync(src)) {
    console.log("MISSING AI FILE", src);
    continue;
  }
  const dir = path.join(OUT, item.family);
  fs.mkdirSync(dir, { recursive: true });
  const webpBuf = await sharp(src)
    .resize(1200, 1200, { fit: "cover" })
    .webp({ quality: 92 })
    .toBuffer();

  for (const slug of item.slugs) {
    const canonical = `${slug}.webp`;
    const dest = path.join(dir, canonical);
    fs.writeFileSync(dest, webpBuf);
    const publicPath = `/media/covers/${item.family}/${canonical}`;
    const alt = `${slug} AI product poster`;
    bySlug.set(slug, {
      slug,
      family: item.family,
      canonical,
      publicPath,
      mode: "FULL_CARD",
      sourceFile: item.file,
      alt,
      resolutionNote: "AI_GENERATED_POSTER",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    });

    const products = await sql`SELECT id FROM products WHERE slug = ${slug} LIMIT 1`;
    if (!products[0]) {
      console.log("NO PRODUCT", slug);
      continue;
    }
    const media = await sql`
      SELECT id FROM product_media WHERE product_id = ${products[0].id} AND is_primary = true LIMIT 1
    `;
    if (media[0]) {
      await sql`UPDATE product_media SET url = ${publicPath}, alt_text = ${alt}, is_primary = true WHERE id = ${media[0].id}`;
    } else {
      await sql`
        INSERT INTO product_media (id, product_id, url, alt_text, is_primary, sort_order)
        VALUES (${randomUUID()}, ${products[0].id}, ${publicPath}, ${alt}, true, 0)
      `;
    }
    console.log("AI", slug, "←", item.file);
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n");
await sql.end({ timeout: 5 });
console.log("DONE AI posters");
