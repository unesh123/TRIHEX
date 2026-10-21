import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Disabled: Direct unauthenticated Google simulation is permanently deprecated and locked.
 * All authentication must proceed through verified OAuth authorization codes.
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
