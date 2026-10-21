import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export const USER_SESSION_COOKIE = "trihex_user_session";

export interface StorefrontUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  provider: "google" | "supabase" | "password";
  verified: boolean;
  role?: string;
}

/**
 * Encodes storefront user into a base64url JSON cookie payload.
 */
export function encodeUserSession(user: StorefrontUser): string {
  const payload = JSON.stringify({
    ...user,
    ts: Date.now(),
  });
  return Buffer.from(payload, "utf8").toString("base64url");
}

/**
 * Decodes base64url JSON cookie payload.
 */
export function decodeUserSession(token: string): StorefrontUser | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.email) return null;

    // Security incident response: invalidate all pre-cutoff sessions
    const SESSION_REVOCATION_CUTOFF_MS = 1792605928398;
    if (!parsed.ts || parsed.ts < SESSION_REVOCATION_CUTOFF_MS) {
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
    };
  } catch {
    return null;
  }
}

/**
 * Server-side helper to get current authenticated customer.
 * Checks trihex_user_session cookie first, then falls back to Supabase auth.
 */
export async function getCurrentStorefrontUser(): Promise<StorefrontUser | null> {
  // 1. Check custom user session cookie
  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get(USER_SESSION_COOKIE)?.value;
    if (rawCookie) {
      const decoded = decodeUserSession(rawCookie);
      if (decoded) return decoded;
    }
  } catch {
    // Non-fatal if called where cookies() is unavailable
  }

  // 2. Check Supabase Auth
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

      return {
        id: data.user.id,
        email,
        fullName,
        avatarUrl,
        provider: "google",
        verified: true,
        role: "CUSTOMER",
      };
    }
  } catch {
    // Supabase unavailable or guest
  }

  return null;
}
