import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    "d233957"; // baseline latest release commit

  const buildTime = process.env.BUILD_TIME || new Date().toISOString();
  const environment = process.env.NODE_ENV || "development";

  return NextResponse.json(
    {
      status: "healthy",
      service: "TRIHEX DIGITAL Core",
      version: "7.1.0",
      commitSha,
      buildTime,
      environment,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
