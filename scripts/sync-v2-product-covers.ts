import fs from "fs";
import path from "path";
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";
normalizeEnvAliases();
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

async function main() {
  const root = path.resolve(".");
  const manifestPath = path.join(root, "src/lib/catalog/product-cover-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as any[];

  const manifestMap = new Map(manifest.map((e) => [e.slug, e]));

  // 1. Update manifest entries for all generated products
  const productsDir = path.join(root, "public/media/products");
  if (fs.existsSync(productsDir)) {
    const slugs = fs.readdirSync(productsDir);
    for (const slug of slugs) {
      const thumb = `/media/products/${slug}/${slug}-thumbnail.webp`;
      const info = `/media/products/${slug}/${slug}-infographic.webp`;

      if (manifestMap.has(slug)) {
        const entry = manifestMap.get(slug);
        entry.publicPath = thumb;
        entry.thumbnailPath = thumb;
        entry.infographicPath = info;
        entry.galleryPaths = [info, thumb];
      } else {
        manifest.push({
          slug,
          family: "trihex",
          canonical: `${slug}-thumbnail.webp`,
          publicPath: thumb,
          thumbnailPath: thumb,
          infographicPath: info,
          galleryPaths: [info, thumb],
          mode: "ARTWORK_ONLY",
          alt: `${slug} product thumbnail`,
          artWidth: 1200,
          artHeight: 1500,
        });
      }
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log("Updated product-cover-manifest.json with new v2 thumbnails and infographics.");
  }

  // 2. Synchronize to Postgres product_media table
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    console.log("No DATABASE_URL configured, skipping DB product_media sync.");
    return;
  }

  console.log("Synchronizing product_media in PostgreSQL...");
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  const allProducts = await db
    .select({ id: schema.products.id, slug: schema.products.slug, name: schema.products.name })
    .from(schema.products);

  for (const p of allProducts) {
    const thumb = `/media/products/${p.slug}/${p.slug}-thumbnail.webp`;
    const info = `/media/products/${p.slug}/${p.slug}-infographic.webp`;
    const fullThumbPath = path.join(root, "public", thumb);

    if (fs.existsSync(fullThumbPath)) {
      // Clear legacy media
      await client`delete from product_media where product_id = ${p.id}`;

      // Insert thumbnail as primary
      await db.insert(schema.productMedia).values({
        productId: p.id,
        url: thumb,
        altText: `${p.name} catalogue thumbnail`,
        isPrimary: true,
        sortOrder: 0,
      });

      // Insert infographic as secondary
      await db.insert(schema.productMedia).values({
        productId: p.id,
        url: info,
        altText: `${p.name} feature infographic`,
        isPrimary: false,
        sortOrder: 1,
      });

      console.log(`Synced media for ${p.slug}`);
    }
  }

  await client.end();
  console.log("PostgreSQL product_media sync complete!");
}

main().catch(console.error);
