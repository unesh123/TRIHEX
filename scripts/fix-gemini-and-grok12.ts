/**
 * Emergency restore: Gemini 18M best deal + insert Super Grok 12M if missing.
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

async function main() {
  const candidates = [
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL,
  ]
    .map((v) => (v ?? "").trim().replace(/^["']|["']$/g, ""))
    .filter((v) => /^postgres(ql)?:\/\//i.test(v));
  const url = candidates[0]!;
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  // Restore Gemini best deal (cost NPR 109 / sell 399 / PUBLIC)
  const [gemini] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, "gemini-pro-18-months-link"))
    .limit(1);

  if (gemini) {
    await db
      .update(schema.products)
      .set({
        name: "Gemini Pro 5 TB — 18 Months",
        shortDescription:
          "Gemini Pro with 5 TB storage for 18 months. Website checkout is the order of record.",
        productStatus: "PUBLIC",
        complianceStatus: "APPROVED",
        needsDataVerification: false,
        featured: true,
        blockedReason: null,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, gemini.id));

    await db
      .update(schema.productVariants)
      .set({
        manualSellingPriceNprMinor: 39900,
        compareAtPriceNprMinor: 99900,
        supplierCostUsdMinor: Math.round((109 / 160) * 100),
        supplierCostMinor: Math.round((109 / 160) * 100),
        purchasable: true,
        seedVisibleQuantity: 61,
        updatedAt: new Date(),
      })
      .where(eq(schema.productVariants.productId, gemini.id));

    console.log("Restored gemini-pro-18-months-link PUBLIC Rs.399 cost 109");
  }

  // Insert Super Grok 12M if missing (don't alias to 10-months)
  const [g12] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, "super-grok-12-months"))
    .limit(1);

  if (!g12) {
    const [brand] = await db
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.slug, "grok"))
      .limit(1);
    const [cat] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, "ai-tools"))
      .limit(1);

    const [created] = await db
      .insert(schema.products)
      .values({
        brandId: brand?.id,
        categoryId: cat?.id,
        name: "Super Grok — 12 Months",
        slug: "super-grok-12-months",
        shortDescription: "Grok Super — 12 months. Check availability first.",
        longDescription:
          "Grok Super model access for 12 months\nFeatures as included in the Super plan\nAvailability confirmed on WhatsApp\nDelivery after payment verification",
        sourceListingText: "Super Grok — 12 Months",
        productType: "DIGITAL_LICENSE",
        fulfillmentType: "MANUAL_CUSTOMER_EMAIL_ACTIVATION",
        productStatus: "DRAFT",
        complianceStatus: "DOCUMENTS_REQUIRED",
        supplyAuthorizationType: "UNKNOWN",
        vendorProofStatus: "NOT_UPLOADED",
        needsDataVerification: true,
        featured: false,
        searchable: true,
      })
      .returning();

    await db.insert(schema.productVariants).values({
      productId: created.id,
      sku: `THX-SUPERGROK12-${Date.now().toString().slice(-4)}`,
      variantName: "Standard",
      durationValue: 12,
      durationUnit: "MONTH",
      supplierCurrency: "USD",
      supplierCostUsdMinor: Math.round((3520 / 160) * 100),
      supplierCostMinor: Math.round((3520 / 160) * 100),
      manualSellingPriceNprMinor: 528000,
      compareAtPriceNprMinor: 1161600,
      pricingMode: "MANUAL_ONLY",
      active: true,
      purchasable: false,
      seedVisibleQuantity: 3,
    });
    console.log("Inserted super-grok-12-months DRAFT");
  } else {
    console.log("super-grok-12-months already exists");
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
