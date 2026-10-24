import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * PERMANENTLY DISABLED AND LOCKED.
 * Direct unauthenticated simulation is eliminated for security.
 * All authentication must strictly pass through verified Google OAuth 2.0.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Quick login is permanently disabled. Please use official Google Sign-In.",
    },
    { status: 403 },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Quick login is permanently disabled. Please use official Google Sign-In.",
    },
    { status: 403 },
  );
}
