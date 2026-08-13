import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "trihex_admin_session";

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  return response;
}

function hasAdminAccess(request: NextRequest): boolean {
  // Production must never honor ADMIN_DEV_BYPASS
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ADMIN_DEV_BYPASS === "true"
  ) {
    return false;
  }
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_DEV_BYPASS === "true"
  ) {
    return true;
  }
  return request.cookies.has(ADMIN_SESSION_COOKIE);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasAdminAccess(request)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
