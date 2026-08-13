import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL / POSTGRES_URL missing");
  const sql = postgres(url, { prepare: false, max: 1 });
  const rows = await sql`
    select p.slug,
           v.manual_selling_price_npr_minor / 100 as price,
           p.product_status,
           p.compliance_status,
           v.purchasable
    from products p
    join product_variants v on v.product_id = p.id
    where p.slug in (
      'gemini-pro-18-months-link',
      'chatgpt-plus-1-month-fw',
      'gemini-pro-4-month-link'
    )
  `;
  console.log(JSON.stringify(rows, null, 2));
  await sql.end();
}

main();
