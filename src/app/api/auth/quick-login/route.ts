import { NextResponse } from "next/server";
import { USER_SESSION_COOKIE, encodeUserSession, type StorefrontUser } from "@/lib/auth/user-session";
import { isOwnerEmail } from "@/lib/auth/owner";
import { registerCustomerLogin } from "@/lib/vip/vip-member-store";
import { isSecureCookie } from "@/lib/auth/cookie-config";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.name || body.fullName || "").trim() || email.split("@")[0] || "Google Customer";
    const phone = String(body.phone || "").trim() || null;
    const avatarUrl = body.avatarUrl || null;
    const nextUrl = String(body.next || "/vip").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Google email address." },
        { status: 400 },
      );
    }

    const isOwner = isOwnerEmail(email);

    // Register customer in VIP store to obtain their unique persistent User ID
    const member = await registerCustomerLogin({
      email,
      name: fullName,
      avatarUrl,
    });

    const userPayload: StorefrontUser = {
      id: member.id || `usr-${nanoid(8)}`,
      email,
      fullName: member.name || fullName,
      avatarUrl: member.avatarUrl || avatarUrl,
      provider: "google",
      verified: true,
      role: isOwner ? "SUPER_ADMIN" : "CUSTOMER",
      phone: phone || member.phone || null,
      customerCode: member.verificationToken,
    };

    const targetUrl = nextUrl.startsWith("/") ? nextUrl : "/vip";
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

    return response;
  } catch (err) {
    console.error("[QuickLogin] Exception:", err);
    return NextResponse.json(
      { success: false, error: "Failed to sign in. Please try again." },
      { status: 500 },
    );
  }
}
