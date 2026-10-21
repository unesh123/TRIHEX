import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { USER_SESSION_COOKIE } from "@/lib/auth/user-session";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session-cookie";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (err) {
    // non-fatal
  }

  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/account", origin), 303);

  response.cookies.delete(USER_SESSION_COOKIE);
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  response.cookies.delete("trihex_vault_clearance");

  return response;
}
