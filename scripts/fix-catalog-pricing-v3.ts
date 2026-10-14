import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });
  console.log("=== APPLYING TRIHEX V3 CORE CATALOG FIXES ===");

  // 1. CAPCUT PRO: Ensure 1-Month is strictly Rs. 399, 7-Days is Rs. 199, 6-Months is Rs. 3,559
  console.log("\n[1] Updating CapCut Pro plans on 'capcut-pro'...");
  await sql`
    UPDATE product_variants
    SET manual_selling_price_npr_minor = 19900,
        variant_name = '7 Days Full Warranty',
        duration_value = 7,
        duration_unit = 'DAY',
        purchasable = true
    WHERE sku = 'CAP-7D-FW'
  `;
  console.log("-> CAP-7D-FW set to Rs. 199");

  await sql`
    UPDATE product_variants
    SET manual_selling_price_npr_minor = 39900,
        variant_name = '1 Month Full Warranty',
        duration_value = 1,
        duration_unit = 'MONTH',
        purchasable = true
    WHERE sku = 'CAP-1M-FW'
  `;
  console.log("-> CAP-1M-FW set to Rs. 399 (Invariant Preserved)");

  await sql`
    UPDATE product_variants
    SET manual_selling_price_npr_minor = 355900,
        variant_name = '6 Months Full Warranty',
        duration_value = 6,
        duration_unit = 'MONTH',
        purchasable = true
    WHERE sku = 'CAP-6M-FW'
  `;
  console.log("-> CAP-6M-FW set to Rs. 3,559");

  // Disable 3M variant if needed or keep at accurate price
  await sql`
    UPDATE product_variants
    SET purchasable = false
    WHERE sku = 'CAP-3M-FW'
  `;

  // 2. LOVABLE PRO: Delete old conflicting variants, keep Lovable Unlimited Generation Method @ Rs. 3,999
  console.log("\n[2] Cleaning Lovable Pro variants on 'lovable-pro-12m'...");
  const deletedLov = await sql`
    DELETE FROM product_variants
    WHERE product_id IN (SELECT id FROM products WHERE slug = 'lovable-pro-12m')
      AND sku != 'LOV-UNLIMITED'
    RETURNING sku, variant_name
  `;
  console.log("-> Removed conflicting Lovable variants:", deletedLov);

  await sql`
    UPDATE product_variants
    SET variant_name = 'Lovable Unlimited Generation Method',
        duration_value = 1,
        duration_unit = 'MONTH',
        manual_selling_price_npr_minor = 399900,
        compare_at_price_npr_minor = 1499900,
        purchasable = true,
        warranty_coverage = 'NONE',
        warranty_value = 0,
        seed_visible_quantity = 25
    WHERE sku = 'LOV-UNLIMITED'
  `;
  console.log("-> LOV-UNLIMITED set to Rs. 3,999 (No warranty, unlimited generation)");

  // 3. CLAUDE CODE API ACCESS: Keep $100 Key @ Rs. 1,799 & $500 Key @ Rs. 3,699
  console.log("\n[3] Streamlining Claude Code API Access variants...");
  // Disable old token daily packages
  await sql`
    UPDATE product_variants
    SET purchasable = false
    WHERE product_id IN (SELECT id FROM products WHERE slug = 'claude-code-api-access')
      AND sku NOT IN ('CLD-API-100USD', 'CLD-API-500USD')
  `;
  console.log("-> Streamlined Claude Code API Access to $100 & $500 keys.");

  // 4. CLAUDE PRO 1-MONTH & 12-MONTHS
  console.log("\n[4] Confirming Claude Pro prices...");
  await sql`
    UPDATE product_variants
    SET manual_selling_price_npr_minor = 169900,
        purchasable = true
    WHERE product_id IN (SELECT id FROM products WHERE slug = 'claude-pro-1-month')
  `;
  await sql`
    UPDATE product_variants
    SET manual_selling_price_npr_minor = 1699900,
        purchasable = true
    WHERE product_id IN (SELECT id FROM products WHERE slug = 'claude-pro-12-months')
  `;
  console.log("-> Claude Pro 1M: Rs. 1,699 | Claude Pro 12M: Rs. 16,999");

  // 5. ELEVENLABS CREATOR: 1M @ Rs. 2,699 & 4M @ Rs. 4,699
  console.log("\n[5] Confirming ElevenLabs Creator prices...");
  await sql`
    UPDATE product_variants
    SET manual_selling_price_npr_minor = 269900,
        purchasable = true
    WHERE sku = 'ELV-1M-CREATOR'
  `;
  await sql`
    UPDATE product_variants
    SET manual_selling_price_npr_minor = 469900,
        purchasable = true
    WHERE sku = 'ELV-4M-CREATOR'
  `;
  console.log("-> ElevenLabs 1M: Rs. 2,699 | ElevenLabs 4M: Rs. 4,699");

  console.log("\n=== ALL DATABASE FIXES APPLIED SUCCESSFULLY ===");
  await sql.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
