import { NextResponse } from "next/server";
import { performUniversalSearch, hashIpForAnalytics } from "@/lib/search/universal-search";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    if (!q.trim()) {
      return NextResponse.json({ totalCount: 0, groups: [] });
    }

    const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const ip = forwarded.split(",")[0].trim();
    const ipHash = hashIpForAnalytics(ip);

    const results = await performUniversalSearch(q, 4, { ipHash, trackAnalytics: true });
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("[search] universal search error", err);
    return NextResponse.json({ totalCount: 0, groups: [], error: err?.message }, { status: 500 });
  }
}
