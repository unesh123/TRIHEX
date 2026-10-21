import { NextResponse } from "next/server";
import { USER_SESSION_COOKIE } from "@/lib/auth/user-session";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session-cookie";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/";
  const origin = url.origin;
  const target = next.startsWith("/") ? new URL(next, origin) : new URL("/", origin);

  const response = NextResponse.redirect(target, 303);

  response.cookies.delete(USER_SESSION_COOKIE);
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  response.cookies.delete("trihex_vault_clearance");

  response.cookies.set(USER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set("trihex_vault_clearance", "", { path: "/", maxAge: 0 });

  return response;
}
