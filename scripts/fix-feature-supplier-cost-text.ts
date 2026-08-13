import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
  const r = await sql`
    update products
    set long_description = replace(long_description, 'above supplier cost', 'profitable'),
        updated_at = now()
    where long_description ilike '%supplier cost%'
  `;
  console.log("updated", r.count);
  await sql.end();
}

main();
