/** Canonical public site URL for metadata, WhatsApp links, emails. */
export const DEFAULT_SITE_URL = "https://trihexdigital.shop";

function isUsableSiteUrl(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  if (/SENSITIVE|CHANGE_ME|placeholder|your_/i.test(t)) return false;
  try {
    const withProtocol = t.startsWith("http") ? t : `https://${t}`;
    const u = new URL(withProtocol);
    return Boolean(u.hostname) && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ];
  for (const raw of candidates) {
    if (raw && isUsableSiteUrl(raw)) {
      const withProtocol = raw.trim().startsWith("http")
        ? raw.trim()
        : `https://${raw.trim()}`;
      return withProtocol.replace(/\/$/, "");
    }
  }
  return DEFAULT_SITE_URL;
}
