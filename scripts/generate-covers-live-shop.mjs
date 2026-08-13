/**
 * Covers for live-shop-stock new SKUs + product_media upsert.
 * Usage: node --env-file=.env.local scripts/generate-covers-live-shop.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import postgres from "postgres";
import { randomUUID } from "crypto";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "media", "covers");
const MANIFEST = path.join(ROOT, "src/lib/catalog/product-cover-manifest.json");

const SPECS = [
  { slug: "chatgpt-plus-apple-pay-1d", family: "chatgpt", colors: ["#10A37F", "#0B3B2E", "#ECFDF5"], alt: "ChatGPT Plus Apple Pay 1-day warranty cover." },
  { slug: "chatgpt-plus-apple-pay-full-warranty", family: "chatgpt", colors: ["#10A37F", "#111827", "#ECFDF5"], alt: "ChatGPT Plus Apple Pay full warranty cover." },
  { slug: "chatgpt-plus-1-month-1d", family: "chatgpt", colors: ["#059669", "#064E3B", "#ECFDF5"], alt: "ChatGPT Plus 1-day warranty cover." },
  { slug: "chatgpt-plus-1-month-2d", family: "chatgpt", colors: ["#047857", "#022C22", "#ECFDF5"], alt: "ChatGPT Plus 2-day warranty cover." },
  { slug: "chatgpt-plus-mail-icloud-no-warranty", family: "chatgpt", colors: ["#6B7280", "#111827", "#F3F4F6"], alt: "ChatGPT Plus mail iCloud cover." },
  { slug: "chatgpt-plus-1-month-fw", family: "chatgpt", colors: ["#10A37F", "#0F172A", "#ECFDF5"], alt: "ChatGPT Plus full warranty cover." },
  { slug: "capcut-pro-30-days", family: "capcut", colors: ["#000000", "#3B82F6", "#F8FAFC"], alt: "CapCut Pro 1 month cover." },
  { slug: "capcut-pro-team-1-month", family: "capcut", colors: ["#111827", "#60A5FA", "#EFF6FF"], alt: "CapCut Pro Team 1 month cover." },
  { slug: "capcut-pro-6-months", family: "capcut", colors: ["#0F172A", "#2563EB", "#DBEAFE"], alt: "CapCut Pro 5-6 months cover." },
  { slug: "grok-super-12-months", family: "grok", colors: ["#8B5CF6", "#0F172A", "#F5F3FF"], alt: "Grok Super 1 year cover." },
  { slug: "grok-upgrade-own-account-1-month", family: "grok", colors: ["#A78BFA", "#1E1B4B", "#F5F3FF"], alt: "Grok own-account upgrade cover." },
  { slug: "google-5tb-pixel-no-warranty", family: "gemini", colors: ["#4285F4", "#EA4335", "#EEF2FF"], alt: "Google 5TB Pixel cover." },
  { slug: "gemini-pro-cdk-12-months", family: "gemini", colors: ["#34A853", "#4285F4", "#F0FDF4"], alt: "Gemini CDK 1 year cover." },
  { slug: "gemini-pro-18-months-link", family: "gemini", colors: ["#FBBC05", "#4285F4", "#FFFBEB"], alt: "Gemini AI Pro 18 months cover." },
  { slug: "gemini-ai-5tb-upgrade-1-year", family: "gemini", colors: ["#4285F4", "#0F172A", "#EFF6FF"], alt: "Gemini AI 5TB upgrade cover." },
  { slug: "canva-edu-1-year", family: "canva", colors: ["#00C4CC", "#7D2AE7", "#ECFEFF"], alt: "Canva Education 1 year cover." },
  { slug: "microsoft-365-5-devices-1-year", family: "microsoft", colors: ["#2563EB", "#0EA5E9", "#F8FAFC"], alt: "Microsoft 365 5 devices cover." },
  { slug: "microsoft-365-family-trial-1-year", family: "microsoft", colors: ["#7C3AED", "#2563EB", "#F5F3FF"], alt: "Microsoft 365 Family trial cover." },
  { slug: "hma-vpn-key-20-30-days", family: "hma", colors: ["#F97316", "#111827", "#FFF7ED"], alt: "HMA VPN key cover." },
  { slug: "duolingo-super-1-year", family: "duolingo", colors: ["#58CC02", "#1B5E20", "#F0FDF4"], alt: "Super Duolingo 1 year cover." },
  { slug: "outlook-trust-mail", family: "microsoft", colors: ["#0078D4", "#0F172A", "#EFF6FF"], alt: "Outlook trust mail cover." },
  { slug: "scribd-premium-trial", family: "scribd", colors: ["#1E7B74", "#0F172A", "#ECFDF5"], alt: "Scribd Premium trial cover." },
  { slug: "windows-10-11-pro-retail-key", family: "microsoft", colors: ["#00A4EF", "#111827", "#F0F9FF"], alt: "Windows 10/11 Pro key cover." },
  { slug: "zoom-pro-14-days", family: "zoom", colors: ["#2D8CFF", "#0F172A", "#EFF6FF"], alt: "Zoom Pro 14 days cover." },
  { slug: "zoom-pro-28-days", family: "zoom", colors: ["#0B5CFF", "#111827", "#DBEAFE"], alt: "Zoom Pro 28 days cover." },
];

function svgArt(colors) {
  const [a, b, bg] = colors;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="1200" height="1200" fill="${bg}"/>
  <circle cx="980" cy="180" r="220" fill="${a}" opacity="0.12"/>
  <circle cx="160" cy="1040" r="260" fill="${b}" opacity="0.10"/>
  <g filter="url(#s)" transform="translate(600 600)">
    <rect x="-210" y="-210" width="420" height="420" rx="72" fill="url(#g)"/>
    <circle cx="0" cy="0" r="88" fill="#ffffff" opacity="0.92"/>
    <circle cx="0" cy="0" r="42" fill="${a}"/>
  </g>
</svg>`);
}

const existing = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const bySlug = new Map(existing.map((e) => [String(e.slug), e]));

for (const spec of SPECS) {
  const canonical = `${spec.slug}.webp`;
  const dir = path.join(OUT, spec.family);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, canonical);
  const buf = await sharp(svgArt(spec.colors)).resize(1200, 1200).webp({ quality: 90 }).toBuffer();
  fs.writeFileSync(dest, buf);
  const publicPath = `/media/covers/${spec.family}/${canonical}`;
  bySlug.set(spec.slug, {
    slug: spec.slug,
    family: spec.family,
    canonical,
    publicPath,
    mode: "ARTWORK_ONLY",
    sourceFile: "generated-live-shop-cover.svg",
    alt: spec.alt,
    resolutionNote: "GENERATED_ABSTRACT",
    artWidth: 1200,
    artHeight: 1200,
    lowResReplacementRecommended: false,
  });
  console.log("COVER", spec.slug);
}

fs.writeFileSync(MANIFEST, JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n");

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, { prepare: false, max: 1 });

for (const spec of SPECS) {
  const products = await sql`SELECT id FROM products WHERE slug = ${spec.slug} LIMIT 1`;
  if (!products[0]) continue;
  const url = `/media/covers/${spec.family}/${spec.slug}.webp`;
  const media = await sql`
    SELECT id FROM product_media WHERE product_id = ${products[0].id} AND is_primary = true LIMIT 1
  `;
  if (media[0]) {
    await sql`UPDATE product_media SET url = ${url}, alt_text = ${spec.alt}, is_primary = true WHERE id = ${media[0].id}`;
  } else {
    await sql`
      INSERT INTO product_media (id, product_id, url, alt_text, is_primary, sort_order)
      VALUES (${randomUUID()}, ${products[0].id}, ${url}, ${spec.alt}, true, 0)
    `;
  }
  console.log("MEDIA", spec.slug);
}

await sql.end({ timeout: 5 });
console.log("DONE", SPECS.length);
