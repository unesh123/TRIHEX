/**
 * Generate covers for ALL PUBLIC+DRAFT products.
 * Preserves large curated local covers; regenerates missing / remote / tiny stubs.
 * Usage: node --env-file=.env.local scripts/generate-all-product-covers.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import postgres from "postgres";
import { randomUUID } from "crypto";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "media", "covers");
const MANIFEST = path.join(ROOT, "src/lib/catalog/product-cover-manifest.json");

const BRAND = {
  openai: { family: "chatgpt", colors: ["#10A37F", "#0B3B2E", "#ECFDF5"] },
  capcut: { family: "capcut", colors: ["#111827", "#3B82F6", "#F8FAFC"] },
  grok: { family: "grok", colors: ["#8B5CF6", "#0F172A", "#F5F3FF"] },
  gemini: { family: "gemini", colors: ["#4285F4", "#EA4335", "#EEF2FF"] },
  canva: { family: "canva", colors: ["#00C4CC", "#7D2AE7", "#ECFEFF"] },
  microsoft: { family: "microsoft", colors: ["#2563EB", "#0EA5E9", "#F8FAFC"] },
  adobe: { family: "adobe", colors: ["#FF0000", "#9A0C0C", "#FFF1F2"] },
  claude: { family: "claude", colors: ["#D97706", "#7C2D12", "#FFFBEB"] },
  elevenlabs: { family: "elevenlabs", colors: ["#111827", "#6366F1", "#EEF2FF"] },
  cursor: { family: "cursor", colors: ["#4B5563", "#6D4AFF", "#F8FAFC"] },
  youtube: { family: "youtube", colors: ["#FF0033", "#111827", "#FEF2F2"] },
  netflix: { family: "netflix", colors: ["#E50914", "#141414", "#FEF2F2"] },
  spotify: { family: "spotify", colors: ["#1DB954", "#191414", "#ECFDF5"] },
  apple: { family: "apple", colors: ["#FC3C44", "#111827", "#FFF1F2"] },
  amazon: { family: "amazon", colors: ["#00A8E1", "#0F172A", "#F0F9FF"] },
  nordvpn: { family: "nordvpn", colors: ["#4687FF", "#1E3A8A", "#EFF6FF"] },
  hma: { family: "hma", colors: ["#F97316", "#111827", "#FFF7ED"] },
  duolingo: { family: "duolingo", colors: ["#58CC02", "#1B5E20", "#F0FDF4"] },
  scribd: { family: "scribd", colors: ["#1E7B74", "#0F172A", "#ECFDF5"] },
  zoom: { family: "zoom", colors: ["#2D8CFF", "#0F172A", "#EFF6FF"] },
  perplexity: { family: "perplexity", colors: ["#20808D", "#0F172A", "#ECFEFF"] },
  coursera: { family: "coursera", colors: ["#0056D2", "#0F172A", "#EFF6FF"] },
  grammarly: { family: "grammarly", colors: ["#15C39A", "#0F766E", "#ECFDF5"] },
  notion: { family: "notion", colors: ["#111827", "#374151", "#F8FAFC"] },
  figma: { family: "figma", colors: ["#A259FF", "#F24E1E", "#F5F3FF"] },
  kling: { family: "kling", colors: ["#F59E0B", "#111827", "#FFFBEB"] },
  soundcloud: { family: "streaming", colors: ["#FF5500", "#111827", "#FFF7ED"] },
  replit: { family: "replit", colors: ["#F26207", "#0F172A", "#FFF7ED"] },
  gamma: { family: "gamma", colors: ["#7C3AED", "#111827", "#F5F3FF"] },
  manus: { family: "manus", colors: ["#0EA5E9", "#0F172A", "#F0F9FF"] },
  trihex: { family: "trihex", colors: ["#0F766E", "#134E4A", "#F0FDFA"] },
};

function brandFor(brandSlug, slug) {
  if (brandSlug && BRAND[brandSlug]) return BRAND[brandSlug];
  if (/chatgpt|gpt|openai/.test(slug)) return BRAND.openai;
  if (/capcut/.test(slug)) return BRAND.capcut;
  if (/grok/.test(slug)) return BRAND.grok;
  if (/gemini|veo|google/.test(slug)) return BRAND.gemini;
  return BRAND.trihex;
}

function motifFor(family) {
  if (family === "trihex" || family === "grok") return "hex";
  if (family === "streaming" || family === "spotify") return "wave";
  return "core";
}

function svgArt(colors, motif = "core") {
  const [a, b, bg] = colors;
  const motifSvg =
    motif === "hex"
      ? `<polygon points="0,-110 95,-55 95,55 0,110 -95,55 -95,-55" fill="#fff" opacity="0.92"/>
         <polygon points="0,-55 48,-28 48,28 0,55 -48,28 -48,-28" fill="${a}"/>`
      : motif === "wave"
        ? `<rect x="-180" y="-180" width="360" height="360" rx="64" fill="url(#g)"/>
           <path d="M-140 20 Q-70 -40 0 20 T140 20" stroke="#fff" stroke-width="18" fill="none" opacity="0.9"/>
           <path d="M-140 60 Q-70 0 0 60 T140 60" stroke="#fff" stroke-width="12" fill="none" opacity="0.55"/>`
        : `<rect x="-210" y="-210" width="420" height="420" rx="72" fill="url(#g)"/>
           <circle cx="0" cy="0" r="88" fill="#ffffff" opacity="0.92"/>
           <circle cx="0" cy="0" r="42" fill="${a}"/>`;

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="1200" height="1200" fill="${bg}"/>
  <circle cx="980" cy="160" r="240" fill="${a}" opacity="0.10"/>
  <circle cx="140" cy="1060" r="280" fill="${b}" opacity="0.10"/>
  <g filter="url(#s)" transform="translate(600 580)">${motifSvg}</g>
  <rect x="360" y="980" width="180" height="22" rx="11" fill="${a}" opacity="0.35"/>
  <rect x="560" y="980" width="280" height="22" rx="11" fill="${b}" opacity="0.22"/>
</svg>`);
}

/** Resolve best existing local cover path for a product (any family folder). */
function findExistingLocal(slug) {
  if (!fs.existsSync(OUT)) return null;
  for (const family of fs.readdirSync(OUT)) {
    const dir = path.join(OUT, family);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".webp") && !name.endsWith(".png")) continue;
      if (name.startsWith(slug) || name.replace(/\.(webp|png)$/, "") === slug) {
        const full = path.join(dir, name);
        return {
          full,
          publicPath: `/media/covers/${family}/${name}`,
          family,
          canonical: name,
          size: fs.statSync(full).size,
        };
      }
    }
  }
  return null;
}

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  prepare: false,
  max: 1,
});

