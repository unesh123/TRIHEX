import type { AdminRole, AppRole } from "@/lib/auth/permissions";
import { isAdminRole } from "@/lib/auth/permissions";
import {
  assertProductionSafe,
  isAdminDevBypassEnabled,
  isProductionRuntime,
  ConfigurationError,
} from "@/lib/config/persistence-guard";

export interface AdminSession {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  role: AppRole;
  bypass: boolean;
}

export type AdminGateResult =
  | { ok: true; session: AdminSession }
  | { ok: false; reason: "unauthorized" | "forbidden"; session: AdminSession };

/**
 * Admin session check.
 *
 * ADMIN_DEV_BYPASS:
 * - Allowed only when NODE_ENV !== production AND ADMIN_DEV_BYPASS=true
 * - Forbidden in production (throws ConfigurationError)
 *
 * Production path: Supabase Auth session cookie → profiles.role
 */
export async function checkAdminSession(
  requestHeaders?: Headers,
): Promise<AdminGateResult> {
  if (isProductionRuntime()) {
    try {
      assertProductionSafe();
    } catch (e) {
      if (e instanceof ConfigurationError) throw e;
      throw e;
    }
  }

  if (isAdminDevBypassEnabled()) {
    if (isProductionRuntime()) {
      throw new ConfigurationError(
        "ADMIN_DEV_BYPASS=true is forbidden when NODE_ENV=production.",
      );
    }

    const session: AdminSession = {
      authenticated: true,
      userId: "dev-bypass-admin",
      email: process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@trihex.local",
      role: "SUPER_ADMIN",
      bypass: true,
    };
    return { ok: true, session };
  }

  // Supabase session path when configured
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const { createSupabaseServerClient } = await import(
        "@/lib/auth/supabase-server"
      );
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const role = await resolveProfileRole(data.user.id, data.user.email);
        if (!isAdminRole(role)) {
          return {
            ok: false,
            reason: "forbidden",
            session: {
              authenticated: true,
              userId: data.user.id,
              email: data.user.email ?? null,
              role,
              bypass: false,
            },
          };
        }
        return {
          ok: true,
          session: {
            authenticated: true,
            userId: data.user.id,
            email: data.user.email ?? null,
            role: role as AdminRole,
            bypass: false,
          },
        };
      }
    } catch {
      // Fall through to stub cookie if supabase client fails in demo
    }
  }

  const cookieHeader = requestHeaders?.get("cookie") ?? "";
  const hasStubSession = /(?:^|;\s*)trihex_admin_session=/.test(cookieHeader);

  if (!hasStubSession) {
    return {
      ok: false,
      reason: "unauthorized",
      session: {
        authenticated: false,
        userId: null,
        email: null,
        role: "GUEST",
        bypass: false,
      },
    };
  }

  // Development stub cookie — not valid when production guards run
  if (isProductionRuntime()) {
    return {
      ok: false,
      reason: "unauthorized",
      session: {
        authenticated: false,
        userId: null,
        email: null,
        role: "GUEST",
        bypass: false,
      },
    };
  }

  return {
    ok: true,
    session: {
      authenticated: true,
      userId: "stub-admin",
      email: process.env.ADMIN_BOOTSTRAP_EMAIL ?? null,
      role: "ADMIN",
      bypass: false,
    },
  };
}

async function resolveProfileRole(
  authUserId: string,
  email: string | undefined,
): Promise<AppRole> {
  if (!process.env.DATABASE_URL) return "CUSTOMER";
  try {
    const { requireDb } = await import("@/db");
    const { profiles } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const db = requireDb();
    const rows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.authUserId, authUserId))
      .limit(1);
    if (rows[0]?.role) return rows[0].role as AppRole;

    // Bootstrap: first matching ADMIN_BOOTSTRAP_EMAIL becomes SUPER_ADMIN once
    if (
      email &&
      process.env.ADMIN_BOOTSTRAP_EMAIL &&
      email.toLowerCase() === process.env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase()
    ) {
      await db.insert(profiles).values({
        authUserId,
        email,
        role: "SUPER_ADMIN",
        fullName: process.env.ADMIN_BOOTSTRAP_NAME ?? "Bootstrap Admin",
      });
      return "SUPER_ADMIN";
    }
  } catch {
    return "CUSTOMER";
  }
  return "CUSTOMER";
}

export { isAdminDevBypassEnabled };
