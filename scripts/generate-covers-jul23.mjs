/**
 * Generate covers for Jul 23 new/updated storefront products + upsert product_media.
 * Usage: node --env-file=.env.local scripts/generate-covers-jul23.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import postgres from "postgres";
import { randomUUID } from "crypto";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "media", "covers");
const MANIFEST = path.join(
  ROOT,
  "src",
  "lib",
  "catalog",
  "product-cover-manifest.json",
);

const SPECS = [
  {
    slug: "netflix-private-1-month",
    family: "netflix",
    canonical: "netflix-private-1-month.webp",
    alt: "Netflix private profile abstract cover artwork.",
    colors: ["#E50914", "#141414", "#FEF2F2"],
  },
  {
    slug: "youtube-premium-family-1-month",
    family: "youtube",
    canonical: "youtube-premium-family-1-month.webp",
    alt: "YouTube Premium family invite abstract cover artwork.",
    colors: ["#FF0033", "#111827", "#FEF2F2"],
  },
  {
    slug: "adobe-cc-4-months",
    family: "adobe",
    canonical: "adobe-cc-4-months.webp",
    alt: "Adobe Creative Cloud four-month abstract cover artwork.",
    colors: ["#FF0000", "#9A0C0C", "#FFF1F2"],
  },
  {
    slug: "nordvpn-3-months",
    family: "nordvpn",
    canonical: "nordvpn-3-months.webp",
    alt: "NordVPN three-month abstract cover artwork.",
    colors: ["#4687FF", "#1E3A8A", "#EFF6FF"],
  },
  {
    slug: "spotify-premium-3-months",
    family: "spotify",
    canonical: "spotify-premium-3-months.webp",
    alt: "Spotify Premium three-month abstract cover artwork.",
    colors: ["#1DB954", "#191414", "#ECFDF5"],
  },
  {
    slug: "apple-music-6-months",
    family: "apple",
    canonical: "apple-music-6-months.webp",
    alt: "Apple Music six-month abstract cover artwork.",
    colors: ["#FC3C44", "#111827", "#FFF1F2"],
  },
  {
    slug: "grok-super-1-month",
    family: "grok",
    canonical: "grok-super-1-month.webp",
    alt: "Grok Super one-month abstract orbital cover artwork.",
    colors: ["#A78BFA", "#111827", "#F5F3FF"],
  },
  {
    slug: "grok-super-12-months",
    family: "grok",
    canonical: "grok-super-12-months.webp",
    alt: "Grok Super twelve-month abstract orbital cover artwork.",
    colors: ["#8B5CF6", "#0F172A", "#F5F3FF"],
  },
  {
    slug: "capcut-team-pro-1-month-7-seats",
    family: "capcut",
    canonical: "capcut-team-pro-1-month-7-seats.webp",
    alt: "CapCut Team Pro seven-seat abstract cover artwork.",
    colors: ["#000000", "#3B82F6", "#F8FAFC"],
  },
  {
    slug: "capcut-team-7-seats",
    family: "capcut",
    canonical: "capcut-team-7-seats.webp",
    alt: "CapCut team method abstract cover artwork.",
    colors: ["#111827", "#60A5FA", "#EFF6FF"],
  },
  {
    slug: "claude-max-x20-1-month",
    family: "claude",
    canonical: "claude-max-x20-1-month.webp",
    alt: "Claude Max x20 abstract cover artwork.",
    colors: ["#D97706", "#7C2D12", "#FFFBEB"],
  },
  {
    slug: "perplexity-pro-1-year",
    family: "perplexity",
    canonical: "perplexity-pro-1-year.webp",
    alt: "Perplexity Pro abstract cover artwork.",
    colors: ["#20808D", "#0F172A", "#ECFEFF"],
  },
  {
    slug: "veo-3-ultra-45k-1-month",
    family: "gemini",
    canonical: "veo-3-ultra-45k-1-month.webp",
    alt: "Veo 3 Ultra credits abstract cover artwork.",
    colors: ["#4285F4", "#EA4335", "#EEF2FF"],
  },
  {
    slug: "google-ai-ultra-25k-1-month",
    family: "gemini",
    canonical: "google-ai-ultra-25k-1-month.webp",
    alt: "Google AI Ultra credits abstract cover artwork.",
    colors: ["#34A853", "#4285F4", "#F0FDF4"],
  },
  {
    slug: "prime-video-1-month",
    family: "amazon",
    canonical: "prime-video-1-month.webp",
    alt: "Amazon Prime Video one-month abstract cover artwork.",
    colors: ["#00A8E1", "#0F172A", "#F0F9FF"],
  },
  {
    slug: "prime-video-6-months",
    family: "amazon",
    canonical: "prime-video-6-months.webp",
    alt: "Amazon Prime Video six-month abstract cover artwork.",
    colors: ["#00A8E1", "#1E3A8A", "#EFF6FF"],
  },
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
    <rect x="-150" y="150" width="120" height="28" rx="14" fill="#ffffff" opacity="0.55"/>
    <rect x="40" y="150" width="110" height="28" rx="14" fill="#ffffff" opacity="0.35"/>
  </g>
</svg>`);
}

const existing = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const bySlug = new Map(existing.map((e) => [String(e.slug), e]));

for (const spec of SPECS) {
  const dir = path.join(OUT, spec.family);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, spec.canonical);
  const buf = await sharp(svgArt(spec.colors))
    .resize(1200, 1200)
    .toColorspace("srgb")
    .webp({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(dest, buf);
  const publicPath = `/media/covers/${spec.family}/${spec.canonical}`;
  bySlug.set(spec.slug, {
    slug: spec.slug,
    family: spec.family,
    canonical: spec.canonical,
    publicPath,
    mode: "ARTWORK_ONLY",
    sourceFile: "generated-jul23-cover.svg",
    alt: spec.alt,
    resolutionNote: "GENERATED_ABSTRACT",
    artWidth: 1200,
    artHeight: 1200,
    lowResReplacementRecommended: false,
  });
  console.log("COVER", spec.slug);
}

fs.writeFileSync(MANIFEST, JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n");

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  prepare: false,
  max: 1,
});

for (const spec of SPECS) {
  const products = await sql`SELECT id FROM products WHERE slug = ${spec.slug} LIMIT 1`;
  if (!products[0]) {
    console.log("SKIP media (no product)", spec.slug);
    continue;
  }
  const url = `/media/covers/${spec.family}/${spec.canonical}`;
  const existingMedia = await sql`
    SELECT id FROM product_media
    WHERE product_id = ${products[0].id} AND is_primary = true
    LIMIT 1
  `;
  if (existingMedia[0]) {
    await sql`
      UPDATE product_media
      SET url = ${url}, alt_text = ${spec.alt}, is_primary = true
      WHERE id = ${existingMedia[0].id}
    `;
    console.log("MEDIA UPDATE", spec.slug);
  } else {
    await sql`
      INSERT INTO product_media (
        id, product_id, url, alt_text, is_primary, sort_order
      ) VALUES (
        ${randomUUID()}, ${products[0].id}, ${url}, ${spec.alt}, true, 0
      )
    `;
    console.log("MEDIA INSERT", spec.slug);
  }
}

await sql.end({ timeout: 5 });
console.log("DONE covers", SPECS.length);
