/**
 * Composite premium AI brand art + product-specific text overlays
 * for every SKU that still has a weak/generic cover look.
 *
 * Usage: node --env-file=.env.local scripts/apply-premium-brand-covers.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import postgres from "postgres";
import { randomUUID } from "crypto";

const ROOT = process.cwd();
const ART_DIR = path.join(ROOT, "assets", "ai-brand-posters");
const OUT = path.join(ROOT, "public", "media", "covers");
const MANIFEST = path.join(ROOT, "src/lib/catalog/product-cover-manifest.json");

const BRAND_META = {
  replit: { file: "poster-brand-replit.png", family: "replit", label: "REPLIT", accent: "#F26207" },
  coursera: { file: "poster-brand-coursera.png", family: "coursera", label: "COURSERA", accent: "#0056D2" },
  manus: { file: "poster-brand-manus.png", family: "manus", label: "MANUS", accent: "#22D3EE" },
  perplexity: { file: "poster-brand-perplexity.png", family: "perplexity", label: "PERPLEXITY", accent: "#20B8C9" },
  elevenlabs: { file: "poster-brand-elevenlabs.png", family: "elevenlabs", label: "ELEVENLABS", accent: "#8B5CF6" },
  notion: { file: "poster-brand-notion.png", family: "notion", label: "NOTION", accent: "#FFFFFF" },
  kling: { file: "poster-brand-kling.png", family: "kling", label: "KLING AI", accent: "#F59E0B" },
  figma: { file: "poster-brand-figma.png", family: "figma", label: "FIGMA", accent: "#A259FF" },
  cursor: { file: "poster-brand-cursor.png", family: "cursor", label: "CURSOR", accent: "#A78BFA" },
  adobe: { file: "poster-brand-adobe.png", family: "adobe", label: "ADOBE", accent: "#FF2D2D" },
  gamma: { file: "poster,brand-gamma.png", family: "gamma", label: "GAMMA", accent: "#A78BFA" },
  grammarly: { file: "poster-brand-grammarly.png", family: "grammarly", label: "GRAMMARLY", accent: "#15C39A" },
  youtube: { file: "poster-brand-youtube.png", family: "youtube", label: "YOUTUBE", accent: "#FF0033" },
  scribd: { file: "poster-brand-scribd.png", family: "scribd", label: "SCRIBD", accent: "#1E7B74" },
  soundcloud: { file: "poster-brand-soundcloud.png", family: "streaming", label: "SOUNDCLOUD", accent: "#FF5500" },
  hma: { file: "poster-brand-hma.png", family: "hma", label: "HMA VPN", accent: "#F97316" },
  claude: { file: "poster-brand-claude.png", family: "claude", label: "CLAUDE", accent: "#D97706" },
  vidiq: { file: "poster-brand-vidiq.png", family: "youtube", label: "VIDIQ", accent: "#3B82F6" },
  trihex: { file: "poster-brand-trihex.png", family: "trihex", label: "TRIHEX", accent: "#14B8A6" },
};

// fix typo above for gamma
BRAND_META.gamma.file = "poster-brand-gamma.png";

function esc(t) {
  return String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title, max = 24) {
  const clean = title
    .replace(/\s*[—–-]\s*/g, " — ")
    .replace(/\s+/g, " ")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .trim();
  if (clean.length <= max) return [clean];
  const words = clean.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function durationLabel(name, durationValue, durationUnit) {
  if (durationValue != null && durationUnit) {
    const u = String(durationUnit).toUpperCase();
    if (u.startsWith("DAY")) return `${durationValue} DAY${durationValue > 1 ? "S" : ""}`;
    if (u.startsWith("WEEK")) return `${durationValue} WEEK${durationValue > 1 ? "S" : ""}`;
    if (u.startsWith("MONTH")) return `${durationValue} MONTH${durationValue > 1 ? "S" : ""}`;
    if (u.startsWith("YEAR")) return `${durationValue} YEAR${durationValue > 1 ? "S" : ""}`;
    if (u.includes("CREDIT")) {
      const n = Number(durationValue);
      if (n >= 1000) return `${Math.round(n / 1000)}K CREDITS`;
      return `${n} CREDITS`;
    }
    if (u.includes("ONE") || u.includes("SESSION")) return "ONE-TIME";
  }
  const m = name.match(/(\d[\d,]*)\s*(day|days|month|months|year|years|week|weeks|credits?)/i);
  if (m) return `${m[1]} ${m[2]}`.toUpperCase();
  if (/lifetime/i.test(name)) return "LIFETIME";
  return "PACKAGE";
}

