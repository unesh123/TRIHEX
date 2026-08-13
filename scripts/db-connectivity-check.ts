/**
 * Safe DB connectivity + schema inspection (never prints connection strings).
 */
import { config } from "dotenv";
import postgres from "postgres";
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";

config({ path: ".env.local" });
normalizeEnvAliases();

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("CONNECTIVITY FAIL: DATABASE_URL/DIRECT_URL MISSING");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, prepare: false });

  try {
    const ping = await sql`select 1 as ok`;
    console.log("CONNECTIVITY", ping[0]?.ok === 1 ? "OK" : "UNEXPECTED");

    const tables = await sql`
      select count(*)::int as n
      from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
    `;
    console.log("PUBLIC_TABLE_COUNT", tables[0]?.n ?? 0);

    const names = await sql`
      select table_name
      from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name
    `;
    console.log(
      "PUBLIC_TABLES",
      names.map((r) => r.table_name).join(",") || "(none)",
    );

    const extensions = await sql`
      select extname from pg_extension order by extname
    `;
    console.log(
      "EXTENSIONS",
      extensions.map((r) => r.extname).join(","),
    );
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message.replace(/postgres(ql)?:\/\/[^\s]+/gi, "[REDACTED]")
        : "unknown";
    console.error("CONNECTIVITY_ERROR", msg);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
