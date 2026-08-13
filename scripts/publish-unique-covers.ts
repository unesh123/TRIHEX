/**
 * Publish UNIQUE per-product covers:
 * 1) Map designer-master-art-NN.webp → product slug (by name, not array order)
 * 2) Generate DISTINCT branded SVG abstracts for SKUs with no designer art
 *
 * Usage: npx tsx scripts/publish-unique-covers.ts
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
const DESIGNER = path.join(ROOT, "assets", "product-media", "full-cards");
const TRIHEX = path.join(
  ROOT,
  "TRIHEX_PRODUCT_IMAGES",
  "TRIHEX_PRODUCT_IMAGES",
);

type ManifestEntry = {
  slug: string;
  family: string;
  canonical: string;
  publicPath: string;
  mode: string;
  sourceFile: string;
  alt: string;
  resolutionNote: string;
  artWidth: number;
  artHeight: number;
  lowResReplacementRecommended: boolean;
};

/** Designer art number → live catalogue slug (verified from card titles). */
const DESIGNER_ART_BY_SLUG: Record<
  string,
  { art: string; family: string; alt: string }
> = {
  "gemini-pro-18-months-link": {
    art: "designer-master-art-02.webp",
    family: "gemini",
    alt: "Gemini Pro 18-month package cover artwork.",
  },
  "gemini-pro-cdk-12-months": {
    art: "designer-master-art-05.webp",
    family: "gemini",
    alt: "Gemini Pro CDK 12-month redeem cover artwork.",
  },
  "gemini-ai-pro-5tb-12m-mail-a": {
    art: "designer-master-art-06.webp",
    family: "gemini",
    alt: "Gemini AI Pro 5TB twelve-month cover artwork.",
  },
  "chatgpt-plus-1-month-fw": {
    art: "designer-master-art-09.webp",
    family: "chatgpt",
    alt: "ChatGPT Plus one-month cover artwork.",
  },
  "grok-super-3-months": {
    art: "designer-master-art-14.webp",
    family: "grok",
    alt: "Grok Super three-month cover artwork.",
  },
  "claude-pro-1-month": {
    art: "designer-master-art-20.webp",
    family: "claude",
    alt: "Claude Pro package cover artwork.",
  },
  "adobe-creative-cloud-2-months": {
    art: "designer-master-art-17.webp",
    family: "adobe",
    alt: "Adobe Creative Cloud two-month cover artwork.",
  },
  "canva-pro-1-year": {
    art: "designer-master-art-19.webp",
    family: "canva",
    alt: "Canva Pro one-year cover artwork.",
  },
  "canva-edu-1-year": {
    art: "designer-master-art-25.webp",
    family: "canva",
    alt: "Canva Edu education plan cover artwork.",
  },
  "coursera-premium-1-year": {
    art: "designer-master-art-21.webp",
    family: "coursera",
    alt: "Coursera Premium one-year cover artwork.",
  },
  "capcut-pro-7-days": {
    art: "designer-master-art-22.webp",
    family: "capcut",
    alt: "CapCut Pro seven-day cover artwork.",
  },
  "capcut-pro-30-days": {
    art: "designer-master-art-23.webp",
    family: "capcut",
    alt: "CapCut Pro thirty-day cover artwork.",
  },
  "capcut-pro-6-months": {
    art: "designer-master-art-24.webp",
    family: "capcut",
    alt: "CapCut Pro six-month cover artwork.",
  },
  "kling-standard-680-750-credits": {
    art: "designer-master-art-30.webp",
    family: "kling",
    alt: "Kling Standard credit pack cover artwork.",
  },
  "kling-ultra-26k-credits": {
    art: "designer-master-art-26.webp",
    family: "kling",
    alt: "Kling Ultra credit pack cover artwork.",
  },
  "cursor-pro-1-month": {
    art: "designer-master-art-29.webp",
    family: "cursor",
    alt: "Cursor Pro one-month cover artwork.",
  },
  "small-business-ai-setup-consultation": {
    art: "designer-master-art-31.webp",
    family: "trihex",
    alt: "TRIHEX small-business AI setup cover artwork.",
  },
};

/** Prefer TRIHEX zip abstracts/posters when designer art missing. */
const ZIP_SOURCES: Record<
  string,
  { source: string; family: string; alt: string }
> = {
  "ai-prompt-starter-pack": {
    source: "01_single_product_covers/trihex-ai-prompt-starter-pack.png",
    family: "trihex",
    alt: "TRIHEX AI prompt starter pack cover artwork.",
  },
  "custom-workflow-automation-discovery": {
    source: "01_single_product_covers/trihex-workflow-automation-discovery.png",
    family: "trihex",
    alt: "TRIHEX workflow automation discovery cover artwork.",
  },
};

type GenSpec = {
  slug: string;
  family: string;
  canonical: string;
  alt: string;
  motif: "windows" | "pen" | "play" | "figma" | "shield" | "wave" | "blocks" | "family";
  colors: [string, string, string];
};

