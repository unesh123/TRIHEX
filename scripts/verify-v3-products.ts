import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  console.log("=== CAPCUT PRODUCTS & VARIANTS ===");
  const capcut = await sql`
    SELECT p.id, p.slug, p.name, p.product_status, pv.sku, pv.variant_name, pv.manual_selling_price_npr_minor, pv.purchasable
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    WHERE p.slug LIKE '%capcut%'
    ORDER BY p.slug
  `;
  console.log(capcut);

  console.log("\n=== LOVABLE PRODUCTS & VARIANTS ===");
  const lovable = await sql`
    SELECT p.id, p.slug, p.name, p.product_status, pv.sku, pv.variant_name, pv.manual_selling_price_npr_minor, pv.purchasable
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    WHERE p.slug LIKE '%lovable%'
    ORDER BY p.slug
  `;
  console.log(lovable);

  await sql.end();
}

main().catch(console.error);
