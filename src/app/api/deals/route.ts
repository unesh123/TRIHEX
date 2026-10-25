import { NextResponse } from "next/server";
import { getPublishedDeals, getAllDealCandidates } from "@/lib/deals/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
    const category = searchParams.get("category");
    const dealType = searchParams.get("dealType");

    let deals = getPublishedDeals();

    if (category && category !== "ALL") {
      deals = deals.filter((d) => d.category === category);
    }
    if (dealType && dealType !== "ALL") {
      deals = deals.filter((d) => d.dealType === dealType);
    }

    const all = getAllDealCandidates();
    const stats = {
      totalMonitored: all.length,
      publishedLive: all.filter((d) => d.status === "PUBLISHED" || d.status === "VERIFIED").length,
      cloudCredits: all.filter((d) => d.dealType === "CREDITS").length,
      studentPacks: all.filter((d) => d.dealType === "STUDENT_TIER").length,
      freebies: all.filter((d) => d.dealType === "FREEBIE").length,
    };

    return NextResponse.json({
      success: true,
      radarStatus: "ACTIVE_24_7",
      timestamp: new Date().toISOString(),
      stats,
      count: deals.length,
      deals: deals.slice(0, limit),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch deals radar" },
      { status: 500 }
    );
  }
}
