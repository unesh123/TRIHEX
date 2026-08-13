/**
 * Appends missing TRIHEX app config to .env.local.
 * Prints only key names / PRESENT|MISSING — never secret values.
 */
import { config } from "dotenv";
import { randomBytes } from "crypto";
import { appendFileSync } from "fs";
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";

config({ path: ".env.local" });
normalizeEnvAliases();

const need: Record<string, string> = {};
function ensure(key: string, value: string) {
  const cur = process.env[key];
  if (cur == null || String(cur).trim() === "") need[key] = value;
}

ensure("DEMO_MODE", "false");
ensure("ADMIN_DEV_BYPASS", "false");
ensure("AUTH_SECRET", randomBytes(48).toString("base64url"));
ensure("ENCRYPTION_KEY", randomBytes(32).toString("hex"));
ensure("IP_HASH_SALT", randomBytes(32).toString("hex"));
ensure("CRON_SECRET", randomBytes(32).toString("base64url"));
ensure("PRODUCT_MEDIA_STORAGE_BUCKET", "product-media");
ensure("PAYMENT_PROOF_STORAGE_BUCKET", "payment-proofs");
ensure("PRIVATE_DOCUMENT_STORAGE_BUCKET", "private-documents");
ensure("PAYMENT_QR_STORAGE_BUCKET", "payment-qr");
ensure("NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER", "9779702910130");
ensure("NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY", "+977 9702910130");
ensure("NEXT_PUBLIC_BUSINESS_NAME", "TRIHEX DIGITAL");
ensure("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
  need.DATABASE_URL = process.env.POSTGRES_URL;
}
if (!process.env.DIRECT_URL && process.env.POSTGRES_URL_NON_POOLING) {
  need.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING;
}
if (
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
) {
  need.NEXT_PUBLIC_SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}

if (Object.keys(need).length > 0) {
  const lines = Object.entries(need).map(
    ([k, v]) => `${k}=${JSON.stringify(v)}`,
  );
  appendFileSync(
    ".env.local",
    `\n# TRIHEX app config (generated; do not commit)\n${lines.join("\n")}\n`,
  );
}

console.log("APP_CONFIG_KEYS_ADDED", Object.keys(need).join(",") || "none");
console.log(
  "DATABASE_URL",
  process.env.DATABASE_URL || need.DATABASE_URL ? "PRESENT" : "MISSING",
);
console.log(
  "DIRECT_URL",
  process.env.DIRECT_URL || need.DIRECT_URL ? "PRESENT" : "MISSING",
);
console.log("AUTH_SECRET", process.env.AUTH_SECRET || need.AUTH_SECRET ? "PRESENT" : "MISSING");
console.log("DEMO_MODE", process.env.DEMO_MODE || need.DEMO_MODE || "MISSING");
console.log(
  "ADMIN_DEV_BYPASS",
  process.env.ADMIN_DEV_BYPASS || need.ADMIN_DEV_BYPASS || "MISSING",
);
