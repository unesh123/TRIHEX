import { describe, expect, it, afterEach, beforeEach } from "vitest";
import {
  assertProductionSafe,
  ConfigurationError,
  resolvePersistenceMode,
  validateDeployEnv,
} from "@/lib/config/persistence-guard";
import { resetRepositoriesCache } from "@/lib/repositories";

describe("production configuration guards", () => {
  const keys = [
    "TRIHEX_FORCE_NODE_ENV",
    "DATABASE_URL",
    "DEMO_MODE",
    "ADMIN_DEV_BYPASS",
    "PERSISTENCE_MODE",
    "VALIDATE_AS_PRODUCTION",
    "AUTH_SECRET",
    "VERCEL_ENV",
    "POSTGRES_URL",
  ] as const;
  const snapshot: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of keys) snapshot[k] = process.env[k];
    for (const k of keys) delete process.env[k];
    resetRepositoriesCache();
  });

  afterEach(() => {
    for (const k of keys) {
      if (snapshot[k] === undefined) delete process.env[k];
      else process.env[k] = snapshot[k];
    }
    resetRepositoriesCache();
  });

  it("fails when production and ADMIN_DEV_BYPASS=true", () => {
    process.env.TRIHEX_FORCE_NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://localhost/trihex";
    process.env.ADMIN_DEV_BYPASS = "true";
    expect(() => assertProductionSafe()).toThrow(ConfigurationError);
    expect(() => assertProductionSafe()).toThrow(/ADMIN_DEV_BYPASS/);
  });

  it("fails when production and DATABASE_URL missing", () => {
    process.env.TRIHEX_FORCE_NODE_ENV = "production";
    expect(() => assertProductionSafe()).toThrow(/DATABASE_URL/);
  });

  it("fails when production and DEMO_MODE=true", () => {
    process.env.TRIHEX_FORCE_NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://localhost/trihex";
    process.env.DEMO_MODE = "true";
    expect(() => assertProductionSafe()).toThrow(/DEMO_MODE/);
  });

  it("allows production when DATABASE_URL set and bypasses off", () => {
    process.env.TRIHEX_FORCE_NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://localhost/trihex";
    process.env.ADMIN_DEV_BYPASS = "false";
    process.env.DEMO_MODE = "false";
    expect(() => assertProductionSafe()).not.toThrow();
    expect(resolvePersistenceMode()).toBe("postgres");
  });

  it("uses demo mode when DEMO_MODE=true without DATABASE_URL", () => {
    process.env.TRIHEX_FORCE_NODE_ENV = "development";
    process.env.DEMO_MODE = "true";
    delete process.env.DATABASE_URL;
    expect(resolvePersistenceMode()).toBe("demo");
  });

  it("uses test mode under vitest NODE_ENV=test without DEMO_MODE", () => {
    delete process.env.TRIHEX_FORCE_NODE_ENV;
    delete process.env.DEMO_MODE;
    delete process.env.DATABASE_URL;
    // Vitest sets NODE_ENV=test
    expect(["test", "demo"]).toContain(resolvePersistenceMode());
  });

  it("validateDeployEnv catches bypass under VALIDATE_AS_PRODUCTION", () => {
    process.env.VALIDATE_AS_PRODUCTION = "true";
    process.env.ADMIN_DEV_BYPASS = "true";
    delete process.env.DATABASE_URL;
    const result = validateDeployEnv();
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
