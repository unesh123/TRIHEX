import { NextRequest, NextResponse } from "next/server";
import { getPersonalizedRecommendations, UserInterestProfile } from "@/lib/personalization/user-intent";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const profile: UserInterestProfile = {
      recentProductSlugs: Array.isArray(body.recentProductSlugs) ? body.recentProductSlugs.slice(0, 5) : [],
      recentCategories: Array.isArray(body.recentCategories) ? body.recentCategories.slice(0, 5) : [],
      savedEntityIds: Array.isArray(body.savedEntityIds) ? body.savedEntityIds.slice(0, 10) : [],
    };

    const recommendations = await getPersonalizedRecommendations(profile);
    return NextResponse.json({ recommendations });
  } catch (err: any) {
    console.error("[PersonalizationAPI] Failed to get recommendations:", err);
    return NextResponse.json({ error: "Failed to load personalized recommendations" }, { status: 500 });
  }
}
