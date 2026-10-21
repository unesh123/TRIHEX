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
import { registerCustomerLogin } from "@/lib/vip/vip-member-store";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credential = String(body.credential || "").trim();
    const next = body.next || "/account";

    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Google credential token required." },
        { status: 400 },
      );
    }

    // Decode Google JWT payload
    const parts = credential.split(".");
    if (parts.length !== 3) {
      return NextResponse.json(
        { success: false, error: "Invalid Google token format." },
        { status: 400 },
      );
    }

    const payloadRaw = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(payloadRaw);

    const email = String(payload.email || "").trim().toLowerCase();
    const fullName = String(payload.name || payload.given_name || email.split("@")[0]).trim();
    const avatarUrl = payload.picture ? String(payload.picture) : null;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Verified Google email not found in token." },
        { status: 400 },
      );
    }

    const isOwner = isOwnerEmail(email);

    const userPayload = {
      id: `goog-${payload.sub || email.split("@")[0]}`,
      email,
      fullName,
      avatarUrl,
      provider: "google" as const,
      verified: Boolean(payload.email_verified ?? true),
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

    // Register into VIP store so admin can manage status
    try {
      await registerCustomerLogin({
        email,
        name: fullName,
        avatarUrl,
      });
    } catch (err) {
      console.warn("[GoogleCredentialAuth] VIP store sync note:", err);
    }

    const response = NextResponse.json({
      success: true,
      user: userPayload,
      redirect: next,
    });

    // Set Customer User Session
    response.cookies.set(USER_SESSION_COOKIE, encodeUserSession(userPayload), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // If owner, grant admin session
    if (isOwner) {
      const signedSession = buildAdminSessionCookieValue(email);
      response.cookies.set(ADMIN_SESSION_COOKIE, signedSession, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set("trihex_vault_clearance", "cleared_zone_9702", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
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
