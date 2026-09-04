import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createWatchlistAlert,
  getWatchlistAlerts,
  deleteWatchlistAlert,
  toggleWatchlistAlert,
  evaluateWatchlistTriggers,
} from "@/lib/watchlist/store";

export const dynamic = "force-dynamic";

const CreateAlertSchema = z.object({
  userId: z.string().min(1),
  entityType: z.enum(["PRODUCT", "DEAL", "FOREX", "CIVIC"]),
  entityId: z.string().min(1),
  condition: z.enum(["PRICE_DROP", "IN_STOCK", "RATE_ABOVE", "RATE_BELOW", "NEW_VERIFIED_DEAL"]),
  channel: z.enum(["EMAIL", "BROWSER", "WHATSAPP"]).optional(),
  targetValue: z.string().optional(),
  label: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
  }

  try {
    const alerts = await getWatchlistAlerts(userId);
    const triggers = await evaluateWatchlistTriggers(userId);

    return NextResponse.json({
      alerts,
      triggers,
    });
  } catch (err: any) {
    console.error("[WatchlistAPI] Failed to get alerts:", err);
    return NextResponse.json({ error: "Failed to fetch watchlist alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Toggle action
    if (body.action === "toggle") {
      const { alertId, enabled, userId } = body;
      if (!alertId || typeof enabled !== "boolean" || !userId) {
        return NextResponse.json({ error: "Missing toggle parameters" }, { status: 400 });
      }
      const success = await toggleWatchlistAlert(alertId, enabled, userId);
      return NextResponse.json({ success });
    }

    // Create action
    const parsed = CreateAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 422 }
      );
    }

    const alert = await createWatchlistAlert(parsed.data);
    return NextResponse.json({ success: true, alert }, { status: 201 });
  } catch (err: any) {
    console.error("[WatchlistAPI] Failed to create or toggle alert:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get("alertId");
    const userId = searchParams.get("userId");

    if (!alertId || !userId) {
      return NextResponse.json({ error: "alertId and userId are required" }, { status: 400 });
    }

    const success = await deleteWatchlistAlert(alertId, userId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("[WatchlistAPI] Failed to delete alert:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
