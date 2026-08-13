/**
 * Repair env vars that were accidentally set to the literal string "[SENSITIVE]".
 * Never prints secret values.
 */
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";

config({ path: ".env.local" });
normalizeEnvAliases();

const PUBLIC_FIXES: Record<string, string> = {
  NEXT_PUBLIC_SITE_URL: "https://trihexdigital.shop",
  NEXT_PUBLIC_APP_URL: "https://trihexdigital.shop",
  NEXT_PUBLIC_BUSINESS_NAME: "TRIHEX DIGITAL",
  NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY: "+977 9702910130",
  NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER: "9779702910130",
  PRODUCT_MEDIA_STORAGE_BUCKET: "product-media",
  PAYMENT_PROOF_STORAGE_BUCKET: "payment-proofs",
  PRIVATE_DOCUMENT_STORAGE_BUCKET: "private-documents",
  PAYMENT_QR_STORAGE_BUCKET: "payment-qr",
  DEMO_MODE: "false",
  ADMIN_DEV_BYPASS: "false",
};

function isPlaceholder(v: string | undefined): boolean {
  if (!v) return true;
  const t = v.trim();
  return (
    t === "[SENSITIVE]" ||
    t === "https://[SENSITIVE]" ||
    /SENSITIVE/i.test(t)
  );
}

function get(raw: string, key: string): string {
  const m = raw.match(new RegExp(`^${key}=\\"?([^\\"\\r\\n]*)`, "m"));
  return m?.[1] ?? "";
}

function set(raw: string, key: string, value: string): string {
  const line = `${key}="${value}"`;
  if (new RegExp(`^${key}=`, "m").test(raw)) {
    return raw.replace(new RegExp(`^${key}=.*$`, "m"), line);
  }
  return `${raw.trimEnd()}\n${line}\n`;
}

let raw = readFileSync(".env.local", "utf8");

for (const [k, v] of Object.entries(PUBLIC_FIXES)) {
  if (isPlaceholder(get(raw, k)) || !get(raw, k)) {
    raw = set(raw, k, v);
    console.log("FIXED", k);
  } else {
    console.log("KEEP", k);
  }
}

const postgresUrl = get(raw, "POSTGRES_URL");
const postgresDirect = get(raw, "POSTGRES_URL_NON_POOLING") || postgresUrl;
if (isPlaceholder(get(raw, "DATABASE_URL")) && postgresUrl) {
  raw = set(raw, "DATABASE_URL", postgresUrl);
  console.log("FIXED DATABASE_URL from POSTGRES_URL");
}
if (isPlaceholder(get(raw, "DIRECT_URL")) && postgresDirect) {
  raw = set(raw, "DIRECT_URL", postgresDirect);
  console.log("FIXED DIRECT_URL from POSTGRES_URL_NON_POOLING");
}

for (const k of ["AUTH_SECRET", "CRON_SECRET", "ENCRYPTION_KEY", "IP_HASH_SALT"]) {
  if (isPlaceholder(get(raw, k))) {
    raw = set(raw, k, randomBytes(32).toString("hex"));
    console.log("GENERATED", k);
  }
}

writeFileSync(".env.local", raw);
console.log("LOCAL_ENV_REPAIRED");

// Harden getSiteUrl path: also export public fixes list for vercel push script
writeFileSync(
  ".env.public.fixes.json",
  JSON.stringify(PUBLIC_FIXES, null, 2),
);
console.log("WROTE .env.public.fixes.json");
