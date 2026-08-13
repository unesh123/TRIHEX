/**
 * Apply owner catalogue overrides to live PostgreSQL (update existing + insert new).
 * Usage: npx tsx scripts/apply-catalogue-updates.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";
normalizeEnvAliases();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { ALL_SEED_PRODUCTS, SEED_BRANDS, SEED_CATEGORIES } from "../src/db/seed-data";

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL required");

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  const brandIds = new Map<string, string>();
  for (const b of SEED_BRANDS) {
    const rows = await db
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.slug, b.slug))
      .limit(1);
    if (rows[0]) brandIds.set(b.slug, rows[0].id);
    else {
      const [row] = await db
        .insert(schema.brands)
        .values({ name: b.name, slug: b.slug, isOwnBrand: b.isOwnBrand })
        .returning();
      brandIds.set(b.slug, row.id);
    }
  }

  const categoryIds = new Map<string, string>();
  for (const c of SEED_CATEGORIES) {
    const rows = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, c.slug))
      .limit(1);
    if (rows[0]) categoryIds.set(c.slug, rows[0].id);
    else {
      const [row] = await db
        .insert(schema.categories)
        .values({ name: c.name, slug: c.slug, sortOrder: c.sortOrder })
        .returning();
      categoryIds.set(c.slug, row.id);
    }
  }

  let updated = 0;
  let inserted = 0;

  for (const p of ALL_SEED_PRODUCTS) {
    const existing = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, p.slug))
      .limit(1);

    let productId = existing[0]?.id;
    if (productId) {
      await db
        .update(schema.products)
        .set({
          name: p.name,
          shortDescription: p.shortDescription,
          productStatus: p.productStatus as never,
          complianceStatus: p.complianceStatus as never,
          blockedReason: p.blockedReason ?? null,
          needsDataVerification: p.needsDataVerification,
          featured: Boolean(p.featured),
          publishedAt:
            p.productStatus === "PUBLIC" ? new Date() : existing[0]!.publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, productId));
      updated += 1;
    } else {
      const [row] = await db
        .insert(schema.products)
        .values({
          brandId: brandIds.get(p.brandSlug),
          categoryId: categoryIds.get(p.categorySlug),
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          sourceListingText: p.sourceListingText,
          productType: p.productType as never,
          fulfillmentType: p.fulfillmentType as never,
          productStatus: p.productStatus as never,
          complianceStatus: p.complianceStatus as never,
          supplyAuthorizationType: p.supplyAuthorizationType as never,
          vendorProofStatus: p.vendorProofStatus as never,
          blockedReason: p.blockedReason,
          needsDataVerification: p.needsDataVerification,
          featured: Boolean(p.featured),
          publishedAt: p.productStatus === "PUBLIC" ? new Date() : null,
        })
        .returning();
      productId = row.id;
      inserted += 1;
    }

    for (const v of p.variants) {
      const existingV = await db
        .select()
        .from(schema.productVariants)
        .where(eq(schema.productVariants.sku, v.sku))
        .limit(1);
      const manualPrice = v.manualSellingPriceNprMinor ?? null;
      const purchasable = Boolean(
        (v.purchasable ?? false) && manualPrice != null,
      );

      if (existingV[0]) {
        await db
          .update(schema.productVariants)
          .set({
            variantName: v.variantName,
            manualSellingPriceNprMinor: manualPrice,
            purchasable,
            seedVisibleQuantity: v.seedVisibleQuantity,
            active: true,
            updatedAt: new Date(),
          })
          .where(eq(schema.productVariants.id, existingV[0].id));
      } else {
        await db.insert(schema.productVariants).values({
          productId,
          sku: v.sku,
          variantName: v.variantName,
          durationValue: v.durationValue,
          durationUnit: v.durationUnit as never,
          supplierCurrency: "USD",
          supplierCostMinor: v.supplierCostUsdMinor,
          supplierCostUsdMinor: v.supplierCostUsdMinor,
          manualSellingPriceNprMinor: manualPrice,
          minimumProfitNprMinor: v.minimumProfitNprMinor ?? 0,
          pricingMode: "MANUAL_ONLY",
          active: true,
          purchasable,
          seedVisibleQuantity: v.seedVisibleQuantity,
          lowStockThreshold: 3,
        });
      }
    }
  }

  console.log(JSON.stringify({ updated, inserted, total: ALL_SEED_PRODUCTS.length }));

  // Soft-archive duplicates (never hard-delete)
  const { OWNER_ARCHIVE_SLUGS } = await import("../src/db/catalogue-overrides");
  let archived = 0;
  for (const slug of OWNER_ARCHIVE_SLUGS) {
    const rows = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, slug))
      .limit(1);
    if (!rows[0]) continue;
    await db
      .update(schema.products)
      .set({
        productStatus: "ARCHIVED",
        featured: false,
        searchable: false,
        updatedAt: new Date(),
        publishedAt: null,
      })
      .where(eq(schema.products.id, rows[0].id));
    await db
      .update(schema.productVariants)
      .set({ purchasable: false, active: false, updatedAt: new Date() })
      .where(eq(schema.productVariants.productId, rows[0].id));
    archived += 1;
  }
  console.log(JSON.stringify({ archived }));

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
