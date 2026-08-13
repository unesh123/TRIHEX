/**
 * Generate clean abstract covers for new stock brands (no baked price/text).
 * Usage: npx tsx scripts/generate-brand-covers.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "media", "covers");
const MANIFEST = path.join(
  ROOT,
  "src",
  "lib",
  "catalog",
  "product-cover-manifest.json",
);

type Spec = {
  slug: string;
  family: string;
  canonical: string;
  alt: string;
  colors: [string, string, string];
};

const SPECS: Spec[] = [
  {
    slug: "office365-100gb-lifetime",
    family: "microsoft",
    canonical: "office365-100gb-lifetime.webp",
    alt: "Microsoft Office 365 with OneDrive abstract cover artwork.",
    colors: ["#2563EB", "#0EA5E9", "#F8FAFC"],
  },
  {
    slug: "office365-1tb-lifetime",
    family: "microsoft",
    canonical: "office365-1tb-lifetime.webp",
    alt: "Microsoft Office 365 1TB OneDrive abstract cover artwork.",
    colors: ["#1D4ED8", "#38BDF8", "#F8FAFC"],
  },
  {
    slug: "grammarly-pro-1-year",
    family: "grammarly",
    canonical: "grammarly-pro-1-year.webp",
    alt: "Grammarly Pro abstract green writing cover artwork.",
    colors: ["#15C39A", "#0F766E", "#ECFDF5"],
  },
  {
    slug: "microsoft-365-family-10-months",
    family: "microsoft",
    canonical: "microsoft-365-family-10-months.webp",
    alt: "Microsoft 365 Family abstract cover artwork.",
    colors: ["#7C3AED", "#2563EB", "#F5F3FF"],
  },
  {
    slug: "nordvpn-shared-3-months",
    family: "nordvpn",
    canonical: "nordvpn-shared-3-months.webp",
    alt: "NordVPN shared plan abstract cover artwork.",
    colors: ["#4687FF", "#1E3A8A", "#EFF6FF"],
  },
  {
    slug: "nordvpn-mail-3-months",
    family: "nordvpn",
    canonical: "nordvpn-mail-3-months.webp",
    alt: "NordVPN mail plan abstract cover artwork.",
    colors: ["#3B82F6", "#1E40AF", "#DBEAFE"],
  },
  {
    slug: "youtube-premium-1-year",
    family: "youtube",
    canonical: "youtube-premium-1-year.webp",
    alt: "YouTube Premium abstract red cover artwork.",
    colors: ["#FF0033", "#111827", "#FEF2F2"],
  },
  {
    slug: "figma-edu-2-years",
    family: "figma",
    canonical: "figma-edu-2-years.webp",
    alt: "Figma Edu abstract design cover artwork.",
    colors: ["#A259FF", "#F24E1E", "#F5F3FF"],
  },
  {
    slug: "claude-pro-1-month",
    family: "claude",
    canonical: "claude-pro-1-month.webp",
    alt: "Claude Pro abstract modular cover artwork.",
    colors: ["#D97706", "#C2410C", "#FFFBEB"],
  },
  {
    slug: "elevenlabs-1-month",
    family: "elevenlabs",
    canonical: "elevenlabs-1-month.webp",
    alt: "ElevenLabs voice AI abstract cover artwork.",
    colors: ["#111827", "#6366F1", "#EEF2FF"],
  },
  {
    slug: "cursor-pro-1-month",
    family: "cursor",
    canonical: "cursor-pro-1-month.webp",
    alt: "Cursor Pro developer abstract cover artwork.",
    colors: ["#4B5563", "#6D4AFF", "#F8FAFC"],
  },
  {
    slug: "notion-business-3-months",
    family: "notion",
    canonical: "notion-business-3-months.webp",
    alt: "Notion Business abstract cover artwork.",
    colors: ["#111827", "#374151", "#F8FAFC"],
  },
];

function svgArt(colors: [string, string, string]): Buffer {
  const [a, b, bg] = colors;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
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
</svg>`;
  return Buffer.from(svg);
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Array<
    Record<string, unknown>
  >;
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
      sourceFile: "generated-brand-cover.svg",
      alt: spec.alt,
      resolutionNote: "GENERATED_ABSTRACT",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    });
    console.log("COVER", spec.slug);
  }

  // Remap Gemini 18m primary to the correct 18m poster (artwork crop already published)
  // Ensure archived duplicates are not required in manifest

  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(Array.from(bySlug.values()), null, 2) + "\n",
  );
  console.log("MANIFEST", bySlug.size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
