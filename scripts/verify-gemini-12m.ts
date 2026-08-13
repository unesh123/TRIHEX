import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL!;
  const sql = postgres(url, { prepare: false, max: 1 });
  const rows = await sql`
    select p.slug, v.manual_selling_price_npr_minor/100 as price, p.product_status
    from products p
    join product_variants v on v.product_id = p.id
    where p.slug = 'gemini-ai-pro-5tb-12m-mail-a'
  `;
  console.log(rows);
  await sql.end();
}
main();
