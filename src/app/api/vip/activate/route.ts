import { NextResponse } from "next/server";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { nanoid } from "nanoid";

// In-memory ledger for rapid activation verification
interface VipActivationRecord {
  token: string;
  email: string;
  tierId: string;
  priceNpr: number;
  status: "PENDING_VERIFICATION" | "ACTIVE";
  submittedAt: string;
}

const vipActivationsMemory: VipActivationRecord[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, tierId, priceNpr, verificationToken } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid account email (Google Account) is required." },
        { status: 400 }
      );
    }

    if (!tierId || !priceNpr) {
      return NextResponse.json(
        { success: false, error: "VIP Tier and Price are required." },
        { status: 400 }
      );
    }

    const token = verificationToken || `THX-VIP-${Date.now().toString(36).toUpperCase()}-${nanoid(6).toUpperCase()}`;

    const record: VipActivationRecord = {
      token,
      email: email.trim().toLowerCase(),
      tierId,
      priceNpr: Number(priceNpr),
      status: "PENDING_VERIFICATION",
      submittedAt: new Date().toISOString(),
    };

    vipActivationsMemory.push(record);

    // Attempt DB logging if PostgreSQL connection is live
    try {
      const db = getDb();
      if (db) {
        // Record as an audit log or submission
        await db.insert(schema.auditLogs).values({
          action: "VIP_ACTIVATION_REQUESTED",
          entityType: "VIP_MEMBERSHIP",
          entityId: token,
          actorRole: "CUSTOMER",
          metadata: {
            email: record.email,
            tierId: record.tierId,
            priceNpr: record.priceNpr,
            token: record.token,
          },
        }).catch(() => null);
      }
    } catch {
      // Soft-fail to in-memory ledger
    }

    return NextResponse.json({
      success: true,
      token,
      status: "PENDING_VERIFICATION",
      message: "VIP activation order staged. Verify your payment via WhatsApp to unlock instant credentials.",
    });
  } catch (error) {
    console.error("Failed to stage VIP activation:", error);
    return NextResponse.json(
      { success: false, error: "Internal error staging VIP activation." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token) {
    const found = vipActivationsMemory.find((r) => r.token === token);
    if (!found) {
      return NextResponse.json({ success: false, error: "Token not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, record: found });
  }

  return NextResponse.json({
    success: true,
    count: vipActivationsMemory.length,
    records: vipActivationsMemory.slice(-20),
  });
}
