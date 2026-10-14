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
  console.log("=== CHECKING AND CLEANING ELEVENLABS VARIANTS ===");

  const existing = await sql`
    SELECT p.slug, pv.id, pv.sku, pv.variant_name, pv.duration_value, pv.duration_unit, pv.manual_selling_price_npr_minor, pv.purchasable
    FROM products p
    JOIN product_variants pv ON p.id = pv.product_id
    WHERE p.slug = 'elevenlabs-creator-shared'
    ORDER BY pv.manual_selling_price_npr_minor ASC
  `;

  console.log("Current variants in DB:", existing);

  // Delete all variants for elevenlabs-creator-shared that are NOT ELV-1M-CREATOR or ELV-4M-CREATOR
  const deleted = await sql`
    DELETE FROM product_variants
    WHERE product_id IN (SELECT id FROM products WHERE slug = 'elevenlabs-creator-shared')
      AND sku NOT IN ('ELV-1M-CREATOR', 'ELV-4M-CREATOR')
    RETURNING sku, variant_name
  `;
  console.log("Deleted old non-working variants:", deleted);

  const finalVariants = await sql`
    SELECT p.slug, pv.sku, pv.variant_name, pv.duration_value, pv.duration_unit, pv.manual_selling_price_npr_minor, pv.purchasable
    FROM products p
    JOIN product_variants pv ON p.id = pv.product_id
    WHERE p.slug = 'elevenlabs-creator-shared'
    ORDER BY pv.manual_selling_price_npr_minor ASC
  `;
  console.log("Final active variants:", finalVariants);

  await sql.end();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
