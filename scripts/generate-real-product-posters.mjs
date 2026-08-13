/**
 * Replace generic circle placeholders with REAL full-card product posters
 * (SoundCloud-style: dark brand art + product title + duration).
 *
 * Usage: node --env-file=.env.local scripts/generate-real-product-posters.mjs
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
  openai: { family: "chatgpt", a: "#10A37F", b: "#0D9488", ink: "#041F1A", label: "OpenAI" },
  capcut: { family: "capcut", a: "#3B82F6", b: "#1D4ED8", ink: "#020617", label: "CapCut" },
  grok: { family: "grok", a: "#A78BFA", b: "#7C3AED", ink: "#0B0618", label: "xAI Grok" },
  gemini: { family: "gemini", a: "#4285F4", b: "#EA4335", ink: "#0B1220", label: "Google Gemini" },
  canva: { family: "canva", a: "#00C4CC", b: "#7D2AE7", ink: "#041416", label: "Canva" },
  microsoft: { family: "microsoft", a: "#00A4EF", b: "#7FBA00", ink: "#061018", label: "Microsoft" },
  adobe: { family: "adobe", a: "#FF0000", b: "#9A0C0C", ink: "#1A0505", label: "Adobe" },
  claude: { family: "claude", a: "#D97706", b: "#C2410C", ink: "#1A0C04", label: "Claude" },
  elevenlabs: { family: "elevenlabs", a: "#6366F1", b: "#111827", ink: "#07070F", label: "ElevenLabs" },
  cursor: { family: "cursor", a: "#6D4AFF", b: "#4B5563", ink: "#0A0A12", label: "Cursor" },
  youtube: { family: "youtube", a: "#FF0033", b: "#99001F", ink: "#140308", label: "YouTube" },
  netflix: { family: "netflix", a: "#E50914", b: "#831010", ink: "#120204", label: "Netflix" },
  spotify: { family: "spotify", a: "#1DB954", b: "#0F7A34", ink: "#041208", label: "Spotify" },
  apple: { family: "apple", a: "#FC3C44", b: "#9F1239", ink: "#120408", label: "Apple" },
  amazon: { family: "amazon", a: "#00A8E1", b: "#232F3E", ink: "#050B12", label: "Prime Video" },
  nordvpn: { family: "nordvpn", a: "#4687FF", b: "#1E3A8A", ink: "#050B18", label: "NordVPN" },
  hma: { family: "hma", a: "#F97316", b: "#9A3412", ink: "#140804", label: "HMA VPN" },
  duolingo: { family: "duolingo", a: "#58CC02", b: "#1B5E20", ink: "#061204", label: "Duolingo" },
  scribd: { family: "scribd", a: "#1E7B74", b: "#0F3D3A", ink: "#041210", label: "Scribd" },
  zoom: { family: "zoom", a: "#2D8CFF", b: "#0B5CFF", ink: "#040A16", label: "Zoom" },
  perplexity: { family: "perplexity", a: "#20808D", b: "#0F3D45", ink: "#041012", label: "Perplexity" },
  coursera: { family: "coursera", a: "#0056D2", b: "#003A8C", ink: "#040A16", label: "Coursera" },
  grammarly: { family: "grammarly", a: "#15C39A", b: "#0F766E", ink: "#041210", label: "Grammarly" },
  notion: { family: "notion", a: "#FFFFFF", b: "#9CA3AF", ink: "#0A0A0A", label: "Notion" },
  figma: { family: "figma", a: "#A259FF", b: "#F24E1E", ink: "#120814", label: "Figma" },
  kling: { family: "kling", a: "#F59E0B", b: "#B45309", ink: "#120A04", label: "Kling AI" },
  soundcloud: { family: "streaming", a: "#FF5500", b: "#9A3412", ink: "#120804", label: "SoundCloud" },
  replit: { family: "replit", a: "#F26207", b: "#9A3412", ink: "#120804", label: "Replit" },
  gamma: { family: "gamma", a: "#7C3AED", b: "#4C1D95", ink: "#0B0618", label: "Gamma" },
  manus: { family: "manus", a: "#0EA5E9", b: "#0369A1", ink: "#040A12", label: "Manus" },
  trihex: { family: "trihex", a: "#14B8A6", b: "#0F766E", ink: "#041210", label: "TRIHEX" },
};

function brandFor(brandSlug, slug) {
  if (brandSlug && BRAND[brandSlug]) return BRAND[brandSlug];
  const s = slug.toLowerCase();
  if (/chatgpt|gpt|openai/.test(s)) return BRAND.openai;
  if (/capcut/.test(s)) return BRAND.capcut;
  if (/grok/.test(s)) return BRAND.grok;
  if (/gemini|veo|google|pixel|cdk/.test(s)) return BRAND.gemini;
  if (/prime|amazon/.test(s)) return BRAND.amazon;
  if (/youtube|vidiq/.test(s)) return BRAND.youtube;
  if (/windows|office|outlook|microsoft|365/.test(s)) return BRAND.microsoft;
  if (/nord/.test(s)) return BRAND.nordvpn;
  if (/hma/.test(s)) return BRAND.hma;
  if (/spotify/.test(s)) return BRAND.spotify;
  if (/netflix/.test(s)) return BRAND.netflix;
  if (/apple/.test(s)) return BRAND.apple;
  if (/canva/.test(s)) return BRAND.canva;
  if (/zoom/.test(s)) return BRAND.zoom;
  if (/duolingo/.test(s)) return BRAND.duolingo;
  if (/scribd/.test(s)) return BRAND.scribd;
  if (/perplexity/.test(s)) return BRAND.perplexity;
  if (/adobe/.test(s)) return BRAND.adobe;
  if (/claude/.test(s)) return BRAND.claude;
  return BRAND.trihex;
}

function esc(t) {
  return String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title, max = 22) {
  const clean = title
    .replace(/\s*[—–-]\s*/g, " — ")
    .replace(/\s+/g, " ")
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

