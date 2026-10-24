import { NextResponse } from "next/server";
import {
  USER_SESSION_COOKIE,
  encodeUserSession,
  type StorefrontUser,
} from "@/lib/auth/user-session";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionCookieValue,
} from "@/lib/admin/session-cookie";
import { isOwnerEmail } from "@/lib/auth/owner";
import { isSecureCookie } from "@/lib/auth/cookie-config";
import { registerCustomerLogin } from "@/lib/vip/vip-member-store";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawState = requestUrl.searchParams.get("state");
  const origin = requestUrl.origin;

  let next = "/vip";
  let stateRedirectUri: string | null = null;
  try {
    if (rawState) {
      const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8"));
      if (parsed.next) next = parsed.next;
      if (parsed.redirectUri) stateRedirectUri = parsed.redirectUri;
    }
  } catch {
    // ignore
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${next}?auth=failed_no_code`, origin));
  }

  try {
    const clientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "1055636675498-jo31l5n9fouujd1htgdmo390arl95h7t.apps.googleusercontent.com";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      stateRedirectUri ||
      process.env.GOOGLE_REDIRECT_URI?.trim() ||
      `${origin}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      throw new Error("Missing Google OAuth credentials in environment.");
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[GoogleCallback] Token exchange error:", tokenData);
      return NextResponse.redirect(new URL(`${next}?auth=token_exchange_failed`, origin));
    }

    // Fetch user profile info from Google
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userinfoRes.json();
    if (!profile.email) {
      return NextResponse.redirect(new URL(`${next}?auth=no_email_returned`, origin));
    }

    const email = profile.email.toLowerCase().trim();
    const fullName = profile.name || profile.given_name || email.split("@")[0];
    const avatarUrl = profile.picture || null;
    const isOwner = isOwnerEmail(email);

    const member = await registerCustomerLogin({
      email,
      name: fullName,
      avatarUrl,
    });

    const userPayload: StorefrontUser = {
      id: member.id || (profile.id ? `goog-${profile.id}` : `usr-${email.split("@")[0]}`),
      email,
      fullName: member.name || fullName,
      avatarUrl: member.avatarUrl || avatarUrl,
      provider: "google",
      verified: true,
      role: isOwner ? "SUPER_ADMIN" : "CUSTOMER",
      phone: member.phone || null,
      customerCode: member.verificationToken,
    };

    // Upsert into DB profiles if available
    try {
      const db = getDb();
      if (db) {
        const existing = await db
          .select({ id: schema.profiles.id, role: schema.profiles.role })
          .from(schema.profiles)
          .where(eq(schema.profiles.email, email))
          .limit(1);

        if (existing.length === 0) {
          const authUserId = randomUUID();
          await db.insert(schema.profiles).values({
            authUserId,
            email,
            fullName,
            role: isOwner ? "SUPER_ADMIN" : "CUSTOMER",
            accountStatus: "ACTIVE",
          });
        } else if (isOwner && existing[0].role !== "SUPER_ADMIN") {
          await db
            .update(schema.profiles)
            .set({ role: "SUPER_ADMIN", updatedAt: new Date() })
            .where(eq(schema.profiles.email, email));
        }
      }
    } catch {
      // non-fatal
    }

    const response = NextResponse.redirect(new URL(next, origin));

    // Set Customer User Session
    response.cookies.set(USER_SESSION_COOKIE, encodeUserSession(userPayload), {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // If owner, also grant admin session
    if (isOwner) {
      const signedSession = buildAdminSessionCookieValue(email);
      response.cookies.set(ADMIN_SESSION_COOKIE, signedSession, {
        httpOnly: true,
        sameSite: "lax",
        secure: isSecureCookie(),
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set("trihex_vault_clearance", "cleared_zone_9702", {
        httpOnly: true,
        sameSite: "lax",
        secure: isSecureCookie(),
        path: "/",
        maxAge: 60 * 60 * 12,
      });
    }

    return response;
  } catch (err) {
    console.error("[GoogleCallback] Unexpected error:", err);
    return NextResponse.redirect(new URL(`${next}?auth=google_oauth_exception`, origin));
  }
}