/** Distinct geometry per brand — never the same icon recolored. */
const GENERATED: GenSpec[] = [
  {
    slug: "office365-100gb-lifetime",
    family: "microsoft",
    canonical: "office365-100gb-lifetime.webp",
    alt: "Microsoft Office 365 with 100GB OneDrive abstract cover.",
    motif: "windows",
    colors: ["#2563EB", "#60A5FA", "#EFF6FF"],
  },
  {
    slug: "office365-1tb-lifetime",
    family: "microsoft",
    canonical: "office365-1tb-lifetime.webp",
    alt: "Microsoft Office 365 with 1TB OneDrive abstract cover.",
    motif: "windows",
    colors: ["#1D4ED8", "#0EA5E9", "#F0F9FF"],
  },
  {
    slug: "microsoft-365-family-10-months",
    family: "microsoft",
    canonical: "microsoft-365-family-10-months.webp",
    alt: "Microsoft 365 Family abstract cover artwork.",
    motif: "family",
    colors: ["#7C3AED", "#2563EB", "#F5F3FF"],
  },
  {
    slug: "grammarly-pro-1-year",
    family: "grammarly",
    canonical: "grammarly-pro-1-year.webp",
    alt: "Grammarly Pro writing assistant abstract cover.",
    motif: "pen",
    colors: ["#15C39A", "#0F766E", "#ECFDF5"],
  },
  {
    slug: "youtube-premium-1-year",
    family: "youtube",
    canonical: "youtube-premium-1-year.webp",
    alt: "YouTube Premium abstract cover artwork.",
    motif: "play",
    colors: ["#FF0033", "#111827", "#FEF2F2"],
  },
  {
    slug: "figma-edu-2-years",
    family: "figma",
    canonical: "figma-edu-2-years.webp",
    alt: "Figma Edu abstract design cover artwork.",
    motif: "figma",
    colors: ["#A259FF", "#F24E1E", "#F5F3FF"],
  },
  {
    slug: "nordvpn-shared-3-months",
    family: "nordvpn",
    canonical: "nordvpn-shared-3-months.webp",
    alt: "NordVPN shared plan abstract cover artwork.",
    motif: "shield",
    colors: ["#4687FF", "#1E3A8A", "#EFF6FF"],
  },
  {
    slug: "nordvpn-mail-3-months",
    family: "nordvpn",
    canonical: "nordvpn-mail-3-months.webp",
    alt: "NordVPN mail delivery plan abstract cover artwork.",
    motif: "shield",
    colors: ["#3B82F6", "#1E40AF", "#DBEAFE"],
  },
  {
    slug: "elevenlabs-1-month",
    family: "elevenlabs",
    canonical: "elevenlabs-1-month.webp",
    alt: "ElevenLabs voice AI abstract cover artwork.",
    motif: "wave",
    colors: ["#111827", "#6366F1", "#EEF2FF"],
  },
  {
    slug: "notion-business-3-months",
    family: "notion",
    canonical: "notion-business-3-months.webp",
    alt: "Notion Business abstract cover artwork.",
    motif: "blocks",
    colors: ["#111827", "#6B7280", "#F8FAFC"],
  },
];

