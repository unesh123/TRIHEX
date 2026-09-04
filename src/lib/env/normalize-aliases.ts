/**
 * Map Vercel Marketplace Supabase / Postgres variable names onto TRIHEX names.
 * Never overwrites an explicitly set TRIHEX variable. Never logs values.
 */
export function normalizeEnvAliases(env: NodeJS.ProcessEnv = process.env): void {
  const setIfMissing = (target: string, ...sources: string[]) => {
    const current = env[target];
    if (current != null && String(current).trim() !== "") return;
    for (const source of sources) {
      const value = env[source];
      if (value != null && String(value).trim() !== "") {
        env[target] = value;
        return;
      }
    }
  };

  // Database (Vercel Marketplace Supabase)
  setIfMissing("DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL");
  setIfMissing("DIRECT_URL", "POSTGRES_URL_NON_POOLING", "POSTGRES_URL");

  // Supabase Auth / API
  setIfMissing("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  setIfMissing(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  );
  setIfMissing("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");

  // Providers & Intelligence Aliases
  setIfMissing("YOUCOM_API_KEY", "YDC_API_KEY", "YOUCOM_SEARCH_API_KEY");
  setIfMissing("ANALYTICS_HASH_SECRET", "IP_HASH_SALT");
  setIfMissing("GOOGLE_MAPS_SERVER_KEY", "GOOGLE_MAPS_API_KEY");
  setIfMissing("NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  setIfMissing("GEMINI_API_KEY", "GOOGLE_AI_API_KEY");
}

/** Metadata-only status for diagnostics (never returns the value). */
export type EnvPresence = "PRESENT" | "MISSING" | "MALFORMED";

export function envPresence(name: string, env: NodeJS.ProcessEnv = process.env): EnvPresence {
  const value = env[name];
  if (value == null || String(value).trim() === "") return "MISSING";
  if (/your_|CHANGE_ME|placeholder|xxx|TODO/i.test(String(value))) return "MALFORMED";
  return "PRESENT";
}
