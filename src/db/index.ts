/**
 * Database client — lazy init after Marketplace env alias normalization.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { normalizeEnvAliases } from "@/lib/env/normalize-aliases";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null | undefined;

function createDb(): Db | null {
  try {
    normalizeEnvAliases();
    let connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString || connectionString.includes("[SENSITIVE]")) return null;
    if (
      (connectionString.startsWith('"') && connectionString.endsWith('"')) ||
      (connectionString.startsWith("'") && connectionString.endsWith("'"))
    ) {
      connectionString = connectionString.slice(1, -1).trim();
    }
    try {
      const parsed = new URL(connectionString);
      if (!parsed.protocol.startsWith("postgres")) return null;
    } catch {
      return null;
    }
    const client = postgres(connectionString, {
      prepare: false,
      max: 10,
    });
    return drizzle(client, { schema });
  } catch (err) {
    console.warn("[db] Failed to initialize database client, falling back to seed:", err);
    return null;
  }
}

/** Returns Drizzle instance or null when no DATABASE_URL. */
export function getDb(): Db | null {
  if (cached === undefined) cached = createDb();
  return cached ?? null;
}

export function requireDb(): Db {
  const instance = getDb();
  if (!instance) {
    throw new Error(
      "DATABASE_URL is not configured. Set it in .env.local before running database operations.",
    );
  }
  return instance;
}

/** Tests only — clear lazy singleton. */
export function resetDbCache(): void {
  cached = undefined;
}

export { schema };
