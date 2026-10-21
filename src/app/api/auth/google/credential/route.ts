import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Disabled: Client-side credential posting without Google public key signature verification is disabled.
 * All authentication must proceed through verified OAuth authorization code exchange.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Endpoint deprecated. Please use official Google OAuth." },
    { status: 404 },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Endpoint deprecated. Please use official Google OAuth." },
    { status: 404 },
  );
}
