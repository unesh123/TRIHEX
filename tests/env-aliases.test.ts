import { describe, expect, it, afterEach } from "vitest";
import { normalizeEnvAliases } from "@/lib/env/normalize-aliases";

describe("normalizeEnvAliases", () => {
  const keys = [
    "DATABASE_URL",
    "DIRECT_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
  ] as const;

  afterEach(() => {
    for (const key of keys) delete process.env[key];
  });

  it("maps Marketplace Postgres + Supabase names onto TRIHEX names", () => {
    for (const key of keys) delete process.env[key];
    process.env.POSTGRES_URL = "postgres://mapped-db";
    process.env.POSTGRES_URL_NON_POOLING = "postgres://mapped-direct";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    process.env.SUPABASE_SECRET_KEY = "secret-key";

    normalizeEnvAliases();

    expect(process.env.DATABASE_URL).toBe("postgres://mapped-db");
    expect(process.env.DIRECT_URL).toBe("postgres://mapped-direct");
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("publishable-key");
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBe("secret-key");
  });

  it("does not overwrite explicitly set TRIHEX variables", () => {
    process.env.DATABASE_URL = "postgres://explicit";
    process.env.POSTGRES_URL = "postgres://marketplace";
    normalizeEnvAliases();
    expect(process.env.DATABASE_URL).toBe("postgres://explicit");
  });
});
