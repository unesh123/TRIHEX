import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getOrderByNumber } from "@/lib/checkout/order-store";
import { createManualPaymentSubmission } from "@/lib/payments/manual";
import { hashProofBytes } from "@/lib/payments/proof-hash";
import { detectPaymentDuplicates } from "@/lib/payments/store";
import { getRepositories } from "@/lib/repositories";
import {
  isStorageConfigured,
  uploadObject,
  validateUploadFile,
} from "@/lib/storage/adapter";

export const runtime = "nodejs";

const METHOD_MAP = {
  ESEWA_MANUAL: "ESEWA_MANUAL",
  KHALTI_MANUAL: "KHALTI_MANUAL",
  BANK_TRANSFER: "BANK_TRANSFER",
  ESEWA_GATEWAY: "ESEWA_MANUAL",
  KHALTI_GATEWAY: "KHALTI_MANUAL",
} as const;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const orderNumber = String(form.get("orderNumber") ?? "").trim();
    const senderName = String(form.get("senderName") ?? "").trim();
    const senderReference = String(form.get("senderReference") ?? "").trim();
    const amountMinor = Number(form.get("amountMinor") ?? 0);
    const paymentMethodRaw = String(form.get("paymentMethod") ?? "BANK_TRANSFER");
    const file = form.get("proof");

    if (!orderNumber || !senderName || !senderReference) {
      return NextResponse.json(
        { ok: false, error: "Order number, name, and reference are required." },
        { status: 400 },
      );
    }
    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json(
        { ok: false, error: "Payment screenshot is required." },
        { status: 400 },
      );
    }

    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Order not found. Check your order number." },
        { status: 404 },
      );
    }

    const contentType = file.type || "image/jpeg";
    validateUploadFile({
      contentType,
      size: file.size,
      kind: "payment_proof",
      originalName: file.name,
    });

    const bytes = Buffer.from(await file.arrayBuffer());
    const proofContentHash = hashProofBytes(bytes);

    const duplicates = await detectPaymentDuplicates({
      reference: senderReference,
      proofHash: proofContentHash,
      excludeOrderId: order.id,
    });

    let proofUrl: string;

    if (isStorageConfigured()) {
      const uploaded = await uploadObject({
        kind: "payment_proof",
        contentType,
        size: bytes.length,
        body: bytes,
      });
      proofUrl = `storage://${uploaded.bucket}/${uploaded.path}`;
    } else {
      const dir = path.join(process.cwd(), "public", "media", "payment-proofs");
      await fs.mkdir(dir, { recursive: true });
      const ext =
        contentType === "image/png"
          ? "png"
          : contentType === "image/webp"
            ? "webp"
            : contentType === "application/pdf"
              ? "pdf"
              : "jpg";
      const filename = `${order.orderNumber.toLowerCase()}-${Date.now()}.${ext}`;
      await fs.writeFile(path.join(dir, filename), bytes);
      proofUrl = `/media/payment-proofs/${filename}`;
    }

    const methodKey =
      METHOD_MAP[paymentMethodRaw as keyof typeof METHOD_MAP] ?? "BANK_TRANSFER";

    const record = createManualPaymentSubmission({
      id: crypto.randomUUID(),
      orderId: order.id,
      method: methodKey,
      amountNprMinor:
        Number.isFinite(amountMinor) && amountMinor > 0
          ? Math.round(amountMinor)
          : order.totalNprMinor,
      referenceCode: senderReference,
      proofUrl,
      proofContentHash,
      payerName: senderName,
    });

    const repos = getRepositories();
    await repos.payments.submit(record);
    await repos.orders.updatePaymentStatus(
      order.id,
      "UNDER_REVIEW",
      "PROCESSING",
    );

    return NextResponse.json({
      ok: true,
      proofUrl,
      orderStatus: "PROCESSING",
      paymentStatus: "UNDER_REVIEW",
      duplicateWarning: duplicates.hasWarning
        ? {
            sameReferenceOrders: duplicates.duplicateReference.map((r) => r.orderId),
            sameProofOrders: duplicates.duplicateProof.map((r) => r.orderId),
          }
        : null,
      message:
        "Order submitted. Payment screenshot received — we will verify and deliver via WhatsApp.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