function motifSvg(spec: GenSpec): Buffer {
  const [a, b, bg] = spec.colors;
  const is1tb = spec.slug.includes("1tb");
  let motif = "";

  switch (spec.motif) {
    case "windows":
      motif = `
        <g transform="translate(600 560)">
          <rect x="-200" y="-200" width="190" height="190" rx="28" fill="${a}"/>
          <rect x="20" y="-200" width="190" height="190" rx="28" fill="${b}"/>
          <rect x="-200" y="20" width="190" height="190" rx="28" fill="${b}" opacity="0.85"/>
          <rect x="20" y="20" width="190" height="190" rx="28" fill="${a}" opacity="0.9"/>
          ${
            is1tb
              ? `<text x="0" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="${a}">1TB</text>`
              : `<text x="0" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="${a}">100GB</text>`
          }
        </g>`;
      break;
    case "pen":
      motif = `
        <g transform="translate(600 600)">
          <ellipse cx="0" cy="40" rx="220" ry="160" fill="${a}" opacity="0.15"/>
          <path d="M-140 120 L40 -180 L110 -140 L-70 160 Z" fill="${a}"/>
          <path d="M40 -180 L90 -220 L160 -150 L110 -140 Z" fill="${b}"/>
          <circle cx="90" cy="140" r="54" fill="#fff" opacity="0.95"/>
          <path d="M70 140 L85 155 L115 120" stroke="${a}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>`;
      break;
    case "play":
      motif = `
        <g transform="translate(600 600)">
          <rect x="-260" y="-180" width="520" height="360" rx="90" fill="${a}"/>
          <path d="M-40 -90 L140 0 L-40 90 Z" fill="#fff"/>
          <circle cx="200" cy="-140" r="28" fill="${b}" opacity="0.5"/>
        </g>`;
      break;
    case "figma":
      motif = `
        <g transform="translate(600 600)">
          <circle cx="-70" cy="-90" r="100" fill="#F24E1E"/>
          <circle cx="70" cy="-90" r="100" fill="#A259FF"/>
          <circle cx="-70" cy="70" r="100" fill="#FF7262"/>
          <circle cx="70" cy="70" r="100" fill="#1ABCFE"/>
          <circle cx="0" cy="-10" r="70" fill="#0ACF83"/>
        </g>`;
      break;
    case "shield":
      motif = `
        <g transform="translate(600 580)">
          <path d="M0 -220 C120 -220 220 -140 220 -40 C220 80 120 200 0 260 C-120 200 -220 80 -220 -40 C-220 -140 -120 -220 0 -220 Z" fill="${a}"/>
          <path d="M-70 10 L-10 70 L90 -60" stroke="#fff" stroke-width="36" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>`;
      break;
    case "wave":
      motif = `
        <g transform="translate(600 600)">
          <rect x="-280" y="-200" width="560" height="400" rx="48" fill="${a}"/>
          ${[0, 1, 2, 3, 4, 5, 6, 7]
            .map((i) => {
              const h = 40 + ((i * 47) % 140);
              return `<rect x="${-200 + i * 50}" y="${-h / 2}" width="28" height="${h}" rx="14" fill="${i % 2 ? b : "#fff"}" opacity="0.9"/>`;
            })
            .join("")}
        </g>`;
      break;
    case "blocks":
      motif = `
        <g transform="translate(600 600)">
          <rect x="-220" y="-240" width="440" height="90" rx="18" fill="${a}"/>
          <rect x="-220" y="-110" width="280" height="90" rx="18" fill="${b}"/>
          <rect x="-220" y="20" width="360" height="90" rx="18" fill="${a}" opacity="0.75"/>
          <rect x="-220" y="150" width="200" height="90" rx="18" fill="${b}" opacity="0.85"/>
        </g>`;
      break;
    case "family":
      motif = `
        <g transform="translate(600 620)">
          <circle cx="-120" cy="-40" r="70" fill="${a}"/>
          <circle cx="0" cy="-80" r="80" fill="${b}"/>
          <circle cx="120" cy="-40" r="70" fill="${a}"/>
          <circle cx="-160" cy="40" r="48" fill="${b}" opacity="0.7"/>
          <circle cx="160" cy="40" r="48" fill="${b}" opacity="0.7"/>
          <ellipse cx="0" cy="120" rx="260" ry="50" fill="${a}" opacity="0.15"/>
        </g>`;
      break;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <circle cx="980" cy="160" r="240" fill="${a}" opacity="0.08"/>
  <circle cx="140" cy="1060" r="280" fill="${b}" opacity="0.08"/>
  ${motif}
</svg>`;
  return Buffer.from(svg);
}

async function writeCover(
  slug: string,
  family: string,
  canonical: string,
  alt: string,
  sourceLabel: string,
  input: Buffer | string,
  bySlug: Map<string, ManifestEntry>,
) {
  const dir = path.join(OUT, family);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, canonical);
  const buf = await sharp(input)
    .resize(1200, 1200, { fit: "cover", position: "attention" })
    .toColorspace("srgb")
    .webp({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(dest, buf);
  bySlug.set(slug, {
    slug,
    family,
    canonical,
    publicPath: `/media/covers/${family}/${canonical}`,
    mode: "ARTWORK_ONLY",
    sourceFile: sourceLabel,
    alt,
    resolutionNote: sourceLabel.includes("designer")
      ? "DESIGNER_ART_1200"
      : sourceLabel.includes("generated")
        ? "GENERATED_UNIQUE_MOTIF"
        : "ZIP_SOURCE",
    artWidth: 1200,
    artHeight: 1200,
    lowResReplacementRecommended: sourceLabel.includes("generated"),
  });
  console.log("COVER", slug, "←", sourceLabel);
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as ManifestEntry[];
  const bySlug = new Map(existing.map((e) => [e.slug, e]));

  for (const [slug, meta] of Object.entries(DESIGNER_ART_BY_SLUG)) {
    const src = path.join(DESIGNER, meta.art);
    if (!fs.existsSync(src)) {
      console.warn("MISSING_DESIGNER", slug, meta.art);
      continue;
    }
    await writeCover(
      slug,
      meta.family,
      `${slug}.webp`,
      meta.alt,
      `assets/product-media/full-cards/${meta.art}`,
      src,
      bySlug,
    );
  }

  for (const [slug, meta] of Object.entries(ZIP_SOURCES)) {
    const src = path.join(TRIHEX, meta.source);
    if (!fs.existsSync(src)) {
      console.warn("MISSING_ZIP", slug, meta.source);
      continue;
    }
    await writeCover(
      slug,
      meta.family,
      `${slug}.webp`,
      meta.alt,
      meta.source,
      src,
      bySlug,
    );
  }

  for (const spec of GENERATED) {
    await writeCover(
      spec.slug,
      spec.family,
      spec.canonical,
      spec.alt,
      `generated-unique-${spec.motif}.svg`,
      motifSvg(spec),
      bySlug,
    );
  }

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
