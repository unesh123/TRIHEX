import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") || "/account";
  const origin = requestUrl.origin;

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    "1055636675498-jo31l5n9fouujd1htgdmo390arl95h7t.apps.googleusercontent.com";

  // If a specific redirect URI is registered in Google Cloud Console (e.g. from .env.local),
  // use it so Google doesn't throw redirect_uri_mismatch.
  const configuredUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  const redirectUri = configuredUri || `${origin}/api/auth/google/callback`;

  const state = Buffer.from(
    JSON.stringify({ next, origin, redirectUri }),
  ).toString("base64url");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account"); // Ensures multi-account selection prompt appears

  return NextResponse.redirect(googleAuthUrl);
}
