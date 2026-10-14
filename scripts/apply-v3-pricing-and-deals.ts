import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, inArray, ilike } from "drizzle-orm";
import * as schema from "../src/db/schema";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("=== TRIHEX DIGITAL V3: DATABASE PRICING, VARIANTS & DEALS MIGRATION ===");

  // 1. ELEVENLABS CREATOR: 1 Month @ Rs. 2,699 & 4 Months @ Rs. 4,699 ONLY
  console.log("\n[1] Updating ElevenLabs Creator plans...");
  const elevenlabsProduct = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, "elevenlabs-creator-shared"))
    .limit(1);

  if (elevenlabsProduct.length > 0) {
    const prodId = elevenlabsProduct[0].id;
    // Set product status to PUBLIC
    await db
      .update(schema.products)
      .set({
        productStatus: "PUBLIC",
        name: "ElevenLabs Creator — AI Voice Studio",
        shortDescription: "Ultra-realistic AI voice cloning, synthesis and studio generation with commercial rights.",
      })
      .where(eq(schema.products.id, prodId));

    // Disable all existing variants first
    await db
      .update(schema.productVariants)
      .set({ purchasable: false })
      .where(eq(schema.productVariants.productId, prodId));

    // Upsert 1 Month Plan (Rs. 2,699)
    const existing1M = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.sku, "ELV-1M-CREATOR"))
      .limit(1);

    if (existing1M.length > 0) {
      await db
        .update(schema.productVariants)
        .set({
          variantName: "1 Month Creator Plan",
          durationValue: 1,
          durationUnit: "MONTH",
          manualSellingPriceNprMinor: 269900,
          compareAtPriceNprMinor: 599900,
          purchasable: true,
          seedVisibleQuantity: 15,
        })
        .where(eq(schema.productVariants.id, existing1M[0].id));
      console.log("-> Updated 1 Month Creator Plan: Rs. 2,699 (purchasable: true)");
    } else {
      await db.insert(schema.productVariants).values({
        id: crypto.randomUUID(),
        productId: prodId,
        sku: "ELV-1M-CREATOR",
        variantName: "1 Month Creator Plan",
        durationValue: 1,
        durationUnit: "MONTH",
        manualSellingPriceNprMinor: 269900,
        compareAtPriceNprMinor: 599900,
        purchasable: true,
        seedVisibleQuantity: 15,
        warrantyCoverage: "FULL_TERM",
        warrantyValue: 30,
        activationMethod: "CUSTOMER_EMAIL_ACTIVATION",
      });
      console.log("-> Inserted 1 Month Creator Plan: Rs. 2,699 (purchasable: true)");
    }

    // Upsert 4 Months Plan (Rs. 4,699)
    const existing4M = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.sku, "ELV-4M-CREATOR"))
      .limit(1);

    if (existing4M.length > 0) {
      await db
        .update(schema.productVariants)
        .set({
          variantName: "4 Months Creator Plan",
          durationValue: 4,
          durationUnit: "MONTH",
          manualSellingPriceNprMinor: 469900,
          compareAtPriceNprMinor: 1099900,
          purchasable: true,
          seedVisibleQuantity: 10,
        })
        .where(eq(schema.productVariants.id, existing4M[0].id));
      console.log("-> Updated 4 Months Creator Plan: Rs. 4,699 (purchasable: true)");
    } else {
      await db.insert(schema.productVariants).values({
        id: crypto.randomUUID(),
        productId: prodId,
        sku: "ELV-4M-CREATOR",
        variantName: "4 Months Creator Plan",
        durationValue: 4,
        durationUnit: "MONTH",
        manualSellingPriceNprMinor: 469900,
        compareAtPriceNprMinor: 1099900,
        purchasable: true,
        seedVisibleQuantity: 10,
        warrantyCoverage: "FULL_TERM",
        warrantyValue: 120,
        activationMethod: "CUSTOMER_EMAIL_ACTIVATION",
      });
      console.log("-> Inserted 4 Months Creator Plan: Rs. 4,699 (purchasable: true)");
    }
  }

  // 2. CLAUDE PRO & API KEY PLANS
  console.log("\n[2] Updating Claude Pro & API Key plans...");
  // A) Claude Pro 1 Month: Rs. 1,699
  const claude1M = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, "claude-pro-1-month"))
    .limit(1);

  if (claude1M.length > 0) {
    const prodId = claude1M[0].id;
    await db
      .update(schema.products)
      .set({
        productStatus: "PUBLIC",
        complianceStatus: "APPROVED",
        shortDescription: "Anthropic Claude Pro 1-Month high-speed access with Claude 3.5 Sonnet, Projects, and priority capacity.",
      })
      .where(eq(schema.products.id, prodId));

    await db
      .update(schema.productVariants)
      .set({
        manualSellingPriceNprMinor: 169900, // Rs. 1,699 (well below original ~$20/mo)
        compareAtPriceNprMinor: 374000,
        purchasable: true,
        durationValue: 1,
        durationUnit: "MONTH",
        variantName: "Pro · 1 Month",
        seedVisibleQuantity: 12,
      })
      .where(eq(schema.productVariants.productId, prodId));
    console.log("-> Updated Claude Pro 1-Month: Rs. 1,699 (PUBLIC, purchasable: true)");
  }

  // B) Claude Pro 12 Months: Rs. 16,999
  const claude12M = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, "claude-pro-12-months"))
    .limit(1);

  if (claude12M.length > 0) {
    const prodId = claude12M[0].id;
    await db
      .update(schema.products)
      .set({
        productStatus: "PUBLIC",
        complianceStatus: "APPROVED",
        shortDescription: "Anthropic Claude Pro 12-Month full annual plan with priority reasoning, Artifacts, and Projects.",
      })
      .where(eq(schema.products.id, prodId));

    await db
      .update(schema.productVariants)
      .set({
        manualSellingPriceNprMinor: 1699900, // Rs. 16,999 (Original $240 = ~Rs. 33,000)
        compareAtPriceNprMinor: 3432000,
        purchasable: true,
        durationValue: 12,
        durationUnit: "MONTH",
        variantName: "Pro · 12 Months (1 Year)",
        seedVisibleQuantity: 5,
      })
      .where(eq(schema.productVariants.productId, prodId));
    console.log("-> Updated Claude Pro 12-Months: Rs. 16,999 (PUBLIC, purchasable: true)");
  }

  // C) Claude Code API Key Plans: $100 Key @ Rs. 1,799 & $500 Key @ Rs. 3,699
  const claudeApiProd = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, "claude-code-api-access"))
    .limit(1);

  if (claudeApiProd.length > 0) {
    const prodId = claudeApiProd[0].id;
    await db
      .update(schema.products)
      .set({
        productStatus: "PUBLIC",
        complianceStatus: "APPROVED",
        shortDescription: "Full Claude API Access for Claude Code CLI, Cursor, and custom agents. Supports Sonnet 3.7, Opus 4.8 Thinking, and high-level reasoning.",
      })
      .where(eq(schema.products.id, prodId));

    // Upsert $100 API Key (Rs. 1,799)
    const existing100 = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.sku, "CLD-API-100USD"))
      .limit(1);

    if (existing100.length > 0) {
      await db
        .update(schema.productVariants)
        .set({
          variantName: "$100 Claude API Key (1 Month)",
          durationValue: 1,
          durationUnit: "MONTH",
          manualSellingPriceNprMinor: 179900,
          compareAtPriceNprMinor: 1400000,
          purchasable: true,
          seedVisibleQuantity: 20,
        })
        .where(eq(schema.productVariants.id, existing100[0].id));
      console.log("-> Updated $100 Claude API Key: Rs. 1,799 (purchasable: true)");
    } else {
      await db.insert(schema.productVariants).values({
        id: crypto.randomUUID(),
        productId: prodId,
        sku: "CLD-API-100USD",
        variantName: "$100 Claude API Key (1 Month)",
        durationValue: 1,
        durationUnit: "MONTH",
        manualSellingPriceNprMinor: 179900,
        compareAtPriceNprMinor: 1400000,
        purchasable: true,
        seedVisibleQuantity: 20,
        warrantyCoverage: "FULL_TERM",
        warrantyValue: 30,
        activationMethod: "API_KEY_DELIVERY",
      });
      console.log("-> Inserted $100 Claude API Key: Rs. 1,799 (purchasable: true)");
    }

    // Upsert $500 API Key (Rs. 3,699)
    const existing500 = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.sku, "CLD-API-500USD"))
      .limit(1);

    if (existing500.length > 0) {
      await db
        .update(schema.productVariants)
        .set({
          variantName: "$500 Claude Advanced API Key (1 Month)",
          durationValue: 1,
          durationUnit: "MONTH",
          manualSellingPriceNprMinor: 369900,
          compareAtPriceNprMinor: 6800000,
          purchasable: true,
          seedVisibleQuantity: 15,
        })
        .where(eq(schema.productVariants.id, existing500[0].id));
      console.log("-> Updated $500 Claude API Key: Rs. 3,699 (purchasable: true)");
    } else {
      await db.insert(schema.productVariants).values({
        id: crypto.randomUUID(),
        productId: prodId,
        sku: "CLD-API-500USD",
        variantName: "$500 Claude Advanced API Key (1 Month)",
        durationValue: 1,
        durationUnit: "MONTH",
        manualSellingPriceNprMinor: 369900,
        compareAtPriceNprMinor: 6800000,
        purchasable: true,
        seedVisibleQuantity: 15,
        warrantyCoverage: "FULL_TERM",
        warrantyValue: 30,
        activationMethod: "API_KEY_DELIVERY",
      });
      console.log("-> Inserted $500 Claude API Key: Rs. 3,699 (purchasable: true)");
    }
  }

  // 3. LOVABLE PRO AI BUILDER: Unlimited Generation Method @ Rs. 3,999
  console.log("\n[3] Updating Lovable Pro AI Builder...");
  const lovableProd = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, "lovable-pro-12m"))
    .limit(1);

  if (lovableProd.length > 0) {
    const prodId = lovableProd[0].id;
    await db
      .update(schema.products)
      .set({
        productStatus: "PUBLIC",
        name: "Lovable AI Pro — Unlimited Builder",
        shortDescription: "Unlimited Lovable AI generation method. Build and deploy complete full-stack web applications with unlimited AI prompts and zero monthly limits.",
      })
      .where(eq(schema.products.id, prodId));

    // Upsert Unlimited Method Variant (Rs. 3,999)
    const existingUnl = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.sku, "LOV-UNLIMITED"))
      .limit(1);

    if (existingUnl.length > 0) {
      await db
        .update(schema.productVariants)
        .set({
          variantName: "Lovable Unlimited Generation Method",
          durationValue: 1,
          durationUnit: "MONTH",
          manualSellingPriceNprMinor: 399900,
          compareAtPriceNprMinor: 1499900,
          purchasable: true,
          seedVisibleQuantity: 25,
          warrantyCoverage: "NONE",
          warrantyValue: 0,
        })
        .where(eq(schema.productVariants.id, existingUnl[0].id));
      console.log("-> Updated Lovable Unlimited Method: Rs. 3,999 (purchasable: true, no warranty)");
    } else {
      await db.insert(schema.productVariants).values({
        id: crypto.randomUUID(),
        productId: prodId,
        sku: "LOV-UNLIMITED",
        variantName: "Lovable Unlimited Generation Method",
        durationValue: 1,
        durationUnit: "MONTH",
        manualSellingPriceNprMinor: 399900,
        compareAtPriceNprMinor: 1499900,
        purchasable: true,
        seedVisibleQuantity: 25,
        warrantyCoverage: "NONE",
        warrantyValue: 0,
        activationMethod: "WORKFLOW_ACCESS",
      });
      console.log("-> Inserted Lovable Unlimited Method: Rs. 3,999 (purchasable: true, no warranty)");
    }
  }

  // 4. CLEAN UP EXPIRED/BROKEN DEALS
  console.log("\n[4] Cleaning up expired deals from database...");
  try {
    const expiredDeals = await db
      .select()
      .from(schema.dealCandidates)
      .where(eq(schema.dealCandidates.id, "deal-pcloud-lifetime-radar"));

    if (expiredDeals.length > 0) {
      await db.delete(schema.dealRevisions).where(eq(schema.dealRevisions.dealId, "deal-pcloud-lifetime-radar"));
      await db.delete(schema.dealCandidates).where(eq(schema.dealCandidates.id, "deal-pcloud-lifetime-radar"));
      console.log("-> Deleted expired deal-pcloud-lifetime-radar from DB.");
    } else {
      console.log("-> No expired pCloud deal in DB.");
    }
  } catch (err: any) {
    console.log("-> deal_candidates table not present in DB, relying on memory store.", err?.message || err);
  }

  console.log("\n=== MIGRATION COMPLETED SUCCESSFULLY ===");
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
