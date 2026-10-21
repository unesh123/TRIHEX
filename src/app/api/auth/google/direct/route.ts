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
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = String(body.email || "").trim().toLowerCase();
    const rawName = String(body.name || "").trim();
    const avatarUrl = body.avatarUrl ? String(body.avatarUrl) : null;
    const next = body.next || "/vip";

    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required for Google Sign-In." },
        { status: 400 },
      );
    }

    const email = rawEmail;
    const fullName = rawName || email.split("@")[0];
    const isOwner = isOwnerEmail(email);

    const userPayload = {
      id: `goog-${email.split("@")[0]}-${Date.now().toString(36)}`,
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

    // Ensure member is registered in VIP store so Admin can view and manage their VIP status
    try {
      const { registerCustomerLogin } = await import("@/lib/vip/vip-member-store");
      await registerCustomerLogin({
        email,
        name: fullName,
        avatarUrl,
      });
    } catch (storeErr) {
      console.warn("[DirectGoogleAuth] Member store sync note:", storeErr);
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

    // If owner, also grant admin session
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
    console.error("[DirectGoogleAuth] Error:", err);
    return NextResponse.json(
      { success: false, error: "Authentication failed." },
      { status: 500 },
    );
  }
}
