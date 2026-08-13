import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL!;
  const sql = postgres(url, { prepare: false, max: 1 });
  const rows = await sql`
    select p.slug, p.name, p.product_status,
           coalesce(pm.url, '') as media_url
    from products p
    left join lateral (
      select url from product_media m
      where m.product_id = p.id
      order by m.is_primary desc, m.sort_order asc
      limit 1
    ) pm on true
    where p.product_status <> 'ARCHIVED'
    order by p.name
  `;
  for (const r of rows) {
    console.log(`${r.product_status}\t${r.slug}\t${r.media_url || "(manifest)"}`);
  }
  console.log("TOTAL", rows.length);
  await sql.end();
}
main();
