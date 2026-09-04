import { NextResponse } from "next/server";
import { 
  getSavedItems, 
  toggleSavedItem, 
  mergeGuestSavedItems, 
  isItemSaved 
} from "@/lib/saved/store";
import { SavedEntityType } from "@/lib/saved/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const checkType = searchParams.get("checkType") as SavedEntityType | null;
    const checkId = searchParams.get("checkId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    if (checkType && checkId) {
      const saved = await isItemSaved(userId, checkType, checkId);
      return NextResponse.json({ saved });
    }

    const items = await getSavedItems(userId);
    return NextResponse.json({ items, count: items.length });
  } catch (err: any) {
    console.error("[api/saved] GET error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isMerge = searchParams.get("action") === "merge";
    const body = await req.json();

    if (isMerge) {
      const { guestUserId, authUserId } = body;
      if (!guestUserId || !authUserId) {
        return NextResponse.json({ error: "Missing guestUserId or authUserId" }, { status: 400 });
      }
      const mergedCount = await mergeGuestSavedItems(guestUserId, authUserId);
      return NextResponse.json({ success: true, mergedCount });
    }

    const { userId, entityType, entityId } = body;
    if (!userId || !entityType || !entityId) {
      return NextResponse.json({ error: "Missing userId, entityType, or entityId" }, { status: 400 });
    }

    const result = await toggleSavedItem(userId, entityType as SavedEntityType, entityId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[api/saved] POST error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
