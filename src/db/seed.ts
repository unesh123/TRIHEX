/**
 * Database seed — writes seed catalogue + business settings to PostgreSQL.
 * Refuses to run when NODE_ENV=production unless ALLOW_PRODUCTION_SEED=true.
 *
 * Usage: DATABASE_URL=... npx tsx src/db/seed.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { normalizeEnvAliases } from "../lib/env/normalize-aliases";
normalizeEnvAliases();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import {
  ALL_SEED_PRODUCTS,
  SEED_BRANDS,
  SEED_CATEGORIES,
} from "./seed-data";
import {
  DEFAULT_WHATSAPP_DISPLAY,
  DEFAULT_WHATSAPP_NUMBER,
} from "../lib/whatsapp";

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_PRODUCTION_SEED !== "true"
  ) {
    throw new Error(
      "Refusing to seed production without ALLOW_PRODUCTION_SEED=true",
    );
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required to seed.");
  }

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  console.log("Seeding brands…");
  const brandIds = new Map<string, string>();
  for (const b of SEED_BRANDS) {
    const existing = await db
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.slug, b.slug))
      .limit(1);
    if (existing[0]) {
      brandIds.set(b.slug, existing[0].id);
      continue;
    }
    const [row] = await db
      .insert(schema.brands)
      .values({
        name: b.name,
        slug: b.slug,
        isOwnBrand: b.isOwnBrand,
      })
      .returning();
    brandIds.set(b.slug, row.id);
  }

  console.log("Seeding categories…");
  const categoryIds = new Map<string, string>();
  for (const c of SEED_CATEGORIES) {
    const existing = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, c.slug))
      .limit(1);
    if (existing[0]) {
      categoryIds.set(c.slug, existing[0].id);
      continue;
    }
    const [row] = await db
      .insert(schema.categories)
      .values({
        name: c.name,
        slug: c.slug,
        sortOrder: c.sortOrder,
      })
      .returning();
    categoryIds.set(c.slug, row.id);
  }

  console.log("Seeding products + variants…");
  let productCount = 0;
  let variantCount = 0;
  for (const p of ALL_SEED_PRODUCTS) {
    const existing = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, p.slug))
      .limit(1);

    let productId = existing[0]?.id;
    if (!productId) {
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
          fulfillmentType:
            p.fulfillmentType as never,
          productStatus:
            p.productStatus as never,
          complianceStatus:
            p.complianceStatus as never,
          supplyAuthorizationType:
            p.supplyAuthorizationType as never,
          vendorProofStatus:
            p.vendorProofStatus as never,
          blockedReason: p.blockedReason,
          needsDataVerification: p.needsDataVerification,
          featured: Boolean(p.featured),
          publishedAt:
            p.productStatus === "PUBLIC" ? new Date() : null,
        })
        .returning();
      productId = row.id;
      productCount += 1;
    }

    for (const v of p.variants) {
      const existingV = await db
        .select()
        .from(schema.productVariants)
        .where(eq(schema.productVariants.sku, v.sku))
        .limit(1);
      if (existingV[0]) continue;

      const manualPrice = v.manualSellingPriceNprMinor ?? null;
      const wantPurchasable = v.purchasable ?? p.productStatus === "PUBLIC";
      // Constraint: purchasable requires a selling price
      const purchasable = Boolean(wantPurchasable && manualPrice != null);

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
        fxRateSnapshot: v.fxRateNprMinorPerUsd ?? null,
        pricingMode:
          (v.pricingMode as never) ??
          "FORMULA_WITH_OVERRIDE",
        active: true,
        purchasable,
        seedVisibleQuantity: v.seedVisibleQuantity,
        lowStockThreshold: 3,
      });
      variantCount += 1;
    }
  }

  console.log("Seeding business settings…");
  const settings = await db.select().from(schema.businessSettings).limit(1);
  if (!settings[0]) {
    await db.insert(schema.businessSettings).values({
      businessName: "TRIHEX DIGITAL",
      socialLinks: {
        tagline: "Verified Digital Access. Fairly Priced.",
        whatsappDisplay: DEFAULT_WHATSAPP_DISPLAY,
        whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
        ordersPaused: "false",
      },
      customerServicePhone: DEFAULT_WHATSAPP_DISPLAY,
      announcementBarActive: false,
    });
  }

  // Default FX
  const fx = await db.select().from(schema.fxRates).limit(1);
  if (!fx[0]) {
    await db.insert(schema.fxRates).values({
      rateNprMinorPerUsd: 16000,
      source: "MANUAL",
      notes: "Initial operational FX NPR 160 / USD",
    });
  }

  console.log(
    `Seed complete. New products≈${productCount}, new variants≈${variantCount}`,
  );
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
