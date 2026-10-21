import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { premiumArtworkForSlug } from "../src/lib/catalog/premium-artwork";
import { ALL_SEED_PRODUCTS } from "../src/db/seed-data";

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const sql = url ? postgres(url, { prepare: false, max: 1 }) : null;
  try {
    const rows = sql
      ? await sql<{slug: string}[]>`select slug from products where product_status in ('PUBLIC','DRAFT')`
      : ALL_SEED_PRODUCTS.filter(p => p.productStatus === "PUBLIC" || p.productStatus === "DRAFT");
    const assets = new Set<string>();
    const errors: string[] = [];
    for (const { slug } of [...rows, { slug: "museai" }]) {
      const image = premiumArtworkForSlug(slug);
      if (!image) { errors.push(`Unmapped: ${slug}`); continue; }
      assets.add(image);
    }
    let totalBytes = 0;
    for (const asset of assets) {
      const file = path.join(process.cwd(), "public", asset);
      if (!fs.existsSync(file)) { errors.push(`Missing: ${asset}`); continue; }
      const meta = await sharp(file).metadata();
      const size = fs.statSync(file).size;
      totalBytes += size;
      if (meta.format !== "webp" || meta.width !== 960 || meta.height !== 960) errors.push(`Invalid format or dimensions: ${asset}`);
      if (size > 180000) errors.push(`Excessive payload (${size} bytes): ${asset}`);
    }
    console.log(JSON.stringify({ catalogueProducts: rows.length, artworkAssets: assets.size, totalBytes, errors }, null, 2));
    if (errors.length) process.exitCode = 1;
  } finally { await sql?.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
