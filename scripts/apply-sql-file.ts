/**
 * Apply SQL file(s) via postgres.js. Never prints connection strings or file secrets.
 * Usage: npx tsx scripts/apply-sql-file.ts path/to/file.sql [more.sql...]
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import postgres from "postgres";
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";

config({ path: ".env.local" });
normalizeEnvAliases();

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: apply-sql-file.ts <file.sql> [...]");
    process.exit(1);
  }

  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL/DIRECT_URL MISSING");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, prepare: false });
  try {
    for (const file of files) {
      const body = readFileSync(file, "utf8");
      console.log("APPLYING", file);
      await sql.unsafe(body);
      console.log("APPLIED_OK", file);
    }
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message.replace(/postgres(ql)?:\/\/[^\s]+/gi, "[REDACTED]")
        : "unknown";
    console.error("APPLY_FAILED", msg);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
