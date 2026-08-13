import { NextResponse } from "next/server";
import { z } from "zod";
import { appendAuditEvent } from "@/lib/audit/log";
import { submitManualPayment } from "@/lib/payments/store";
import { nanoid } from "nanoid";

const bodySchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(["ESEWA_MANUAL", "KHALTI_MANUAL", "BANK_TRANSFER"]),
  amountNprMinor: z.number().int().positive(),
  referenceCode: z.string().optional().nullable(),
  proofUrl: z.string().url().optional().nullable(),
  payerName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.parse(json);

    if (!parsed.proofUrl && !parsed.referenceCode) {
      return NextResponse.json(
        { error: "Provide proofUrl or referenceCode." },
        { status: 400 },
      );
    }

    const record = await submitManualPayment({
      id: nanoid(),
      orderId: parsed.orderId,
      method: parsed.method,
      amountNprMinor: parsed.amountNprMinor,
      referenceCode: parsed.referenceCode,
      proofUrl: parsed.proofUrl,
      payerName: parsed.payerName,
      notes: parsed.notes,
    });

    await appendAuditEvent({
      action: "PAYMENT_SUBMITTED",
      entityType: "manual_payment",
      entityId: record.id,
      metadata: {
        orderId: record.orderId,
        method: record.method,
        amountNprMinor: record.amountNprMinor,
      },
    });

    return NextResponse.json({ ok: true, payment: record }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request body.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
