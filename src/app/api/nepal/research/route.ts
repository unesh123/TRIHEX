import { NextRequest, NextResponse } from "next/server";
import { executeDeepResearch } from "@/lib/research/engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (!query || query.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Research query must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { ok: false, error: "Research query cannot exceed 500 characters." },
        { status: 400 }
      );
    }

    const report = await executeDeepResearch(query);

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error: any) {
    console.error("[api/nepal/research] Execution failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate deep research briefing." },
      { status: 500 }
    );
  }
}
