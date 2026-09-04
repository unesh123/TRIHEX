import { NextResponse } from "next/server";
import { performUniversalSearch } from "@/lib/search/universal-search";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    if (!q.trim()) {
      return NextResponse.json({ totalCount: 0, groups: [] });
    }

    const results = await performUniversalSearch(q);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("[search] universal search error", err);
    return NextResponse.json({ totalCount: 0, groups: [], error: err?.message }, { status: 500 });
  }
}
