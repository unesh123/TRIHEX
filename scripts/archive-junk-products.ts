/**
 * Archive obvious draft / typo catalogue rows so they leave the shop.
 * Run: npx tsx scripts/archive-junk-products.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl || dbUrl.includes("[SENSITIVE]")) {
    throw new Error("DATABASE_URL required (pull with vercel env pull if needed)");
  }
  const sql = postgres(dbUrl, { prepare: false, max: 1 });

  const rows = await sql`
    select id, name, slug, product_status
    from products
    where name ilike '%moths%'
       or name ilike '%(plan)%'
       or slug ilike '%moths%'
  `;

  console.log(`Found ${rows.length} candidate(s)`);
  for (const row of rows) {
    console.log(`- ${row.slug} · ${row.name} · ${row.product_status}`);
    await sql`
      update products
      set product_status = 'ARCHIVED',
          searchable = false,
          featured = false,
          needs_data_verification = true,
          updated_at = now()
      where id = ${row.id}
    `;
    await sql`
      update product_variants
      set purchasable = false, active = false, updated_at = now()
      where product_id = ${row.id}
    `;
  }
  await sql.end();
  console.log("Done — archived junk listings.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