function durationFrom(name, durationValue, durationUnit) {
  if (durationValue != null && durationUnit) {
    const u = String(durationUnit).toLowerCase();
    if (u.startsWith("day")) return `${durationValue} Day${durationValue > 1 ? "s" : ""}`;
    if (u.startsWith("week")) return `${durationValue} Week${durationValue > 1 ? "s" : ""}`;
    if (u.startsWith("month")) return `${durationValue} Month${durationValue > 1 ? "s" : ""}`;
    if (u.startsWith("year")) return `${durationValue} Year${durationValue > 1 ? "s" : ""}`;
    if (u.includes("one")) return "One-time";
  }
  const m = name.match(/(\d+)\s*(day|days|month|months|year|years|week|weeks)/i);
  if (m) return `${m[1]} ${m[2]}`;
  return "Digital package";
}

function motif(brand, slug) {
  const { a, b } = brand;
  const s = slug.toLowerCase();
  if (/netflix/.test(s)) {
    return `<text x="600" y="520" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="280" font-weight="900" fill="${a}">N</text>`;
  }
  if (/youtube|vidiq/.test(s)) {
    return `<rect x="360" y="360" width="480" height="320" rx="80" fill="${a}"/>
      <path d="M540 430 L720 520 L540 610 Z" fill="#fff"/>`;
  }
  if (/spotify/.test(s)) {
    return `<circle cx="600" cy="480" r="180" fill="${a}"/>
      <path d="M490 430 Q600 390 710 440" stroke="#041208" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="M500 490 Q600 455 700 500" stroke="#041208" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M515 545 Q600 515 685 555" stroke="#041208" stroke-width="14" fill="none" stroke-linecap="round"/>`;
  }
  if (/capcut/.test(s)) {
    return `<rect x="380" y="320" width="440" height="360" rx="48" fill="${a}"/>
      <rect x="430" y="380" width="140" height="240" rx="20" fill="#fff" opacity="0.95"/>
      <rect x="620" y="380" width="140" height="240" rx="20" fill="#fff" opacity="0.7"/>
      <circle cx="600" cy="500" r="36" fill="${b}"/>`;
  }
  if (/windows/.test(s)) {
    return `<g transform="translate(600 480)">
      <rect x="-170" y="-170" width="155" height="155" rx="18" fill="#F25022"/>
      <rect x="20" y="-170" width="155" height="155" rx="18" fill="#7FBA00"/>
      <rect x="-170" y="20" width="155" height="155" rx="18" fill="#00A4EF"/>
      <rect x="20" y="20" width="155" height="155" rx="18" fill="#FFB900"/>
    </g>`;
  }
  if (/zoom/.test(s)) {
    return `<rect x="340" y="360" width="400" height="280" rx="56" fill="${a}"/>
      <path d="M760 420 L900 360 L900 640 L760 580 Z" fill="${b}"/>
      <circle cx="540" cy="500" r="54" fill="#fff" opacity="0.9"/>`;
  }
  if (/nord|hma|vpn/.test(s)) {
    return `<path d="M600 280 C760 280 880 380 880 520 C880 680 720 820 600 880 C480 820 320 680 320 520 C320 380 440 280 600 280 Z" fill="${a}"/>
      <path d="M500 520 L570 590 L720 430" stroke="#fff" stroke-width="40" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (/duolingo/.test(s)) {
    return `<ellipse cx="600" cy="500" rx="200" ry="220" fill="${a}"/>
      <circle cx="540" cy="450" r="28" fill="#041208"/>
      <circle cx="660" cy="450" r="28" fill="#041208"/>
      <path d="M520 560 Q600 620 680 560" stroke="#041208" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  }
  if (/canva/.test(s)) {
    return `<circle cx="600" cy="480" r="190" fill="url(#g2)"/>
      <text x="600" y="545" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="200" font-weight="900" fill="#fff">C</text>`;
  }
  if (/chatgpt|gpt|openai/.test(s)) {
    return `<circle cx="600" cy="470" r="190" fill="${a}"/>
      <g fill="none" stroke="#041F1A" stroke-width="18" stroke-linecap="round">
        <path d="M520 400 Q600 340 680 400"/>
        <path d="M500 470 Q600 410 700 470"/>
        <path d="M520 540 Q600 480 680 540"/>
        <path d="M560 360 Q620 470 560 580"/>
        <path d="M640 360 Q580 470 640 580"/>
      </g>`;
  }
  if (/grok/.test(s)) {
    return `<circle cx="600" cy="460" r="70" fill="${a}"/>
      <ellipse cx="600" cy="460" rx="220" ry="70" fill="none" stroke="${a}" stroke-width="18" opacity="0.85" transform="rotate(-20 600 460)"/>
      <ellipse cx="600" cy="460" rx="220" ry="70" fill="none" stroke="${b}" stroke-width="14" opacity="0.7" transform="rotate(35 600 460)"/>
      <ellipse cx="600" cy="460" rx="160" ry="50" fill="none" stroke="#fff" stroke-width="10" opacity="0.35" transform="rotate(80 600 460)"/>`;
  }
  if (/gemini|google|veo|pixel|cdk/.test(s)) {
    return `<g transform="translate(600 470)">
      <path d="M0 -160 L45 -45 L160 0 L45 45 L0 160 L-45 45 L-160 0 L-45 -45 Z" fill="${a}"/>
      <path d="M0 -90 L25 -25 L90 0 L25 25 L0 90 L-25 25 L-90 0 L-25 -25 Z" fill="#fff" opacity="0.9"/>
    </g>`;
  }
  if (/apple/.test(s)) {
    return `<g transform="translate(600 470)" fill="${a}">
      <path d="M40 -120 C70 -160 120 -150 130 -110 C90 -100 60 -70 40 -120 Z"/>
      <path d="M-20 20 C-40 -80 40 -130 110 -80 C160 -40 150 60 90 120 C60 150 30 160 0 140 C-30 160 -60 150 -90 120 C-150 60 -140 -20 -90 -60 C-50 -100 0 -60 -20 20 Z"/>
    </g>`;
  }
  if (/prime|amazon/.test(s)) {
    return `<text x="600" y="430" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="120" font-weight="900" fill="#fff">prime</text>
      <path d="M360 500 Q600 620 840 500" stroke="${a}" stroke-width="28" fill="none" stroke-linecap="round"/>
      <path d="M780 470 L860 500 L780 540" fill="${a}"/>`;
  }
  if (/microsoft|365|office|outlook/.test(s)) {
    return `<g transform="translate(520 420)">
      <rect width="90" height="90" fill="#F25022"/>
      <rect x="100" width="90" height="90" fill="#7FBA00"/>
      <rect y="100" width="90" height="90" fill="#00A4EF"/>
      <rect x="100" y="100" width="90" height="90" fill="#FFB900"/>
    </g>`;
  }
  if (/perplexity/.test(s)) {
    return `<circle cx="600" cy="470" r="170" fill="none" stroke="${a}" stroke-width="28"/>
      <circle cx="600" cy="470" r="90" fill="${a}"/>
      <circle cx="600" cy="470" r="36" fill="#041012"/>`;
  }
  if (/scribd/.test(s)) {
    return `<rect x="420" y="300" width="360" height="400" rx="28" fill="${a}"/>
      <rect x="460" y="360" width="280" height="28" rx="10" fill="#fff" opacity="0.9"/>
      <rect x="460" y="420" width="240" height="22" rx="10" fill="#fff" opacity="0.7"/>
      <rect x="460" y="470" width="260" height="22" rx="10" fill="#fff" opacity="0.55"/>
      <rect x="460" y="520" width="200" height="22" rx="10" fill="#fff" opacity="0.4"/>`;
  }
  if (/soundcloud/.test(s)) {
    const bars = Array.from({ length: 14 }, (_, i) => {
      const h = 60 + ((i * 37) % 180);
      return `<rect x="${360 + i * 35}" y="${500 - h / 2}" width="22" height="${h}" rx="11" fill="${i % 2 ? "#fff" : a}"/>`;
    }).join("");
    return bars;
  }
  if (/adobe/.test(s)) {
    return `<rect x="390" y="340" width="420" height="300" rx="36" fill="${a}"/>
      <text x="600" y="540" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="160" font-weight="900" fill="#fff">Aa</text>`;
  }
  // default branded orb
  return `<circle cx="600" cy="470" r="180" fill="url(#g2)"/>
    <circle cx="600" cy="470" r="90" fill="#fff" opacity="0.92"/>
    <circle cx="600" cy="470" r="42" fill="${a}"/>`;
}

