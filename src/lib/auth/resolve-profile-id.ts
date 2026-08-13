/**
 * Resolve admin auth user id → profiles.id for FK columns (e.g. reviewer_id).
 * Session userId is usually Supabase auth.users id (= profiles.auth_user_id).
 */
import { eq, or } from "drizzle-orm";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { isUuid } from "@/lib/storage/proof-url";

export async function resolveProfileIdForActor(
  actorId: string | null | undefined,
): Promise<string | null> {
  if (!actorId || !isUuid(actorId)) return null;

  try {
    const db = requireDb();
    const rows = await db
      .select({ id: schema.profiles.id })
      .from(schema.profiles)
      .where(
        or(
          eq(schema.profiles.id, actorId),
          eq(schema.profiles.authUserId, actorId),
        ),
      )
      .limit(1);
    return rows[0]?.id ?? null;
  } catch (err) {
    console.error("[profile] resolveProfileIdForActor failed", err);
    return null;
  }
}
