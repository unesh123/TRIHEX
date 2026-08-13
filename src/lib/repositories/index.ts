import {
  assertPersistenceAllowed,
  resolvePersistenceMode,
  type PersistenceMode,
} from "@/lib/config/persistence-guard";
import { createDemoRepositories } from "./demo";
import { createPostgresRepositories } from "./postgres";
import type { Repositories } from "./types";

let cached: Repositories | null = null;

/**
 * Returns the active repository set for this process.
 * Production always uses PostgreSQL (fails if DATABASE_URL missing).
 * Demo/test adapters are explicit only.
 */
export function getRepositories(forceMode?: PersistenceMode): Repositories {
  const mode = forceMode ?? assertPersistenceAllowed("getRepositories");

  if (cached && cached.mode === mode && !forceMode) {
    return cached;
  }

  if (mode === "postgres") {
    cached = createPostgresRepositories();
    return cached;
  }

  cached = createDemoRepositories(mode === "test" ? "test" : "demo");
  return cached;
}

/** Reset singleton — tests only. */
export function resetRepositoriesCache(): void {
  cached = null;
}

export function getPersistenceMode(): PersistenceMode {
  return resolvePersistenceMode();
}

export type { Repositories } from "./types";
