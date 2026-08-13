/**
 * Push selected non-Marketplace app env vars from .env.local to Vercel.
 * Never prints secret values — only key names and outcomes.
 *
 * Usage: npx tsx scripts/push-app-env-to-vercel.ts
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";

config({ path: ".env.local" });
normalizeEnvAliases();

const KEYS = [
  "DEMO_MODE",
  "ADMIN_DEV_BYPASS",
  "AUTH_SECRET",
  "ENCRYPTION_KEY",
  "IP_HASH_SALT",
  "CRON_SECRET",
  "PRODUCT_MEDIA_STORAGE_BUCKET",
  "PAYMENT_PROOF_STORAGE_BUCKET",
  "PRIVATE_DOCUMENT_STORAGE_BUCKET",
  "PAYMENT_QR_STORAGE_BUCKET",
  "NEXT_PUBLIC_BUSINESS_NAME",
  "NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER",
  "NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY",
  "DATABASE_URL",
  "DIRECT_URL",
] as const;

const ENVIRONMENTS = ["development", "preview", "production"] as const;

function addEnv(key: string, value: string, environment: string): boolean {
  const result = spawnSync(
    "npx",
    ["vercel", "env", "add", key, environment, "--force", "--sensitive"],
    {
      input: value,
      encoding: "utf8",
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  if (result.status !== 0) {
    // Fallback without --sensitive for older CLI behaviors
    const retry = spawnSync(
      "npx",
      ["vercel", "env", "add", key, environment, "--force"],
      {
        input: value,
        encoding: "utf8",
        shell: true,
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    if (retry.status !== 0) {
      console.log(
        "ENV_ADD_FAIL",
        key,
        environment,
        (retry.stderr || retry.stdout || "unknown").split("\n")[0],
      );
      return false;
    }
  }
  console.log("ENV_ADD_OK", key, environment);
  return true;
}

let ok = 0;
let fail = 0;
for (const key of KEYS) {
  const value = process.env[key];
  if (!value || !String(value).trim()) {
    console.log("ENV_SKIP_MISSING", key);
    continue;
  }
  for (const environment of ENVIRONMENTS) {
    if (addEnv(key, value, environment)) ok += 1;
    else fail += 1;
  }
}

console.log("ENV_PUSH_SUMMARY", `ok=${ok}`, `fail=${fail}`);
if (fail > 0) process.exit(1);
