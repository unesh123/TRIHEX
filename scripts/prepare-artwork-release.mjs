/** Export committed baseline plus only this task's edits, excluding concurrent work. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const target = process.argv[2];
if (!target || fs.existsSync(target)) throw new Error("Supply a new absolute release directory");
fs.mkdirSync(target, { recursive: true });
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(file =>
  /^(src|public|data|scripts|tests|docs)\//.test(file) ||
  (!file.includes("/") && /\.(json|ts|mjs|md)$/.test(file)) || file === ".gitignore"
);
for (const file of files) {
  const dest = path.join(target, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, execFileSync("git", ["show", `HEAD:${file}`], { maxBuffer: 40 * 1024 * 1024 }));
}
const additions = [
  "src/lib/catalog/premium-artwork.ts", "src/lib/catalog/limited-offer.ts",
  "src/components/storefront/limited-offer-banner.tsx", "src/db/owner-product-additions.ts",
  "tests/storefront/limited-offer.test.ts",
  "tests/commerce/image-delivery.test.ts", "tests/product-image-mapping.test.ts",
  "src/db/index.ts", "src/components/storefront/product-image.tsx",
  "src/components/storefront/product-gallery.tsx", "src/components/storefront/feature-poster-lightbox.tsx",
  "src/components/storefront/product-purchase-panel.tsx",
  "scripts/audit-premium-artwork.ts", "scripts/sync-owner-artwork.ts",
  "scripts/compress-premium-artwork.mjs", "scripts/check-artwork-browser.mjs",
  "docs/PRODUCT_ARTWORK_RELEASE.md", "artwork-sources.json", ".vercelignore",
];
for (const file of additions) {
  fs.mkdirSync(path.dirname(path.join(target, file)), { recursive: true });
  fs.copyFileSync(path.join(root, file), path.join(target, file));
}
function edit(file, changes) {
  const dest = path.join(target, file);
  let text = fs.readFileSync(dest, "utf8");
  for (const [from, to] of changes) {
    if (!text.includes(from)) throw new Error(`Baseline changed: ${file}: ${from}`);
    text = text.replace(from, to);
  }
  fs.writeFileSync(dest, text);
}
edit("src/db/seed-data.ts", [
  ['import { NEW_STOCK_SEED_PRODUCTS }', 'import { OWNER_PRODUCT_ADDITIONS } from "./owner-product-additions";\nimport { NEW_STOCK_SEED_PRODUCTS }'],
  ['export const SEED_BRANDS = [', 'export const SEED_BRANDS = [\n  { name: "MuseAI", slug: "museai", isOwnBrand: false },'],
  ['export const ALL_SEED_PRODUCTS = withOwnerOverrides([', 'export const ALL_SEED_PRODUCTS = withOwnerOverrides([\n  ...OWNER_PRODUCT_ADDITIONS,'],
]);
edit("src/lib/catalog/product-image-resolver.ts", [
  ['import manifest from', 'import { premiumArtworkForSlug } from "./premium-artwork";\nimport manifest from'],
  ['  const inputCover = typeof productOrSlug === "object" ? productOrSlug.coverPublicPath : legacyCover;', '  const inputCover = typeof productOrSlug === "object" ? productOrSlug.coverPublicPath : legacyCover;\n  const uploadedCover = [inputThumb, inputCover].map(normalizePublicUrl).find(url => url?.startsWith("/media/covers/uploads/") || url?.startsWith("https://"));\n  if (uploadedCover) return uploadedCover;\n  const artwork = premiumArtworkForSlug(slug);\n  if (artwork) return artwork;'],
  ['  const inputInfo =', '  const artwork = premiumArtworkForSlug(slug);\n  if (artwork) return artwork;\n  const inputInfo ='],
]);
edit("src/lib/catalog/product-covers.ts", [
  ['import coverManifest from', 'import { premiumArtworkForSlug } from "./premium-artwork";\nimport coverManifest from'],
  ['export function getProductCover(slug: string): ProductCoverEntry | null {', 'export function getProductCover(slug: string): ProductCoverEntry | null {\n  const artwork = premiumArtworkForSlug(slug);\n  if (artwork) return { slug, family: artwork.split("/").pop()!.replace(".webp", "").replace(/^claude-code$/, "claude"), canonical: artwork.split("/").pop()!, publicPath: artwork, mode: "ARTWORK_ONLY", alt: `${slug} product artwork`, artWidth: 960, artHeight: 960, lowResReplacementRecommended: false };'],
]);
edit("src/lib/catalog/merchandising.ts", [
  ['import { extractDuration }', 'import { campaignPrice } from "./limited-offer";\nimport { extractDuration }'],
  ['const price = resolvePrice(product);', 'const price = campaignPrice(product.slug, product.variants[0]?.sku ?? "", resolvePrice(product)) ?? null;'],
  ['        v.manualSellingPriceNprMinor ??', '        campaignPrice(product.slug, v.sku, v.manualSellingPriceNprMinor) ??'],
]);
edit("src/lib/checkout/create-order.ts", [
  ['import { and, eq }', 'import { campaignPrice } from "@/lib/catalog/limited-offer";\nimport { and, eq }'],
  ['manualSellingPriceNprMinor:\n          product.variant.manualSellingPriceNprMinor,', 'manualSellingPriceNprMinor:\n          campaignPrice(product.slug, product.variant.sku, product.variant.manualSellingPriceNprMinor) ?? null,'],
]);
edit("src/components/storefront/product-card.tsx", [
  ['import Link from', 'import { LimitedOfferBanner } from "./limited-offer-banner";\nimport Link from'],
  ['<div className="flex flex-1 flex-col p-3.5 sm:p-3.5">', '<div className="flex flex-1 flex-col p-3.5 sm:p-3.5">\n        <LimitedOfferBanner slug={product.slug} />'],
]);
edit("src/app/(storefront)/products/[slug]/page.tsx", [
  ['import { notFound }', 'import { LimitedOfferBanner } from "@/components/storefront/limited-offer-banner";\nimport { notFound }'],
  ['{familyTitle}\n          </h1>', '{familyTitle}\n          </h1>\n          <LimitedOfferBanner slug={product.slug} />'],
]);
edit("src/lib/catalog/live-catalogue.ts", [
  ['const effDurationValue =\n        parsedDur', 'const effDurationValue =\n        row.slug === "museai" ? null : parsedDur'],
  ['const effDurationUnit =\n        parsedDur', 'const effDurationUnit =\n        row.slug === "museai" ? null : parsedDur'],
]);
fs.mkdirSync(path.join(target, ".vercel"), { recursive: true });
fs.copyFileSync(path.join(root, ".vercel/project.json"), path.join(target, ".vercel/project.json"));
edit("next.config.ts", [['    formats: ["image/avif", "image/webp"],', '    formats: ["image/avif", "image/webp"],\n    qualities: [75, 80],']]);
fs.cpSync(path.join(root, "public/media/artwork"), path.join(target, "public/media/artwork"), { recursive: true });
// Keep local tools usable without reinstalling dependencies or copying credentials.
fs.symlinkSync(path.join(root, "node_modules"), path.join(target, "node_modules"), "junction");
console.log(JSON.stringify({ target, baseline: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), files: files.length }));
