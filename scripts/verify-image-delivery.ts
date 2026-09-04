import fs from "fs";
import path from "path";
import { ALL_SEED_PRODUCTS } from "../src/db/seed-data";
import manifest from "../src/lib/catalog/product-cover-manifest.json";

const ROOT = process.cwd();
const publicDir = path.join(ROOT, "public");

console.log("=== TRIHEX IMAGE DELIVERY AUDIT ===");

const manifestItems = manifest as Array<{
  slug: string;
  publicPath?: string;
  thumbnailPath?: string;
  infographicPath?: string;
}>;

const manifestBySlug = new Map(manifestItems.map((m) => [m.slug, m]));

const checkedSlugs = new Set<string>();
let okCount = 0;
let failCount = 0;

for (const p of ALL_SEED_PRODUCTS) {
  if (checkedSlugs.has(p.slug)) continue;
  checkedSlugs.add(p.slug);

  const thumbRel = `/media/products/${p.slug}/${p.slug}-thumbnail.webp`;
  const infoRel = `/media/products/${p.slug}/${p.slug}-infographic.webp`;

  const thumbAbs = path.join(publicDir, thumbRel.replace(/^\//, ""));
  const infoAbs = path.join(publicDir, infoRel.replace(/^\//, ""));

  const thumbExists = fs.existsSync(thumbAbs);
  const infoExists = fs.existsSync(infoAbs);

  let thumbSize = 0;
  let infoSize = 0;
  if (thumbExists) thumbSize = fs.statSync(thumbAbs).size;
  if (infoExists) infoSize = fs.statSync(infoAbs).size;

  const manEntry = manifestBySlug.get(p.slug);

  console.log(`[${p.slug}]`);
  console.log(`  Thumbnail: ${thumbRel} | Exists: ${thumbExists} | Size: ${thumbSize} bytes`);
  console.log(`  Infographic: ${infoRel} | Exists: ${infoExists} | Size: ${infoSize} bytes`);
  console.log(`  Manifest publicPath: ${manEntry?.publicPath ?? "MISSING"}`);

  if (thumbExists && infoExists && thumbSize > 0 && infoSize > 0) {
    okCount++;
  } else {
    failCount++;
    console.error(`  --> FAILED: Missing or 0-byte asset for ${p.slug}`);
  }
}

console.log("\nAudit Finished:");
console.log(`OK: ${okCount}, FAILED: ${failCount}, Total unique products checked: ${checkedSlugs.size}`);
