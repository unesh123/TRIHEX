/**
 * Push repaired env keys to Vercel (production/preview/development).
 * Never logs secret values.
 */
import { spawnSync } from "child_process";
import { config } from "dotenv";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

config({ path: ".env.local" });

const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_BUSINESS_NAME",
  "NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY",
  "NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER",
  "PRODUCT_MEDIA_STORAGE_BUCKET",
  "PAYMENT_PROOF_STORAGE_BUCKET",
  "PRIVATE_DOCUMENT_STORAGE_BUCKET",
  "PAYMENT_QR_STORAGE_BUCKET",
  "DEMO_MODE",
  "ADMIN_DEV_BYPASS",
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "CRON_SECRET",
  "ENCRYPTION_KEY",
  "IP_HASH_SALT",
] as const;

const ENVS = ["production", "preview", "development"] as const;

function setEnv(key: string, value: string, envName: string) {
  const tmp = join(tmpdir(), `trihex-env-${key}-${envName}.txt`);
  writeFileSync(tmp, value, "utf8");
  spawnSync("npx", ["vercel", "env", "rm", key, envName, "--yes"], {
    stdio: "ignore",
    shell: true,
  });
  const add = spawnSync(
    "npx",
    ["vercel", "env", "add", key, envName],
    {
      input: value,
      encoding: "utf8",
      shell: true,
    },
  );
  try {
    unlinkSync(tmp);
  } catch {
    /* ignore */
  }
  const out = `${add.stdout ?? ""}${add.stderr ?? ""}`;
  if (/Added|Saved|Updated/i.test(out)) {
    console.log("OK", envName, key);
  } else if (/already exists/i.test(out)) {
    console.log("EXISTS", envName, key);
  } else {
    console.log("CHECK", envName, key, out.slice(0, 120).replace(/\s+/g, " "));
  }
}

for (const envName of ENVS) {
  for (const key of KEYS) {
    const value = process.env[key];
    if (!value || value.includes("SENSITIVE")) {
      console.log("SKIP_MISSING", key);
      continue;
    }
    setEnv(key, value, envName);
  }
}

console.log("VERCEL_ENV_PUSH_DONE");
