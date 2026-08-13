export const ADMIN_SESSION_COOKIE = "trihex_admin_session";

export function buildAdminSessionCookieValue(email: string): string {
  return Buffer.from(JSON.stringify({ email, ts: Date.now() })).toString(
    "base64url",
  );
}

export function parseAdminSessionCookie(
  cookieHeader: string,
): { email: string } | null {
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`),
  );
  if (!match?.[1]) return null;
  try {
    const decoded = Buffer.from(match[1], "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as { email?: string };
    if (!parsed.email) return null;
    return { email: parsed.email };
  } catch {
    return null;
  }
}
