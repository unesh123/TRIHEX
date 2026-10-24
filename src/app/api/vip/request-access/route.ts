import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getCurrentStorefrontUser } from "@/lib/auth/user-session";
import { registerOrUpdateCustomerVip, type VipTier } from "@/lib/vip/vip-member-store";
import { createVipOrder } from "@/lib/vip/vip-order-store";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { nanoid } from "nanoid";
import { hashProofBytes } from "@/lib/payments/proof-hash";
import {
  isStorageConfigured,
  uploadObject,
  validateUploadFile,
} from "@/lib/storage/adapter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentStorefrontUser();
    const contentType = request.headers.get("content-type") || "";

    let tier = "1_MONTH";
    let phone = "";
    let email = user?.email || "";
    let name = user?.fullName || "";
    let paymentMethod = "BANK_QR";
    let paymentReference = "";
    let payerName = "";
    let notes = "";
    let proofFile: File | null = null;
    let existingProofUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      tier = String(form.get("tier") || "1_MONTH").trim();
      phone = String(form.get("phone") || "").trim();
      email = String(form.get("email") || email).trim().toLowerCase();
      name = String(form.get("name") || name).trim();
      paymentMethod = String(form.get("paymentMethod") || "BANK_QR").trim();
      paymentReference = String(
        form.get("paymentReference") ||
        form.get("paymentId") ||
        form.get("transactionReference") ||
        form.get("senderReference") ||
        ""
      ).trim();
      payerName = String(form.get("payerName") || form.get("senderName") || "").trim();
      notes = String(form.get("notes") || form.get("remarks") || "").trim();

      const candidateFile = form.get("proof");
      if (candidateFile instanceof File && candidateFile.size > 0) {
        proofFile = candidateFile;
      }
    } else {
      const body = await request.json();
      tier = String(body.tier || "1_MONTH").trim();
      phone = String(body.phone || "").trim();
      email = String(body.email || email).trim().toLowerCase();
      name = String(body.name || name).trim();
      paymentMethod = String(body.paymentMethod || "BANK_QR").trim();
      paymentReference = String(body.paymentReference || body.paymentId || "").trim();
      payerName = String(body.payerName || "").trim();
      notes = String(body.notes || body.remarks || "").trim();
      existingProofUrl = body.proofUrl || null;
    }

    if (!name) name = email.split("@")[0] || "Customer";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please sign in with Google first." },
        { status: 401 },
      );
    }

    const cleanedPhone = phone.trim();
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

    // Process payment proof screenshot if provided
    let proofUrl: string | null = existingProofUrl;
    let proofContentHash: string | null = null;

    if (proofFile) {
      try {
        const fileMime = proofFile.type || "image/jpeg";
        validateUploadFile({
          contentType: fileMime,
          size: proofFile.size,
          kind: "payment_proof",
          originalName: proofFile.name,
        });

        const bytes = Buffer.from(await proofFile.arrayBuffer());
        proofContentHash = hashProofBytes(bytes);

        if (isStorageConfigured()) {
          const uploaded = await uploadObject({
            kind: "payment_proof",
            contentType: fileMime,
            size: bytes.length,
            body: bytes,
          });
          proofUrl = `storage://${uploaded.bucket}/${uploaded.path}`;
        } else {
          const dir = path.join(process.cwd(), "public", "media", "payment-proofs");
          await fs.mkdir(dir, { recursive: true });
          const ext =
            fileMime === "image/png"
              ? "png"
              : fileMime === "image/webp"
              ? "webp"
              : fileMime === "application/pdf"
              ? "pdf"
              : "jpg";
          const filename = `vip-${Date.now()}-${nanoid(6)}.${ext}`;
          await fs.writeFile(path.join(dir, filename), bytes);
          proofUrl = `/media/payment-proofs/${filename}`;
        }
      } catch (uploadErr) {
        console.warn("[VIP Request Access] Proof screenshot upload note:", uploadErr);
      }
    }

    // 1. Register pending VIP member
    const member = await registerOrUpdateCustomerVip({
      phone: cleanedPhone,
      name,
      email,
      tier: tier as VipTier,
      status: "PENDING_VERIFICATION",
      amountNpr: priceNpr,
      adminNotes: `[VIP ACCESS REQUEST] Method: ${paymentMethod} | Ref/PaymentID: ${paymentReference || "Direct QR"} | Payer: ${payerName || name} | Slip: ${proofUrl ? "ATTACHED" : "None"} | Remarks: ${notes} | Token: ${token}`,
      verificationToken: token,
    });

    // 2. Also record in VIP order store with payment screenshot so admin sees it in live feed
    const createdOrder = await createVipOrder({
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
      notes: notes
        ? `[VIP ACCESS REQUEST] Remarks: ${notes} | Slip: ${proofUrl ? "ATTACHED" : "None"}`
        : `[VIP ACCESS REQUEST] Slip: ${proofUrl ? "ATTACHED" : "None"}`,
      proofUrl,
      proofContentHash,
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
            orderNumber: createdOrder.orderNumber,
            paymentMethod,
            paymentReference,
            proofUrl,
          },
        }).catch(() => null);
      }
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      order: createdOrder,
      orderNumber: createdOrder.orderNumber,
      customerCode: member.verificationToken,
      proofUrl,
      member,
      message: "VIP access requested successfully with payment proof. Admin approval pending upon review.",
    });
  } catch (err) {
    console.error("[VIP Request Access] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal error processing VIP access request." },
      { status: 500 },
    );
  }
}
