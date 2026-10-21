import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") || "/vip";
  const origin = requestUrl.origin;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    // If client ID is missing, redirect to account with error
    return NextResponse.redirect(
      new URL(`/account?error=google_client_id_missing&next=${encodeURIComponent(next)}`, origin),
    );
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = Buffer.from(JSON.stringify({ next, origin })).toString("base64url");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent select_account");

  return NextResponse.redirect(googleAuthUrl);
}
