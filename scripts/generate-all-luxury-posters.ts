import fs from "fs";
import path from "path";
import sharp from "sharp";

interface PosterConfig {
  destPath: string;
  slug: string;
  category: string;
  badge: string;
  brandName: string;
  productTitle: string;
  subtitle: string;
  accentA: string;
  accentB: string;
  glowColor: string;
  features: string[];
  footerNote: string;
  iconSymbol: string;
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
  const featureRows = c.features.slice(0, 4).map((f, i) => {
    const yPos = 680 + i * 88;
    return `
      <g transform="translate(140, ${yPos})">
        <!-- Pill background -->
        <rect x="0" y="0" width="920" height="70" rx="16" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5"/>
        <!-- Check icon circle -->
        <circle cx="42" cy="35" r="20" fill="${c.accentA}" fill-opacity="0.18" stroke="${c.accentA}" stroke-width="2"/>
        <path d="M34 35 L40 41 L50 29" fill="none" stroke="${c.accentA}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Feature text -->
        <text x="76" y="43" fill="#f1f5f9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" font-size="25" font-weight="600" letter-spacing="-0.3">
          ${escapeXml(f)}
        </text>
      </g>
    `;
  }).join("");

  return `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Dark Gradient -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#070a13"/>
          <stop offset="50%" stop-color="#0a1020"/>
          <stop offset="100%" stop-color="#04060b"/>
        </linearGradient>

        <!-- Brand Accent Gradient -->
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.accentA}"/>
          <stop offset="100%" stop-color="${c.accentB}"/>
        </linearGradient>

        <!-- Glassmorphism Card Gradient -->
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(255, 255, 255, 0.09)"/>
          <stop offset="100%" stop-color="rgba(255, 255, 255, 0.02)"/>
        </linearGradient>

        <!-- Radial Glow -->
        <radialGradient id="topGlow" cx="50%" cy="28%" r="50%">
          <stop offset="0%" stop-color="${c.glowColor}" stop-opacity="0.32"/>
          <stop offset="60%" stop-color="${c.glowColor}" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        
        <radialGradient id="bottomGlow" cx="50%" cy="85%" r="45%">
          <stop offset="0%" stop-color="${c.accentB}" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>

        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
        <filter id="iconGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="${c.accentA}" flood-opacity="0.55"/>
        </filter>
      </defs>

      <!-- 1. Background -->
      <rect width="1200" height="1200" fill="url(#bgGrad)"/>
      <rect width="1200" height="1200" fill="url(#topGlow)"/>
      <rect width="1200" height="1200" fill="url(#bottomGlow)"/>

      <!-- 2. Cyber Grid Dots / Accent lines -->
      <g opacity="0.15">
        <circle cx="200" cy="180" r="1.5" fill="#ffffff"/>
        <circle cx="400" cy="180" r="1.5" fill="#ffffff"/>
        <circle cx="600" cy="180" r="1.5" fill="#ffffff"/>
        <circle cx="800" cy="180" r="1.5" fill="#ffffff"/>
        <circle cx="1000" cy="180" r="1.5" fill="#ffffff"/>
        <circle cx="200" cy="480" r="1.5" fill="#ffffff"/>
        <circle cx="1000" cy="480" r="1.5" fill="#ffffff"/>
      </g>

      <!-- 3. Outer Decorative Border Frame -->
      <rect x="36" y="36" width="1128" height="1128" rx="36" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5"/>
      <rect x="44" y="44" width="1112" height="1112" rx="28" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="1"/>

      <!-- 4. Header Bar -->
      <g transform="translate(80, 80)">
        <!-- Brand kicker -->
        <rect x="0" y="0" width="220" height="42" rx="21" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.14)" stroke-width="1"/>
        <circle cx="21" cy="21" r="5" fill="#10b981"/>
        <text x="36" y="27" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" letter-spacing="2">TRIHEX DIGITAL</text>

        <!-- Category & Badge pill on right -->
        <g transform="translate(1040, 0)">
          <rect x="-260" y="0" width="260" height="42" rx="21" fill="${c.accentA}" fill-opacity="0.16" stroke="${c.accentA}" stroke-width="1.5"/>
          <text x="-130" y="26" text-anchor="middle" fill="${c.accentA}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">
            ${escapeXml(c.badge)}
          </text>
        </g>
      </g>

      <!-- 5. Central Hero Showcase Card -->
      <g transform="translate(100, 160)">
        <!-- Glassmorphism Card Frame -->
        <rect x="0" y="0" width="1000" height="430" rx="32" fill="url(#glassGrad)" stroke="rgba(255, 255, 255, 0.13)" stroke-width="1.5" filter="url(#cardShadow)"/>
        
        <!-- Glowing Ambient Ring behind 3D Icon -->
        <circle cx="500" cy="140" r="90" fill="${c.accentA}" fill-opacity="0.14" filter="url(#iconGlow)"/>
        <circle cx="500" cy="140" r="72" fill="rgba(0,0,0,0.5)" stroke="url(#accentGrad)" stroke-width="2.5"/>

        <!-- 3D Holographic App Icon / Symbol -->
        <g transform="translate(460, 100)" filter="url(#iconGlow)">
          ${c.iconSymbol}
        </g>

        <!-- Product Name & Subtitle -->
        <text x="500" y="284" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" font-size="48" font-weight="900" letter-spacing="-1.2">
          ${escapeXml(c.productTitle)}
        </text>
        <text x="500" y="332" text-anchor="middle" fill="${c.accentA}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" font-size="21" font-weight="700" letter-spacing="1">
          ${escapeXml(c.subtitle)}
        </text>

        <!-- Trust tags -->
        <g transform="translate(500, 380)">
          <rect x="-190" y="-18" width="380" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)"/>
          <circle cx="-160" cy="0" r="4" fill="#38bdf8"/>
          <text x="-144" y="5" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="0.5">
            TRIHEX-VERIFIED DELIVERY · LOCAL SUPPORT
          </text>
        </g>
      </g>

      <!-- 6. Feature Spec List (Glass Rows) -->
      <!-- Header for Features -->
      <text x="140" y="642" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" letter-spacing="2">
        PACKAGE SPECIFICATIONS &amp; INCLUDED FEATURES
      </text>

      ${featureRows}

      <!-- 7. Footer Guarantee Bar -->
      <g transform="translate(100, 1060)">
        <rect x="0" y="0" width="1000" height="64" rx="20" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>
        <circle cx="40" cy="32" r="12" fill="#10b981" fill-opacity="0.2"/>
        <path d="M35 32 L39 36 L46 28" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
        <text x="66" y="38" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700">
          ${escapeXml(c.footerNote)}
        </text>
        <!-- WhatsApp Help on right -->
        <text x="960" y="38" text-anchor="end" fill="${c.accentA}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" letter-spacing="0.5">
          TRIHEX NEPAL SUPPORT ✦
        </text>
      </g>
    </svg>
  `;
}

export async function renderPoster(config: PosterConfig) {
  const dir = path.dirname(config.destPath);
  fs.mkdirSync(dir, { recursive: true });
  const svg = generatePosterSvg(config);
  await sharp(Buffer.from(svg))
    .webp({ quality: 95 })
    .toFile(config.destPath);
  console.log(`Rendered luxury poster: ${config.destPath}`);
}
