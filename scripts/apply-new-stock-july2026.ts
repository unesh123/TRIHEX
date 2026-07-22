/**
 * Apply July 2026 new stock to live Postgres.
 * - No duplicate products (match slug + aliases)
 * - Keep lowest cost / best existing deal
 * - SELL → PUBLIC + purchasable; REVIEW → DRAFT; BLOCK → BLOCKED
 *
 * Usage: npx tsx scripts/apply-new-stock-july2026.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";
normalizeEnvAliases();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, inArray, or } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { SEED_BRANDS, SEED_CATEGORIES } from "../src/db/seed-data";
import {
  NEW_STOCK_APPLY,
  type NewStockItem,
} from "../src/db/new-stock-july2026";

function riskToStatus(risk: NewStockItem["risk"]): {
  productStatus: "PUBLIC" | "DRAFT" | "BLOCKED";
  complianceStatus: "APPROVED" | "DOCUMENTS_REQUIRED" | "REJECTED";
  purchasable: boolean;
  needsDataVerification: boolean;
} {
  if (risk === "SELL") {
    return {
      productStatus: "PUBLIC",
      complianceStatus: "APPROVED",
      purchasable: true,
      needsDataVerification: false,
    };
  }
  if (risk === "BLOCK") {
    return {
      productStatus: "BLOCKED",
      complianceStatus: "REJECTED",
      purchasable: false,
      needsDataVerification: false,
    };
  }
  return {
    productStatus: "DRAFT",
    complianceStatus: "DOCUMENTS_REQUIRED",
    purchasable: false,
    needsDataVerification: true,
  };
}

async function main() {
  const candidates = [
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ]
    .map((v) => (v ?? "").trim().replace(/^["']|["']$/g, ""))
    .filter((v) => /^postgres(ql)?:\/\//i.test(v));

  const url = candidates[0];
  if (!url) throw new Error("Valid postgres DATABASE_URL / POSTGRES_URL required");

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

  // Extra brands used by new stock
  for (const slug of ["youtube"] as const) {
    if (brandIds.has(slug)) continue;
    const rows = await db
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.slug, slug))
      .limit(1);
    if (rows[0]) brandIds.set(slug, rows[0].id);
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

  const report: string[] = [];
  let inserted = 0;
  let updated = 0;
  let keptBetter = 0;
  let blocked = 0;

  // Force-block existing NordVPN SKUs (high risk / 0 stock skip)
  const nord = await db
    .select({ id: schema.products.id, slug: schema.products.slug })
    .from(schema.products)
    .where(
      or(
        eq(schema.products.slug, "nordvpn-shared-3-months"),
        eq(schema.products.slug, "nordvpn-mail-3-months"),
      ),
    );
  for (const n of nord) {
    await db
      .update(schema.products)
      .set({
        productStatus: "BLOCKED",
        complianceStatus: "REJECTED",
        needsDataVerification: false,
        blockedReason: "High-risk / 0 stock — contact WhatsApp only",
        publishedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, n.id));
    await db
      .update(schema.productVariants)
      .set({ purchasable: false, seedVisibleQuantity: 0, updatedAt: new Date() })
      .where(eq(schema.productVariants.productId, n.id));
    blocked += 1;
    report.push(`BLOCKED existing ${n.slug}`);
  }

  for (const item of NEW_STOCK_APPLY) {
    const matchSlugs = [item.slug, ...(item.aliases ?? [])];
    const existingProducts = await db
      .select()
      .from(schema.products)
      .where(inArray(schema.products.slug, matchSlugs));

    // Prefer non-archived match; else first
    const existing =
      existingProducts.find((p) => p.productStatus !== "ARCHIVED") ??
      existingProducts[0];

    const flags = riskToStatus(item.risk);
    const featuresText = item.features.join("\n");
    const sellMinor =
      item.sellNpr != null ? Math.round(item.sellNpr * 100) : null;
    const compareMinor =
      item.compareAtNpr != null ? Math.round(item.compareAtNpr * 100) : null;
    const costUsdMinor =
      item.costNpr != null ? Math.round((item.costNpr / 160) * 100) : 0;

    if (existing) {
      const [variant] = await db
        .select()
        .from(schema.productVariants)
        .where(eq(schema.productVariants.productId, existing.id))
        .limit(1);

      const existingCostNpr =
        variant?.supplierCostUsdMinor != null
          ? Math.round((variant.supplierCostUsdMinor / 100) * 160)
          : null;

      const keepBetterDeal =
        item.costNpr != null &&
        existingCostNpr != null &&
        existingCostNpr > 0 &&
        existingCostNpr < item.costNpr;

      if (keepBetterDeal) {
        // Existing live Buy Now deal is cheaper for TRIHEX — do not overwrite
        keptBetter += 1;
        report.push(
          `KEEP BETTER DEAL ${existing.slug} (cost NPR ${existingCostNpr} < new ${item.costNpr})`,
        );
        // Still refresh features / description lightly
        await db
          .update(schema.products)
          .set({
            longDescription: featuresText || existing.longDescription,
            updatedAt: new Date(),
          })
          .where(eq(schema.products.id, existing.id));
        continue;
      }

      // Update to new stock (lower/equal cost or new risk positioning)
      const nextStatus =
        keepBetterDeal
          ? existing.productStatus
          : flags.productStatus;

      await db
        .update(schema.products)
        .set({
          name: item.name,
          shortDescription: item.shortDescription,
          longDescription: featuresText || null,
          productStatus: flags.productStatus as never,
          complianceStatus: flags.complianceStatus as never,
          needsDataVerification: flags.needsDataVerification,
          featured: Boolean(item.featured) && flags.productStatus === "PUBLIC",
          searchable: true,
          blockedReason:
            flags.productStatus === "BLOCKED"
              ? "High-risk / contact WhatsApp only"
              : null,
          publishedAt:
            flags.productStatus === "PUBLIC" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, existing.id));

      if (variant && sellMinor != null) {
        await db
          .update(schema.productVariants)
          .set({
            manualSellingPriceNprMinor: sellMinor,
            compareAtPriceNprMinor: compareMinor,
            supplierCostUsdMinor: costUsdMinor,
            supplierCostMinor: costUsdMinor,
            seedVisibleQuantity: item.stock,
            purchasable:
              flags.purchasable && sellMinor > 0 && item.stock !== 0,
            pricingMode: "MANUAL_ONLY",
            active: true,
            updatedAt: new Date(),
          })
          .where(eq(schema.productVariants.id, variant.id));
      }

      updated += 1;
      report.push(
        `UPDATED ${existing.slug} → ${flags.productStatus} sell=${item.sellNpr} cost=${item.costNpr}`,
      );
      void nextStatus;
      continue;
    }

    // Insert new
    if (item.sellNpr == null && item.risk !== "BLOCK") {
      report.push(`SKIP insert ${item.slug} — no price`);
      continue;
    }

    const [created] = await db
      .insert(schema.products)
      .values({
        brandId: brandIds.get(item.brandSlug),
        categoryId: categoryIds.get(item.categorySlug),
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription,
        longDescription: featuresText || null,
        sourceListingText: item.name,
        productType: "DIGITAL_LICENSE",
        fulfillmentType: "MANUAL_CUSTOMER_EMAIL_ACTIVATION",
        productStatus: flags.productStatus as never,
        complianceStatus: flags.complianceStatus as never,
        supplyAuthorizationType: "UNKNOWN",
        vendorProofStatus: "NOT_UPLOADED",
        needsDataVerification: flags.needsDataVerification,
        featured: Boolean(item.featured) && flags.productStatus === "PUBLIC",
        searchable: true,
        blockedReason:
          flags.productStatus === "BLOCKED"
            ? "High-risk / contact WhatsApp only"
            : null,
        publishedAt: flags.productStatus === "PUBLIC" ? new Date() : null,
      })
      .returning();

    const sku = `THX-${item.slug.slice(0, 14).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    await db.insert(schema.productVariants).values({
      productId: created.id,
      sku,
      variantName: "Standard",
      durationValue: 1,
      durationUnit: "MONTH",
      supplierCurrency: "USD",
      supplierCostMinor: costUsdMinor,
      supplierCostUsdMinor: costUsdMinor,
      manualSellingPriceNprMinor: sellMinor ?? 0,
      compareAtPriceNprMinor: compareMinor,
      pricingMode: "MANUAL_ONLY",
      active: true,
      purchasable: flags.purchasable && (sellMinor ?? 0) > 0 && item.stock !== 0,
      seedVisibleQuantity: item.stock,
    });

    inserted += 1;
    report.push(
      `INSERTED ${item.slug} → ${flags.productStatus} sell=${item.sellNpr} cost=${item.costNpr}`,
    );
  }

  console.log(
    JSON.stringify({ inserted, updated, keptBetter, blockedNord: blocked }, null, 2),
  );
  for (const line of report) console.log(line);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