function posterSvg({ name, duration, brand, slug }) {
  const lines = wrapTitle(name.replace(/\s*\(.*?\)\s*$/, "").trim());
  const lineSvg = lines
    .map(
      (line, i) =>
        `<text x="80" y="${820 + i * 58}" font-family="Arial Black,Arial,sans-serif" font-size="${lines.length > 2 ? 42 : 52}" font-weight="800" fill="#ffffff">${esc(line)}</text>`,
    )
    .join("\n");

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brand.ink}"/>
      <stop offset="55%" stop-color="${brand.ink}"/>
      <stop offset="100%" stop-color="${brand.b}"/>
    </linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brand.a}"/>
      <stop offset="100%" stop-color="${brand.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="45%">
      <stop offset="0%" stop-color="${brand.a}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${brand.ink}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <rect width="1200" height="1200" fill="url(#glow)"/>
  <circle cx="1040" cy="120" r="220" fill="${brand.a}" opacity="0.12"/>
  <circle cx="80" cy="1080" r="260" fill="${brand.b}" opacity="0.18"/>
  ${motif(brand, slug)}
  <rect x="80" y="700" width="220" height="36" rx="18" fill="${brand.a}"/>
  <text x="190" y="724" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#061018">${esc(brand.label.toUpperCase())}</text>
  ${lineSvg}
  <text x="80" y="${820 + lines.length * 58 + 10}" font-family="Arial,sans-serif" font-size="34" font-weight="600" fill="${brand.a}">${esc(duration)}</text>
  <text x="80" y="1140" font-family="Arial,sans-serif" font-size="22" font-weight="600" fill="#ffffff" opacity="0.55">TRIHEX DIGITAL · Nepal</text>
</svg>`);
}

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  prepare: false,
  max: 1,
});

const products = await sql`
  SELECT p.id, p.slug, p.name, p.product_status,
         b.slug as brand_slug,
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
for (const p of products) {
  // Skip internal test SKU visual polish less critical but still do it
  const brand = brandFor(p.brand_slug, p.slug);
  const duration = durationFrom(p.name, p.duration_value, p.duration_unit);
  const title = p.name
    .replace(/\s*[—–]\s*/g, " — ")
    .replace(/\(\s*\)/g, "")
    .trim();

  const dir = path.join(OUT, brand.family);
  fs.mkdirSync(dir, { recursive: true });
  const canonical = `${p.slug}.webp`;
  const dest = path.join(dir, canonical);
  const publicPath = `/media/covers/${brand.family}/${canonical}`;
  const alt = `${p.name} product poster.`;

  const svg = posterSvg({
    name: title,
    duration,
    brand,
    slug: p.slug,
  });

  const buf = await sharp(svg)
    .resize(1200, 1200)
    .toColorspace("srgb")
    .webp({ quality: 92 })
    .toBuffer();
  fs.writeFileSync(dest, buf);

  bySlug.set(p.slug, {
    slug: p.slug,
    family: brand.family,
    canonical,
    publicPath,
    mode: "FULL_CARD",
    sourceFile: "generated-real-product-poster.svg",
    alt,
    resolutionNote: "GENERATED_POSTER",
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
  console.log("POSTER", p.slug, "→", publicPath);
}

fs.writeFileSync(
  MANIFEST,
  JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n",
);

console.log(`\nGenerated ${done} real product posters`);
await sql.end({ timeout: 5 });
