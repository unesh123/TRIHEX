/**
 * Production persistence / configuration guards.
 * Fail closed — never silently use demo commerce in production.
 */

import { normalizeEnvAliases } from "@/lib/env/normalize-aliases";

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export type PersistenceMode = "postgres" | "demo" | "test";

export function isDemoModeExplicit(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function isAdminDevBypassEnabled(): boolean {
  return process.env.ADMIN_DEV_BYPASS === "true";
}

export function isProductionRuntime(): boolean {
  const forced = process.env.TRIHEX_FORCE_NODE_ENV;
  if ((forced ?? process.env.NODE_ENV) === "production") return true;
  // Vercel Preview/Production must never use demo commerce or admin bypass.
  const vercelEnv = process.env.VERCEL_ENV;
  return vercelEnv === "preview" || vercelEnv === "production";
}

/**
 * Resolve persistence mode.
 * - production → postgres only (DATABASE_URL required)
 * - DEMO_MODE=true → demo (forbidden in production)
 * - DATABASE_URL set → postgres
 * - otherwise → demo in development/test only
 */
export function resolvePersistenceMode(): PersistenceMode {
  if (isProductionRuntime()) {
    assertProductionSafe();
    return "postgres";
  }

  if (process.env.PERSISTENCE_MODE === "test") return "test";
  if (isDemoModeExplicit()) return "demo";
  if (process.env.DATABASE_URL) return "postgres";
  if (process.env.NODE_ENV === "test") return "test";
  return "demo";
}

/**
 * Throws if production configuration is unsafe.
 * Call at startup, from API route helpers, and from deployment validation.
 */
export function assertProductionSafe(): void {
  if (!isProductionRuntime()) return;

  normalizeEnvAliases();

  const problems: string[] = [];

  if (!process.env.DATABASE_URL) {
    problems.push("DATABASE_URL is required in production (no in-memory commerce).");
  }
  if (isDemoModeExplicit()) {
    problems.push("DEMO_MODE=true is forbidden in production.");
  }
  if (isAdminDevBypassEnabled()) {
    problems.push("ADMIN_DEV_BYPASS=true is forbidden in production.");
  }
  if (process.env.PERSISTENCE_MODE === "demo") {
    problems.push("PERSISTENCE_MODE=demo is forbidden in production.");
  }

  if (problems.length > 0) {
    throw new ConfigurationError(
      `Unsafe production configuration:\n- ${problems.join("\n- ")}`,
    );
  }
}

/**
 * Use before any commerce mutation. In production always requires postgres.
 * In development, demo is allowed only when explicitly DEMO_MODE or no DATABASE_URL.
 */
export function assertPersistenceAllowed(operation: string): PersistenceMode {
  const mode = resolvePersistenceMode();

  if (isProductionRuntime() && mode !== "postgres") {
    throw new ConfigurationError(
      `Refusing ${operation}: production requires PostgreSQL persistence.`,
    );
  }

  if (mode === "demo" && isProductionRuntime()) {
    throw new ConfigurationError(
      `Refusing ${operation}: demo persistence cannot run in production.`,
    );
  }

  return mode;
}

/** Validate env for deploy scripts without starting Next. */
export function validateDeployEnv(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (process.env.VALIDATE_AS_PRODUCTION === "true") {
    const prevForce = process.env.TRIHEX_FORCE_NODE_ENV;
    process.env.TRIHEX_FORCE_NODE_ENV = "production";
    try {
      assertProductionSafe();
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    } finally {
      if (prevForce === undefined) delete process.env.TRIHEX_FORCE_NODE_ENV;
      else process.env.TRIHEX_FORCE_NODE_ENV = prevForce;
    }

    if (!process.env.DATABASE_URL) errors.push("DATABASE_URL missing");
    if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
      errors.push("AUTH_SECRET missing or shorter than 32 characters");
    }
    if (isAdminDevBypassEnabled()) errors.push("ADMIN_DEV_BYPASS must be false");
    if (isDemoModeExplicit()) errors.push("DEMO_MODE must be false");
  }

  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}
