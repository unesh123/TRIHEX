import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { normalizeEnvAliases } from "./src/lib/env/normalize-aliases";

config({ path: ".env.local" });
config({ path: ".env" });
normalizeEnvAliases();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/trihex_digital",
  },
  strict: true,
  verbose: true,
});
