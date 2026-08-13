import { requireDb, type Db } from "@/db";
import { isDatabaseConfigured } from "@/lib/env";

export type DbReady =
  | { ok: true; db: Db }
  | { ok: false; message: string };

export function getAdminDbOrMessage(): DbReady {
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      message:
        "DATABASE_URL is not configured on this environment. Admin data cannot load.",
    };
  }
  try {
    return { ok: true, db: requireDb() };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof Error
          ? e.message
          : "Database client failed to initialize.",
    };
  }
}
