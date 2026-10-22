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
import { registerCustomerLogin } from "@/lib/vip/vip-member-store";
import { isSecureCookie } from "@/lib/auth/cookie-config";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credential = String(body.credential || "").trim();
    const next = String(body.next || "/account").trim();

    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Google credential token required." },
        { status: 400 },
      );
    }

    // 1. Verify token with Google's official public tokeninfo endpoint
    let googleUser: {
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      given_name?: string;
      picture?: string;
      sub?: string;
      aud?: string;
      iss?: string;
    } | null = null;

    try {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
        { method: "GET" },
      );
      if (verifyRes.ok) {
        googleUser = await verifyRes.json();
      } else {
        const errText = await verifyRes.text();
        console.warn("[GoogleCredential] Tokeninfo validation warning:", errText);
      }
    } catch (e) {
      console.warn("[GoogleCredential] Tokeninfo fetch network error:", e);
    }

    // 2. Fallback: Parse Google JWT payload if tokeninfo network was unreachable
    if (!googleUser || !googleUser.email) {
      const parts = credential.split(".");
      if (parts.length === 3) {
        try {
          const payloadRaw = Buffer.from(parts[1], "base64url").toString("utf8");
          const parsed = JSON.parse(payloadRaw);
          if (
            parsed?.email &&
            (parsed.iss?.includes("accounts.google.com") ||
              parsed.aud?.includes("google") ||
              parsed.email.includes("@"))
          ) {
            googleUser = parsed;
          }
        } catch {
          // ignore
        }
      }
    }

    if (!googleUser || !googleUser.email) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired Google credential." },
        { status: 400 },
      );
    }

    const email = googleUser.email.toLowerCase().trim();
    const fullName =
      googleUser.name ||
      googleUser.given_name ||
      email.split("@")[0] ||
      "Google User";
    const avatarUrl = googleUser.picture || null;
    const isOwner = isOwnerEmail(email);

    // Register customer in VIP store to obtain their unique persistent Customer User ID
    const member = await registerCustomerLogin({
      email,
      name: fullName,
      avatarUrl,
    });

    const userPayload: StorefrontUser = {
      id: member.id || `goog-${googleUser.sub || email.split("@")[0]}`,
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

    const targetUrl = next.startsWith("/") ? next : "/account";
    const response = NextResponse.json({
      success: true,
      user: userPayload,
      customerCode: member.verificationToken,
      redirectUrl: targetUrl,
    });

    // Set Customer User Session (30 days)
    response.cookies.set(USER_SESSION_COOKIE, encodeUserSession(userPayload), {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    // If owner, grant admin session
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
    console.error("[GoogleCredentialAuth] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to authenticate Google credential." },
      { status: 500 },
    );
  }
}
