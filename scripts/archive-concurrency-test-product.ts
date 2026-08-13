import { config } from "dotenv";
import postgres from "postgres";
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";

config({ path: ".env.local" });
normalizeEnvAliases();

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL MISSING");
    process.exit(1);
  }
  const sql = postgres(url, { max: 1, prepare: false });
  try {
    const r = await sql`
      update products
      set product_status = 'ARCHIVED', updated_at = now()
      where slug = 'concurrency-test-product'
      returning slug, product_status
    `;
    console.log(
      "ARCHIVED",
      r[0]?.slug ?? "MISSING",
      r[0]?.product_status ?? "MISSING",
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
