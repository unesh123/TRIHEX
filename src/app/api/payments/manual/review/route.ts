import { NextResponse } from "next/server";
import { z } from "zod";
import { AdminApiError, requireAdminApi } from "@/lib/api/guard";
import { appendAuditEvent } from "@/lib/audit/log";
import { getManualPayment, reviewManualPayment } from "@/lib/payments/store";

const bodySchema = z.object({
  id: z.string().min(1),
  action: z.enum(["review", "verify", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const gate = await requireAdminApi();
    const json = await request.json();
    const parsed = bodySchema.parse(json);

    const existing = await getManualPayment(parsed.id);
    if (!existing) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    const updated = await reviewManualPayment({
      id: parsed.id,
      action: parsed.action,
      reviewerId: gate.session.userId ?? "admin",
      rejectionReason: parsed.rejectionReason,
    });

    try {
      await appendAuditEvent({
        action:
          parsed.action === "verify"
            ? "PAYMENT_VERIFIED"
            : parsed.action === "reject"
              ? "PAYMENT_REJECTED"
              : "PAYMENT_SUBMITTED",
        actorId: gate.session.userId,
        actorRole: gate.session.role,
        entityType: "manual_payment",
        entityId: updated.id,
        metadata: { status: updated.status, orderId: updated.orderId },
      });
    } catch (auditErr) {
      console.error("[payment-review] audit failed", auditErr);
    }

    return NextResponse.json({ ok: true, payment: updated });
  } catch (error) {
    console.error("[payment-review]", error);
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Invalid request body.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
