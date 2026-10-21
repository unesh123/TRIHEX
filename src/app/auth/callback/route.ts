import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { isOwnerEmail } from "@/lib/auth/owner";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionCookieValue,
} from "@/lib/admin/session-cookie";
import {
  USER_SESSION_COOKIE,
  encodeUserSession,
} from "@/lib/auth/user-session";
import { appendAuditEvent } from "@/lib/audit/log";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/account";
  const isAdminTarget = next.startsWith("/admin");

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.user) {
        const user = data.user;
        const email = user.email?.toLowerCase().trim() || "";
        const fullName =
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          user.email?.split("@")[0] ||
          "Google User";

        const isOwner = isOwnerEmail(email);

        // If user is attempting to access the Admin workspace via Google OAuth
        if (isAdminTarget) {
          if (!isOwner) {
            // High security rejection: User signed in with an unauthorized Google account
            await appendAuditEvent({
              action: "ADMIN_LOGIN",
              actorId: user.id,
              entityType: "unauthorized_google_account",
              metadata: {
                outcome: "rejected",
                attemptedEmail: email,
                ip: request.headers.get("x-forwarded-for") || "unknown",
                userAgent: request.headers.get("user-agent") || "unknown",
                reason: "Google account is not whitelisted for TRIHEX root admin access.",
              },
            });

            // Sign out of this unauthorized session
            await supabase.auth.signOut();

            const rejectUrl = new URL("/admin/unauthorized", requestUrl.origin);
            rejectUrl.searchParams.set("email", email);
            return NextResponse.redirect(rejectUrl);
          }
        }

        // Sync or upsert into database profiles table
        try {
          const db = getDb();
          if (db) {
            const existing = await db
              .select({ id: schema.profiles.id, role: schema.profiles.role })
              .from(schema.profiles)
              .where(eq(schema.profiles.authUserId, user.id))
              .limit(1);

            if (existing.length === 0) {
              await db.insert(schema.profiles).values({
                authUserId: user.id,
                email,
                fullName,
                phone: user.phone || null,
                role: isOwner ? "SUPER_ADMIN" : "CUSTOMER",
                accountStatus: "ACTIVE",
              });
            } else if (isOwner && existing[0].role !== "SUPER_ADMIN") {
              await db
                .update(schema.profiles)
                .set({ role: "SUPER_ADMIN", updatedAt: new Date() })
                .where(eq(schema.profiles.id, existing[0].id));
            }
          }
        } catch (dbErr) {
          console.warn("[AuthCallback] DB profile sync note:", dbErr);
        }

        const response = NextResponse.redirect(new URL(next, requestUrl.origin));

        const userPayload = {
          id: user.id ? `goog-${user.id}` : `usr-${email.split("@")[0]}`,
          email,
          fullName,
          avatarUrl:
            (user.user_metadata?.avatar_url as string) ||
            (user.user_metadata?.picture as string) ||
            null,
          provider: "google" as const,
          verified: true,
          role: isOwner ? "SUPER_ADMIN" : "CUSTOMER",
        };

        // Set Customer User Session
        response.cookies.set(USER_SESSION_COOKIE, encodeUserSession(userPayload), {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        // Sync with VIP member store
        try {
          const { registerCustomerLogin } = await import("@/lib/vip/vip-member-store");
          await registerCustomerLogin({
            email,
            name: fullName,
            avatarUrl: userPayload.avatarUrl,
          });
        } catch (vipErr) {
          console.warn("[AuthCallback] VIP store sync note:", vipErr);
        }

        // If the authenticated user is authorized admin, issue cryptographically signed session cookie
        if (isOwner) {
          const signedSession = buildAdminSessionCookieValue(email);
          response.cookies.set(ADMIN_SESSION_COOKIE, signedSession, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });

          response.cookies.set("trihex_vault_clearance", "cleared_zone_9702", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 12, // 12 hours
          });

          await appendAuditEvent({
            action: "ADMIN_LOGIN",
            actorId: user.id,
            entityType: "google_oauth_admin",
            metadata: {
              outcome: "success",
              email,
              provider: "google",
              ip: request.headers.get("x-forwarded-for") || "unknown",
            },
          });
        }

        return response;
      }
    } catch (err) {
      console.error("[AuthCallback] Exchange code failed:", err);
    }
  }

  // Fallback if failed
  return NextResponse.redirect(new URL("/?auth=failed", requestUrl.origin));
}
