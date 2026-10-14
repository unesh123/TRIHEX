import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, inArray } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { extractDuration } from "../src/lib/catalog/duration-parser";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("Connected to database. Starting catalog duration healing...");

  // 1. Fetch all products and their variants
  const products = await db.select().from(schema.products);
  console.log(`Found ${products.length} products in database.`);

  let healedVariantsCount = 0;
  for (const prod of products) {
    const parsed = extractDuration(prod.name) || extractDuration(prod.slug);
    if (!parsed) continue;

    // Get variants for this product
    const variants = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.productId, prod.id));

    for (const v of variants) {
      if (v.durationValue !== parsed.value || v.durationUnit !== parsed.unit) {
        await db
          .update(schema.productVariants)
          .set({
            durationValue: parsed.value,
            durationUnit: parsed.unit,
            variantName: parsed.label,
            updatedAt: new Date(),
          })
          .where(eq(schema.productVariants.id, v.id));
        healedVariantsCount++;
        console.log(
          `[HEALED] ${prod.slug}: ${v.durationValue} ${v.durationUnit} -> ${parsed.value} ${parsed.unit} (${parsed.label})`,
        );
      }
    }
  }
  console.log(`Successfully healed ${healedVariantsCount} variants.`);

  // 2. Archive duplicate unverified inquiry products
  const archiveSlugs = ["capcut-pro-1-month", "chatgpt-plus-1-month"];
  for (const slug of archiveSlugs) {
    const existing = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.slug, slug));

    if (existing.length > 0) {
      await db
        .update(schema.products)
        .set({
          productStatus: "ARCHIVED",
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, existing[0]!.id));

      await db
        .update(schema.productVariants)
        .set({
          purchasable: false,
          active: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.productVariants.productId, existing[0]!.id));
      console.log(`[ARCHIVED] Duplicate slug: ${slug}`);
    }
  }

  // 3. Rename "ElevenLabs Creator — Shared Plan"
  const elevenlabs = await db
    .select({ id: schema.products.id, name: schema.products.name })
    .from(schema.products)
    .where(eq(schema.products.slug, "elevenlabs-creator-shared"));

  if (elevenlabs.length > 0) {
    await db
      .update(schema.products)
      .set({
        name: "ElevenLabs Creator — AI Voice Studio",
        sourceListingText: "ElevenLabs Creator — AI Voice Studio",
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, elevenlabs[0]!.id));
    console.log("[RENAMED] ElevenLabs Creator — AI Voice Studio");
  }

  // 4. Verify CapCut Pro 30-day selling price is 399 NPR
  const capcut30 = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.slug, "capcut-pro-30-days"));

  if (capcut30.length > 0) {
    await db
      .update(schema.productVariants)
      .set({
        manualSellingPriceNprMinor: 39900,
        purchasable: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.productVariants.productId, capcut30[0]!.id));
    console.log("[VERIFIED] CapCut Pro 30-day selling price set to Rs. 399");
  }

  console.log("Database catalog healing completed successfully!");
  await client.end();
}

main().catch((err) => {
  console.error("Healing failed:", err);
  process.exit(1);
});
