import { NextResponse } from "next/server";
import { getCurrentStorefrontUser, USER_SESSION_COOKIE, encodeUserSession } from "@/lib/auth/user-session";
import { getVipMemberRecordByEmail, registerOrUpdateCustomerVip } from "@/lib/vip/vip-member-store";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentStorefrontUser();
    if (!user || !user.email) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const phone = String(body.phone || "").trim();

    if (!phone || phone.replace(/\D/g, "").length < 7) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid mobile / WhatsApp number." },
        { status: 400 },
      );
    }

    // Update in VIP Member Store
    const member = await registerOrUpdateCustomerVip({
      email: user.email,
      phone,
      name: user.fullName,
    });

    // Update in DB profiles if available
    try {
      const db = getDb();
      if (db) {
        await db
          .update(schema.profiles)
          .set({ phone, updatedAt: new Date() })
          .where(eq(schema.profiles.email, user.email));
      }
    } catch {
      // non-fatal
    }

    // Refresh user session cookie with updated phone
    const updatedUser = {
      ...user,
      phone,
      customerCode: member.verificationToken,
    };

    const response = NextResponse.json({
      success: true,
      phone,
      customerCode: member.verificationToken,
    });

    response.cookies.set(USER_SESSION_COOKIE, encodeUserSession(updatedUser), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    console.error("[UpdatePhone] Error:", err);
    return NextResponse.json({ success: false, error: "Internal error updating phone." }, { status: 500 });
  }
}
