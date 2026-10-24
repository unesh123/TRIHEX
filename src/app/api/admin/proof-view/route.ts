import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import { resolveProofViewUrl } from "@/lib/storage/proof-url";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const gate = await checkAdminSession(request.headers);
  if (!gate.ok) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) {
    return new NextResponse("Path is required", { status: 400 });
  }

  try {
    const signedUrl = await resolveProofViewUrl(path);
    if (!signedUrl) {
      return new NextResponse("Proof image not found or inaccessible", { status: 404 });
    }

    return NextResponse.redirect(signedUrl, 307);
  } catch (err) {
    console.error("[proof-view] Resolution error:", err);
    return new NextResponse("Failed to resolve proof view URL", { status: 500 });
  }
}
