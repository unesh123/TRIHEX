import { NextResponse } from "next/server";
import { getCurrentStorefrontUser } from "@/lib/auth/user-session";
import { registerOrUpdateCustomerVip, type VipTier } from "@/lib/vip/vip-member-store";
import { createVipOrder } from "@/lib/vip/vip-order-store";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentStorefrontUser();
    const body = await request.json();
    const {
      tier = "1_MONTH",
      phone,
      paymentMethod = "BANK_QR",
      paymentReference = "",
      payerName = "",
      notes = "",
    } = body;

    const email = user?.email || String(body.email || "").trim().toLowerCase();
    const name = user?.fullName || String(body.name || "").trim() || "Google User";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please sign in with Google first." },
        { status: 401 },
      );
    }

    const cleanedPhone = String(phone || "").trim();
    if (!cleanedPhone || cleanedPhone.replace(/\D/g, "").length < 7) {
      return NextResponse.json(
        { success: false, error: "A valid mobile / WhatsApp number is required for VIP verification." },
        { status: 400 },
      );
    }

    const priceMap: Record<string, number> = {
      "1_MONTH": 3999,
      "6_MONTHS": 5999,
      "LIFETIME": 7999,
    };
    const priceNpr = priceMap[tier] || 3999;
    const token = `THX-VIP-${tier}-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

    // 1. Register pending VIP member
    const member = await registerOrUpdateCustomerVip({
      phone: cleanedPhone,
      name,
      email,
      tier: tier as VipTier,
      status: "PENDING_VERIFICATION",
      amountNpr: priceNpr,
      adminNotes: `[VIP ACCESS REQUEST] Method: ${paymentMethod} | Ref: ${paymentReference || "Direct QR"} | Payer: ${payerName || name} | Notes: ${notes} | Token: ${token}`,
      verificationToken: token,
    });

    // 2. Also record in VIP order store so admin sees it in both Orders and VIP tabs
    await createVipOrder({
      customerName: name,
      customerPhone: cleanedPhone,
      customerEmail: email,
      tierId: tier,
      tierName: member.tierName,
      amountNpr: priceNpr,
      paymentMethod: paymentMethod === "ESEWA" ? "ESEWA" : paymentMethod === "KHALTI" ? "KHALTI" : "BANK_QR",
      transactionReference: paymentReference || `QR-${nanoid(6).toUpperCase()}`,
      status: "PENDING_VERIFICATION",
      deviceTelemetry: "VIP Portal Request Access",
      notes: notes || "Direct online request awaiting admin payment confirmation.",
    });

    // 3. Attempt DB audit log
    try {
      const db = getDb();
      if (db) {
        await db.insert(schema.auditLogs).values({
          action: "VIP_ACCESS_REQUESTED",
          entityType: "VIP_MEMBER",
          entityId: member.id,
          actorRole: "CUSTOMER",
          metadata: {
            email,
            phone: cleanedPhone,
            tier,
            token,
            paymentMethod,
            paymentReference,
          },
        }).catch(() => null);
      }
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      member,
      message: "VIP access requested successfully. Admin approval pending upon payment confirmation.",
    });
  } catch (err) {
    console.error("[VIP Request Access] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal error processing VIP access request." },
      { status: 500 },
    );
  }
}
