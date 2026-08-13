/**
 * Next.js instrumentation — fail closed on unsafe production boot.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { normalizeEnvAliases } = await import("@/lib/env/normalize-aliases");
    normalizeEnvAliases();

    const { assertProductionSafe } = await import(
      "@/lib/config/persistence-guard"
    );
    try {
      assertProductionSafe();
    } catch (e) {
      // Only hard-fail when actually running as production Node server
      // or on Vercel Preview/Production (VERCEL_ENV).
      const vercelDeployed =
        process.env.VERCEL_ENV === "preview" ||
        process.env.VERCEL_ENV === "production";
      if (process.env.NODE_ENV === "production" || vercelDeployed) {
        console.error("[trihex] Unsafe production configuration:", e);
        throw e;
      }
    }
  }
}
