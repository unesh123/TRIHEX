import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  parseAdminSessionCookie,
} from "@/lib/admin/session-cookie";
import {
  USER_SESSION_COOKIE,
  decodeUserSession,
} from "@/lib/auth/user-session";
import { isOwnerEmail } from "@/lib/auth/owner";
import { isSecureCookie } from "@/lib/auth/cookie-config";

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: https://accounts.google.com; frame-src 'self' https://accounts.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  return response;
}

// Common malicious vulnerability scanners and intrusion probes
const SCANNER_PROBE_REGEX =
  /(?:\/\.env|\/\.git|\/wp-admin|\/wp-login|\/phpmyadmin|\/xmlrpc\.php|\/\.aws|\/\.ds_store)/i;

function hasAdminAccess(request: NextRequest): boolean {
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

  // 1. Direct admin session cookie check
  const rawAdminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (rawAdminCookie) {
    const session = parseAdminSessionCookie(rawAdminCookie);
    if (session?.email && isOwnerEmail(session.email)) {
      return true;
    }
  }

  // 2. Verified Google user session cookie check (Platform Owner)
  const rawUserCookie = request.cookies.get(USER_SESSION_COOKIE)?.value;
  if (rawUserCookie) {
    const user = decodeUserSession(rawUserCookie);
    if (user?.email && isOwnerEmail(user.email)) {
      return true;
    }
  }

  return false;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.trihexdigital.shop")) {
    const redirectUrl = new URL(request.url);
    redirectUrl.host = "trihexdigital.shop";
    redirectUrl.protocol = "https:";
    return NextResponse.redirect(redirectUrl, 308);
  }

  const { pathname } = request.nextUrl;

  // 1. Instantly drop common vulnerability scanner probes
  if (SCANNER_PROBE_REGEX.test(pathname)) {
    return new NextResponse("Access Forbidden - Automated Probe Terminated", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // 2. Convenience Alias for Secret Vault
  if (pathname === "/control-vault-9702") {
    const vaultUrl = new URL("/vault-k9702-x8f2a9c1e4d7", request.url);
    const redirectResponse = NextResponse.redirect(vaultUrl);
    redirectResponse.cookies.set("trihex_vault_clearance", "cleared_zone_9702", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      maxAge: 60 * 60 * 12,
    });
    return applySecurityHeaders(redirectResponse);
  }

  // 3. Direct Visit to Hard Secret Vault
  if (pathname === "/vault-k9702-x8f2a9c1e4d7") {
    const response = NextResponse.next();
    response.cookies.set("trihex_vault_clearance", "cleared_zone_9702", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookie(),
      maxAge: 60 * 60 * 12,
    });
    response.headers.set("x-pathname", pathname);
    return applySecurityHeaders(response);
  }

  // 4. /admin/login Route: Redirect to /admin if already authenticated
  if (pathname === "/admin/login") {
    if (hasAdminAccess(request)) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/admin", request.url)),
      );
    }
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return applySecurityHeaders(response);
  }

  // 5. Protected Admin Workspace Routes (Exclude /admin/login and /admin/unauthorized)
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/unauthorized"
  ) {
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
