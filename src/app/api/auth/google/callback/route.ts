import { NextResponse } from "next/server";
import {
  USER_SESSION_COOKIE,
  encodeUserSession,
} from "@/lib/auth/user-session";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionCookieValue,
} from "@/lib/admin/session-cookie";
import { isOwnerEmail } from "@/lib/auth/owner";
import { isSecureCookie } from "@/lib/auth/cookie-config";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawState = requestUrl.searchParams.get("state");
  const origin = requestUrl.origin;

  let next = "/vip";
  try {
    if (rawState) {
      const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8"));
      if (parsed.next) next = parsed.next;
    }
  } catch {
    // ignore
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${next}?auth=failed_no_code`, origin));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${origin}/api/auth/google/callback`;

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

    const userPayload = {
      id: profile.id ? `goog-${profile.id}` : `usr-${email.split("@")[0]}`,
      email,
      fullName,
      avatarUrl,
      provider: "google" as const,
      verified: true,
      role: isOwner ? "SUPER_ADMIN" : "CUSTOMER",
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
          await db.insert(schema.profiles).values({
            authUserId: userPayload.id,
            email,
            fullName,
            role: isOwner ? "SUPER_ADMIN" : "CUSTOMER",
            accountStatus: "ACTIVE",
          });
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
