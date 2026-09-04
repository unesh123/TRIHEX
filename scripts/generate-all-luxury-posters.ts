import fs from "fs";
import path from "path";
import sharp from "sharp";

export interface PosterConfig {
  destPath: string;
  slug: string;
  category: string;
  badge: string;
  brandName: string;
  productTitle: string;
  tagline?: string;
  subtitle?: string;
  accentA: string;
  accentB: string;
  bgColorA?: string;
  bgColorB?: string;
  glowColor?: string;
  features: string[];
  pricingTiers?: Array<{ label: string; price: string }>;
  logoSvg?: string;
  iconSymbol?: string;
  footerNote?: string;
  whatsapp?: string;
  rating?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generatePosterSvg(c: PosterConfig): string {
  const features = c.features.slice(0, 4);
  const tiers = c.pricingTiers && c.pricingTiers.length > 0 ? c.pricingTiers.slice(0, 4) : [];
  const tagline = c.tagline || c.subtitle || "";
  const bgColorA = c.bgColorA || "#0a1020";
  const bgColorB = c.bgColorB || "#04060b";
  const rating = c.rating || "4.8";
  const whatsapp = c.whatsapp || "+977 9702910130";
  const logoSvg = c.logoSvg || c.iconSymbol || `<circle cx="90" cy="90" r="70" fill="${c.accentA}" fill-opacity="0.2"/><text x="90" y="115" text-anchor="middle" font-size="70" fill="${c.accentA}" font-weight="900">${escapeXml(c.brandName.slice(0, 2))}</text>`;

  const featureRows = features.map((f, i) => {
    const y = 470 + i * 62;
    return (
      `<g transform="translate(60, ${y}">` +
      `<circle cx="14" cy="12" r="12" fill="${c.accentA}" fill-opacity="0.22" stroke="${c.accentA}" stroke-width="1.5"/>` +
      `<text x="9" y="17" fill="${c.accentA}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="13" font-weight="900">&#x2713;</text>` +
      `<text x="38" y="17" fill="#e2e8f0" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="22" font-weight="600">${escapeXml(f)}</text>` +
      `</g>`
    );
  }).join("");

  const tierWidth = tiers.length > 0 ? Math.floor(1080 / tiers.length) : 270;
  const tierCells = tiers.map((t, i) => {
    const x = 60 + i * tierWidth;
    const isFirst = i === 0;
    const bgFill = isFirst ? c.accentA : "rgba(255,255,255,0.07)";
    const bgOpacity = isFirst ? "0.22" : "1";
    const textColor = isFirst ? c.accentA : "#ffffff";
    const strokeColor = isFirst ? c.accentA : "rgba(255,255,255,0.12)";
    const cx = (tierWidth - 8) / 2;
    return (
      `<g transform="translate(${x},738)">` +
      `<rect x="0" y="0" width="${tierWidth - 8}" height="76" rx="14" fill="${bgFill}" fill-opacity="${bgOpacity}" stroke="${strokeColor}" stroke-width="1.2"/>` +
      `<text x="${cx}" y="28" text-anchor="middle" fill="#94a3b8" font-family="-apple-system,sans-serif" font-size="13" font-weight="700">${escapeXml(t.label)}</text>` +
      `<text x="${cx}" y="58" text-anchor="middle" fill="${textColor}" font-family="-apple-system,sans-serif" font-size="20" font-weight="900">NPR ${escapeXml(t.price)}</text>` +
      `</g>`
    );
  }).join("");

  const vLines = Array.from({length: 13}, (_, i) => `<line x1="${i*100}" y1="0" x2="${i*100}" y2="900" stroke="#fff" stroke-width="1"/>`).join("");
  const hLines = Array.from({length: 10}, (_, i) => `<line x1="0" y1="${i*100}" x2="1200" y2="${i*100}" stroke="#fff" stroke-width="1"/>`).join("");

  return [
    `<svg width="1200" height="900" viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg">`,
    `<defs>`,
    `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bgColorA}"/><stop offset="100%" stop-color="${bgColorB}"/></linearGradient>`,
    `<radialGradient id="g1" cx="25%" cy="15%" r="55%"><stop offset="0%" stop-color="${c.accentA}" stop-opacity="0.3"/><stop offset="100%" stop-color="transparent" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="g2" cx="80%" cy="85%" r="50%"><stop offset="0%" stop-color="${c.accentB}" stop-opacity="0.18"/><stop offset="100%" stop-color="transparent" stop-opacity="0"/></radialGradient>`,
    `<filter id="lg"><feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="${c.accentA}" flood-opacity="0.55"/></filter>`,
    `<filter id="tg"><feDropShadow dx="0" dy="2" stdDeviation="10" flood-color="${c.accentA}" flood-opacity="0.3"/></filter>`,
    `</defs>`,
    `<rect width="1200" height="900" fill="url(#bg)"/>`,
    `<rect width="1200" height="900" fill="url(#g1)"/>`,
    `<rect width="1200" height="900" fill="url(#g2)"/>`,
    `<g opacity="0.05">${vLines}${hLines}</g>`,
    `<circle cx="-80" cy="-80" r="220" fill="${c.accentA}" fill-opacity="0.07"/>`,
    `<circle cx="1280" cy="980" r="240" fill="${c.accentB}" fill-opacity="0.06"/>`,
    `<rect x="40" y="30" width="214" height="38" rx="19" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>`,
    `<circle cx="62" cy="49" r="5" fill="#10b981"/>`,
    `<text x="78" y="55" fill="#fff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="12" font-weight="800" letter-spacing="1.5">TRIHEX DIGITAL</text>`,
    `<rect x="948" y="30" width="212" height="38" rx="19" fill="${c.accentA}" fill-opacity="0.2" stroke="${c.accentA}" stroke-width="1.5"/>`,
    `<text x="1054" y="55" text-anchor="middle" fill="${c.accentA}" font-family="-apple-system,sans-serif" font-size="11" font-weight="800" letter-spacing="1.5">${escapeXml(c.badge.toUpperCase())}</text>`,
    `<text x="790" y="56" fill="#fbbf24" font-family="-apple-system,sans-serif" font-size="16" font-weight="900">&#9733;&#9733;&#9733;&#9733;&#9733;</text>`,
    `<text x="896" y="56" fill="#94a3b8" font-family="-apple-system,sans-serif" font-size="14" font-weight="600">${escapeXml(rating)}/5</text>`,
    `<g transform="translate(60,108)" filter="url(#lg)">${logoSvg}</g>`,
    `<text x="295" y="168" fill="#fff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="52" font-weight="900" letter-spacing="-1.5" filter="url(#tg)">${escapeXml(c.productTitle)}</text>`,
    `<text x="296" y="212" fill="${c.accentA}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="22" font-weight="700">${escapeXml(tagline)}</text>`,
    `<line x1="60" y1="438" x2="1140" y2="438" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`,
    `<text x="60" y="430" fill="#475569" font-family="-apple-system,sans-serif" font-size="11" font-weight="800" letter-spacing="2">KEY FEATURES</text>`,
    featureRows,
    `<line x1="60" y1="728" x2="1140" y2="728" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`,
    `<text x="60" y="720" fill="#475569" font-family="-apple-system,sans-serif" font-size="11" font-weight="800" letter-spacing="2">PLANS &amp; PRICING</text>`,
    tierCells,
    `<rect x="0" y="840" width="1200" height="60" fill="rgba(0,0,0,0.32)"/>`,
    `<line x1="0" y1="840" x2="1200" y2="840" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`,
    `<text x="52" y="876" fill="#25d366" font-family="-apple-system,sans-serif" font-size="14" font-weight="800">&#128241; ${escapeXml(whatsapp)}</text>`,
    `<text x="330" y="876" fill="#64748b" font-family="-apple-system,sans-serif" font-size="13" font-weight="700">&#x2713; Verified Delivery &#183; &#x2713; Local Support &#183; &#x2713; Secure Payment</text>`,
    `<text x="1140" y="876" text-anchor="end" fill="${c.accentA}" font-family="-apple-system,sans-serif" font-size="12" font-weight="800" letter-spacing="0.5">TRIHEX NEPAL &#10022;</text>`,
    `</svg>`,
  ].join("\n");
}

export async function renderPoster(config: PosterConfig) {
  const dir = path.dirname(config.destPath);
  fs.mkdirSync(dir, { recursive: true });
  const svg = generatePosterSvg(config);
  await sharp(Buffer.from(svg))
    .webp({ quality: 95 })
    .toFile(config.destPath);
  console.log("Rendered: " + path.basename(config.destPath));
}