function durationSubtitle(badge) {
  const s = badge.toLowerCase();
  if (s.includes("credit")) return badge.replace(/CREDITS?/i, (x) => x[0] + x.slice(1).toLowerCase());
  return badge
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function brandKeyFor(brandSlug, slug, name) {
  const s = `${brandSlug || ""} ${slug} ${name}`.toLowerCase();
  if (/vidiq/.test(s)) return "vidiq";
  if (/antigravity|cursor/.test(s)) return "cursor";
  if (/replit/.test(s)) return "replit";
  if (/coursera/.test(s)) return "coursera";
  if (/manus/.test(s)) return "manus";
  if (/perplexity/.test(s)) return "perplexity";
  if (/eleven/.test(s)) return "elevenlabs";
  if (/notion/.test(s)) return "notion";
  if (/kling/.test(s)) return "kling";
  if (/figma/.test(s)) return "figma";
  if (/adobe/.test(s)) return "adobe";
  if (/gamma/.test(s)) return "gamma";
  if (/grammarly/.test(s)) return "grammarly";
  if (/youtube|premium family/.test(s) && !/vidiq/.test(s)) return "youtube";
  if (/scribd/.test(s)) return "scribd";
  if (/soundcloud/.test(s)) return "soundcloud";
  if (/hma/.test(s)) return "hma";
  if (/claude/.test(s)) return "claude";
  if (/trihex|prompt starter|business ai setup|workflow automation/.test(s))
    return "trihex";
  if (brandSlug && BRAND_META[brandSlug]) return brandSlug;
  return null;
}

function overlaySvg({ title, badge, brandLabel, accent, subtitle }) {
  const lines = wrapTitle(title);
  const fontSize = lines.length > 2 ? 40 : lines.length > 1 ? 46 : 52;
  const lineSvg = lines
    .map(
      (line, i) =>
        `<text x="72" y="${780 + i * (fontSize + 8)}" font-family="Arial Black,Arial,sans-serif" font-size="${fontSize}" font-weight="800" fill="#ffffff">${esc(line)}</text>`,
    )
    .join("\n");
  const badgeW = Math.max(140, badge.length * 14 + 36);
  const brandW = Math.max(120, brandLabel.length * 11 + 32);
  const ink = accent === "#FFFFFF" ? "#0A0A0A" : "#061018";

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="35%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="70%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.82"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#fade)"/>
  <rect x="56" y="56" width="${badgeW}" height="44" rx="22" fill="#ffffff"/>
  <text x="${56 + badgeW / 2}" y="85" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="800" fill="#0A0A0A">${esc(badge)}</text>
  <rect x="72" y="720" width="${brandW}" height="34" rx="17" fill="${accent}"/>
  <text x="${72 + brandW / 2}" y="743" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="800" fill="${ink}">${esc(brandLabel)}</text>
  ${lineSvg}
  <text x="72" y="${780 + lines.length * (fontSize + 8) + 8}" font-family="Arial,sans-serif" font-size="30" font-weight="600" fill="${accent}">${esc(subtitle)}</text>
  <text x="72" y="1140" font-family="Arial,sans-serif" font-size="22" font-weight="600" fill="#ffffff" opacity="0.55">TRIHEX DIGITAL · Nepal</text>
</svg>`);
}

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  prepare: false,
  max: 1,
});

const products = await sql`
  SELECT p.id, p.slug, p.name, b.slug as brand_slug,
         v.duration_value, v.duration_unit
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN LATERAL (
    SELECT duration_value, duration_unit
    FROM product_variants
    WHERE product_id = p.id AND active = true
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 1
  ) v ON true
  WHERE p.product_status IN ('PUBLIC', 'DRAFT')
  ORDER BY p.name
`;

const existingManifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const bySlug = new Map(existingManifest.map((e) => [String(e.slug), e]));

let done = 0;
let skipped = 0;

for (const p of products) {
  if (p.slug === "trihex-test-sku") {
    skipped++;
    continue;
  }
  const key = brandKeyFor(p.brand_slug, p.slug, p.name);
  if (!key || !BRAND_META[key]) {
    skipped++;
    continue;
  }
  const meta = BRAND_META[key];
  const artPath = path.join(ART_DIR, meta.file);
  if (!fs.existsSync(artPath)) {
    console.log("MISSING ART", meta.file, "for", p.slug);
    skipped++;
    continue;
  }

  const badge = durationLabel(p.name, p.duration_value, p.duration_unit);
  const subtitle = durationSubtitle(badge);
  // Prefer clean display title without warranty notes
  const displayTitle = p.name
    .replace(/\s*\([^)]*warranty[^)]*\)/gi, "")
    .replace(/\s*\(No Warranty\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const overlay = overlaySvg({
    title: displayTitle,
    badge,
    brandLabel: meta.label,
    accent: meta.accent,
    subtitle,
  });

  const dir = path.join(OUT, meta.family);
  fs.mkdirSync(dir, { recursive: true });
  const canonical = `${p.slug}.webp`;
  const dest = path.join(dir, canonical);
  const publicPath = `/media/covers/${meta.family}/${canonical}`;
  const alt = `${p.name} premium product poster.`;

  const base = await sharp(artPath)
    .resize(1200, 1200, { fit: "cover", position: "centre" })
    .toColorspace("srgb")
    .png()
    .toBuffer();

  const composed = await sharp(base)
    .composite([{ input: await sharp(overlay).png().toBuffer(), top: 0, left: 0 }])
    .webp({ quality: 92 })
    .toBuffer();

  fs.writeFileSync(dest, composed);

  bySlug.set(p.slug, {
    slug: p.slug,
    family: meta.family,
    canonical,
    publicPath,
    mode: "FULL_CARD",
    sourceFile: meta.file,
    alt,
    resolutionNote: "AI_BRAND_COMPOSITE",
    artWidth: 1200,
    artHeight: 1200,
    lowResReplacementRecommended: false,
  });

  const media = await sql`
    SELECT id FROM product_media
    WHERE product_id = ${p.id} AND is_primary = true
    LIMIT 1
  `;
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

  done++;
  console.log("PREMIUM", p.slug, "←", meta.file);
}

fs.writeFileSync(
  MANIFEST,
  JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n",
);

console.log(`\nApplied ${done} premium covers (${skipped} skipped)`);
await sql.end({ timeout: 5 });