const products = await sql`
  SELECT p.id, p.slug, p.name, p.product_status, b.slug as brand_slug
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  WHERE p.product_status IN ('PUBLIC', 'DRAFT')
  ORDER BY p.name
`;

const existingManifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const bySlug = new Map(existingManifest.map((e) => [String(e.slug), e]));

let generated = 0;
let preserved = 0;

for (const p of products) {
  const brand = brandFor(p.brand_slug, p.slug);
  const family = brand.family;
  const canonical = `${p.slug}.webp`;
  const dir = path.join(OUT, family);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, canonical);
  const alt = `${p.name} product cover artwork.`;

  const media = await sql`
    SELECT id, url FROM product_media
    WHERE product_id = ${p.id} AND is_primary = true
    LIMIT 1
  `;
  const currentUrl = media[0]?.url ?? null;
  const found = findExistingLocal(p.slug);
  const destExists = fs.existsSync(dest);
  const destSize = destExists ? fs.statSync(dest).size : 0;
  const bestLocal = found && found.size >= destSize ? found : destExists
    ? {
        full: dest,
        publicPath: `/media/covers/${family}/${canonical}`,
        family,
        canonical,
        size: destSize,
      }
    : found;

  // Preserve solid curated artwork (>= 20KB local)
  const keep =
    bestLocal &&
    bestLocal.size >= 20_000 &&
    !(currentUrl?.startsWith("http"));

  let publicPath;
  if (keep) {
    publicPath = bestLocal.publicPath;
    bySlug.set(p.slug, {
      slug: p.slug,
      family: bestLocal.family,
      canonical: bestLocal.canonical,
      publicPath,
      mode: "ARTWORK_ONLY",
      sourceFile: "preserved-cover",
      alt,
      resolutionNote: "PRESERVED",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    });
    preserved++;
    console.log("KEEP", p.slug, publicPath);
  } else {
    const buf = await sharp(svgArt(brand.colors, motifFor(family)))
      .resize(1200, 1200)
      .toColorspace("srgb")
      .webp({ quality: 92 })
      .toBuffer();
    fs.writeFileSync(dest, buf);
    publicPath = `/media/covers/${family}/${canonical}`;
    bySlug.set(p.slug, {
      slug: p.slug,
      family,
      canonical,
      publicPath,
      mode: "ARTWORK_ONLY",
      sourceFile: "generated-all-product-covers.svg",
      alt,
      resolutionNote: "GENERATED_ABSTRACT",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    });
    generated++;
    console.log("GEN", p.slug, "→", publicPath);
  }

  if (media[0]) {
    await sql`
      UPDATE product_media
      SET url = ${publicPath}, alt_text = ${alt}, is_primary = true
      WHERE id = ${media[0].id}
    `;
  } else {
    await sql`
      INSERT INTO product_media (id, product_id, url, alt_text, is_primary, sort_order)
      VALUES (${randomUUID()}, ${p.id}, ${publicPath}, ${alt}, true, 0)
    `;
  }
}

fs.writeFileSync(
  MANIFEST,
  JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n",
);

console.log(
  `\nDone. Generated ${generated} · preserved ${preserved} · total ${products.length}`,
);
await sql.end({ timeout: 5 });
