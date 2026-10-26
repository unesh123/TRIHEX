import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { createHmac, timingSafeEqual } from "crypto";

export const USER_SESSION_COOKIE = "trihex_user_session";

function getCustomerSecretKey(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.ENCRYPTION_KEY ||
    "trihex-customer-session-secret-2026"
  );
}

export interface StorefrontUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  provider: "google" | "supabase" | "password";
  verified: boolean;
  role?: string;
  phone?: string | null;
  customerCode?: string;
}

/**
 * Encodes storefront user into an HMAC-SHA256 signed base64url cookie payload.
 */
export function encodeUserSession(user: StorefrontUser): string {
  const payload = JSON.stringify({
    ...user,
    ts: Date.now(),
  });
  const data = Buffer.from(payload, "utf8").toString("base64url");
  const hmac = createHmac("sha256", getCustomerSecretKey())
    .update(data)
    .digest("base64url");
  return `v2.${hmac}.${data}`;
}

/**
 * Decodes and cryptographically verifies HMAC-SHA256 signed user session.
 */
export function decodeUserSession(token: string): StorefrontUser | null {
  if (!token) return null;
  try {
    let raw: string;
    if (token.startsWith("v2.")) {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const [, hmac, data] = parts;
      const expectedHmac = createHmac("sha256", getCustomerSecretKey())
        .update(data)
        .digest("base64url");

      const hmacBuf = Buffer.from(hmac);
      const expectedBuf = Buffer.from(expectedHmac);
      if (
        hmacBuf.length !== expectedBuf.length ||
        !timingSafeEqual(hmacBuf, expectedBuf)
      ) {
        return null;
      }
      raw = Buffer.from(data, "base64url").toString("utf8");
    } else {
      // Legacy unsigned tokens rejected in production
      if (process.env.NODE_ENV === "production") {
        return null;
      }
      raw = Buffer.from(token, "base64url").toString("utf8");
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.email) return null;

    // Reject expired sessions (> 30 days)
    const MAX_SESSION_AGE_MS = 30 * 24 * 60 * 60 * 1000;
    if (parsed.ts && Date.now() - parsed.ts > MAX_SESSION_AGE_MS) {
      return null;
    }

    return {
      id: parsed.id || `usr-${parsed.email.split("@")[0]}`,
      email: parsed.email.toLowerCase().trim(),
      fullName: parsed.fullName || parsed.email.split("@")[0],
      avatarUrl: parsed.avatarUrl || null,
      provider: parsed.provider || "google",
      verified: Boolean(parsed.verified ?? true),
      role: parsed.role || "CUSTOMER",
      phone: parsed.phone || null,
      customerCode: parsed.customerCode || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Server-side helper to get current authenticated customer.
 * Checks trihex_user_session cookie first, then falls back to Supabase auth.
 * Enriches user with their customerCode & phone from the VIP member store.
 */
export async function getCurrentStorefrontUser(): Promise<StorefrontUser | null> {
  let user: StorefrontUser | null = null;

  // 1. Check custom user session cookie
  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get(USER_SESSION_COOKIE)?.value;
    if (rawCookie) {
      user = decodeUserSession(rawCookie);
    }
  } catch {
    // Non-fatal if called where cookies() is unavailable
  }

  // 2. Check Supabase Auth if no custom session
  if (!user) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (data.user && data.user.email) {
        const email = data.user.email.toLowerCase().trim();
        const fullName =
          (data.user.user_metadata?.full_name as string) ||
          (data.user.user_metadata?.name as string) ||
          email.split("@")[0];
        const avatarUrl =
          (data.user.user_metadata?.avatar_url as string) ||
          (data.user.user_metadata?.picture as string) ||
          null;

        user = {
          id: data.user.id,
          email,
          fullName,
          avatarUrl,
          provider: "google",
          verified: true,
          role: "CUSTOMER",
          phone: data.user.phone || null,
        };
      }
    } catch {
      // Supabase unavailable or guest
    }
  }

  if (!user) return null;

  // If customerCode is already present in session, fast return
  if (user.customerCode) {
    return user;
  }

  // 3. Enrich with VIP member data (User ID / verificationToken and phone)
  try {
    const { getVipMemberRecordByEmail, registerCustomerLogin } = await import(
      "@/lib/vip/vip-member-store"
    );
    let member = await getVipMemberRecordByEmail(user.email);
    if (!member) {
      member = await registerCustomerLogin({
        email: user.email,
        name: user.fullName,
        avatarUrl: user.avatarUrl,
      });
    }
    if (member) {
      user.customerCode = member.verificationToken;
      if (!user.phone && member.phone) {
        user.phone = member.phone;
      }
    }
  } catch {
    // Non-fatal if VIP store sync encounters error
  }

  if (!user.customerCode) {
    user.customerCode = `THX-USR-${user.email ? user.email.slice(0, 4).toUpperCase() : "9702"}`;
  }

  return user;
}
