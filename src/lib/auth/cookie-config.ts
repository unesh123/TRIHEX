/**
 * Shared cookie configuration helper.
 * Ensures the `secure` flag is only enabled when running over HTTPS
 * (e.g., in production on Vercel or when NEXT_PUBLIC_APP_URL starts with https://).
 * In local production test runs (e.g. `npm run start` on http://localhost:3000),
 * `secure: true` causes browsers to drop cookies on unencrypted HTTP.
 */
export function isSecureCookie(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (url.startsWith("https://")) return true;
  if (process.env.VERCEL === "1") return true;
  return false;
}
