import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { USER_SESSION_COOKIE } from "@/lib/auth/user-session";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session-cookie";

async function handleSignOut(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // non-fatal
  }

  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/account";
  const origin = url.origin;
  const target = next.startsWith("/") ? new URL(next, origin) : new URL("/account", origin);

  const response = NextResponse.redirect(target, 303);

  // Clear all user and admin cookies across the entire site
  response.cookies.delete(USER_SESSION_COOKIE);
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  response.cookies.delete("trihex_vault_clearance");

  // Also set expired cookie headers explicitly
  response.cookies.set(USER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set("trihex_vault_clearance", "", { path: "/", maxAge: 0 });

  return response;
}

export async function POST(request: Request) {
  return handleSignOut(request);
}

export async function GET(request: Request) {
  return handleSignOut(request);
}
