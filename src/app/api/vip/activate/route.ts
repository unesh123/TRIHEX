import { NextResponse } from "next/server";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { nanoid } from "nanoid";
import {
  registerOrUpdateCustomerVip,
  type VipTier,
} from "@/lib/vip/vip-member-store";

// In-memory ledger for rapid activation verification
interface VipActivationRecord {
  token: string;
  phone: string;
  email: string;
  name: string;
  tierId: string;
  priceNpr: number;
  paymentReference?: string;
  payerName?: string;
  status: "PENDING_VERIFICATION" | "ACTIVE";
  submittedAt: string;
}

const vipActivationsMemory: VipActivationRecord[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      phone,
      name,
      email,
      tierId,
      priceNpr,
      paymentReference,
      payerName,
      verificationToken,
    } = body;

    const cleanedPhone = String(phone || "").trim();
    if (!cleanedPhone || cleanedPhone.replace(/\D/g, "").length < 7) {
      return NextResponse.json(
        { success: false, error: "A valid mobile number is required to register and track your VIP access." },
        { status: 400 },
      );
    }

    if (!tierId || !priceNpr) {
      return NextResponse.json(
        { success: false, error: "VIP Tier and Price are required." },
        { status: 400 },
      );
    }

    const token =
      verificationToken ||
      `THX-VIP-${String(tierId).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

    const safeEmail =
      email && String(email).includes("@")
        ? String(email).trim().toLowerCase()
        : `${cleanedPhone.replace(/\D/g, "")}@customer.trihex.digital`;

    const safeName = String(name || "").trim() || `Member ${cleanedPhone.slice(-4)}`;

    const record: VipActivationRecord = {
      token,
      phone: cleanedPhone,
      email: safeEmail,
      name: safeName,
      tierId: String(tierId),
      priceNpr: Number(priceNpr),
      paymentReference: paymentReference ? String(paymentReference).trim() : undefined,
      payerName: payerName ? String(payerName).trim() : undefined,
      status: "PENDING_VERIFICATION",
      submittedAt: new Date().toISOString(),
    };

    vipActivationsMemory.push(record);

    // Register or update into VIP Member Store so Admin instantly sees them in Control Center
    const vipMember = await registerOrUpdateCustomerVip({
      phone: cleanedPhone,
      name: safeName,
      email: safeEmail,
      tier: (tierId as VipTier) || "1_MONTH",
      status: "PENDING_VERIFICATION",
      amountNpr: Number(priceNpr),
      adminNotes: `Bank QR Payment Submitted. Payer: ${record.payerName || "Self"}. Ref ID: ${record.paymentReference || "Manual QR"}. Token: ${token}`,
      verificationToken: token,
    });

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
            phone: record.phone,
            name: record.name,
            email: record.email,
            tierId: record.tierId,
            priceNpr: record.priceNpr,
            token: record.token,
            paymentReference: record.paymentReference,
            payerName: record.payerName,
          },
        }).catch(() => null);
      }
    } catch {
      // Soft-fail to in-memory ledger
    }

    return NextResponse.json({
      success: true,
      token,
      member: vipMember,
      status: "PENDING_VERIFICATION",
      message: "VIP activation order staged. Verify your payment via WhatsApp to unlock instant credentials.",
    });
  } catch (error) {
    console.error("Failed to stage VIP activation:", error);
    return NextResponse.json(
      { success: false, error: "Internal error staging VIP activation." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const phone = searchParams.get("phone");

  if (token) {
    const found = vipActivationsMemory.find((r) => r.token === token);
    if (!found) {
      return NextResponse.json({ success: false, error: "Token not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, record: found });
  }

  if (phone) {
    const cleaned = phone.replace(/\D/g, "");
    const matches = vipActivationsMemory.filter((r) =>
      r.phone.replace(/\D/g, "").includes(cleaned),
    );
    return NextResponse.json({ success: true, records: matches });
  }

  return NextResponse.json({
    success: true,
    totalPending: vipActivationsMemory.length,
    recent: vipActivationsMemory.slice(-20),
  });
}
