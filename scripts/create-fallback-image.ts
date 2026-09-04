import fs from "fs";
import path from "path";
import sharp from "sharp";

async function main() {
  const targetDir = path.join(process.cwd(), "public", "media", "products");
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const svg = `
  <svg width="1200" height="1500" viewBox="0 0 1200 1500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#eff6ff"/>
      </linearGradient>
      <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="50%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#bfdbfe"/>
      </linearGradient>
      <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.08"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1200" height="1500" fill="url(#bg)"/>

    <!-- Subtle Grid / Pattern -->
    <circle cx="600" cy="560" r="380" fill="#3b82f6" fill-opacity="0.03"/>
    <circle cx="600" cy="560" r="260" fill="#0284c7" fill-opacity="0.04"/>

    <!-- Outer Border -->
    <rect x="24" y="24" width="1152" height="1452" rx="36" fill="none" stroke="url(#borderGrad)" stroke-width="4"/>

    <!-- Top Badge -->
    <g transform="translate(600, 180)">
      <rect x="-140" y="-24" width="280" height="48" rx="24" fill="#0f172a" fill-opacity="0.05" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="0" y="8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#475569" text-anchor="middle" letter-spacing="2">TRIHEX DIGITAL</text>
    </g>

    <!-- Central Card -->
    <g transform="translate(600, 560)" filter="url(#shadow)">
      <rect x="-240" y="-240" width="480" height="480" rx="40" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      
      <!-- Isometric Tri-Hex Outline -->
      <path d="M 0 -130 L 110 -65 L 110 65 L 0 130 L -110 65 L -110 -65 Z" fill="none" stroke="url(#blueGlow)" stroke-width="8" stroke-linejoin="round"/>
      <path d="M 0 -130 L 0 0 L 110 65" fill="none" stroke="url(#blueGlow)" stroke-width="6" stroke-linejoin="round"/>
      <path d="M 0 0 L -110 65" fill="none" stroke="url(#blueGlow)" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="0" cy="0" r="14" fill="#2563eb"/>
    </g>

    <!-- Main Text -->
    <text x="600" y="920" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="-1">Verified Digital Product</text>
    <text x="600" y="980" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#64748b" text-anchor="middle">Official Subscription &amp; Activation Package</text>

    <!-- 3 Benefit Pills -->
    <g transform="translate(600, 1120)">
      <g transform="translate(-320, 0)">
        <rect x="-110" y="-28" width="220" height="56" rx="28" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="0" y="8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#334155" text-anchor="middle">100% Genuine</text>
      </g>
      <g transform="translate(0, 0)">
        <rect x="-110" y="-28" width="220" height="56" rx="28" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="0" y="8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#334155" text-anchor="middle">Instant Delivery</text>
      </g>
      <g transform="translate(320, 0)">
        <rect x="-110" y="-28" width="220" height="56" rx="28" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="0" y="8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#334155" text-anchor="middle">Nepal Support</text>
      </g>
    </g>

    <!-- Bottom Footer -->
    <text x="600" y="1380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#94a3b8" text-anchor="middle" letter-spacing="3">TRIHEX DIGITAL · NEPAL-FIRST CLOUD STORE</text>
  </svg>
  `;

  const outputPath = path.join(targetDir, "fallback-product.webp");
  await sharp(Buffer.from(svg))
    .webp({ quality: 90, effort: 6 })
    .toFile(outputPath);

  console.log(`Created fallback product image at: ${outputPath}`);
}

main().catch(console.error);
