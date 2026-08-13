/**
 * Fail deploy/CI when VALIDATE_AS_PRODUCTION=true and config is unsafe.
 * Usage: VALIDATE_AS_PRODUCTION=true npx tsx scripts/validate-production-env.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";
normalizeEnvAliases();

import { validateDeployEnv } from "../src/lib/config/persistence-guard";

const result = validateDeployEnv();
if (!result.ok) {
  console.error("Production environment validation FAILED:");
  for (const e of result.errors) console.error(" -", e);
  process.exit(1);
}
console.log("Production environment validation OK");
