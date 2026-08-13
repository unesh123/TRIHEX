import { NextResponse } from "next/server";
import { z } from "zod";
import { AdminApiError, requireAdminApi } from "@/lib/api/guard";
import { appendAuditEvent } from "@/lib/audit/log";
import { getMemoryLot, seedMemoryLot } from "@/lib/inventory/reserve";
import { validateMovement } from "@/lib/inventory/ledger";

const bodySchema = z.object({
  lotId: z.string().min(1),
  quantityDelta: z.number().int(),
  reason: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const gate = await requireAdminApi();
    const parsed = bodySchema.parse(await request.json());

    const existing = getMemoryLot(parsed.lotId);
    if (!existing) {
      return NextResponse.json({ error: "Lot not found." }, { status: 404 });
    }

    const check = validateMovement({
      beforeAvailable: existing.quantityAvailable,
      quantityDelta: parsed.quantityDelta,
      type: "CORRECTION",
    });

    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const lot = seedMemoryLot({
      lotId: parsed.lotId,
      variantId: existing.variantId,
      quantityAvailable: check.afterAvailable,
    });

    await appendAuditEvent({
      action: "SYSTEM_EVENT",
      actorId: gate.session.userId,
      actorRole: gate.session.role,
      entityType: "inventory_lot",
      entityId: lot.lotId,
      metadata: {
        movement: "CORRECTION",
        quantityDelta: parsed.quantityDelta,
        reason: parsed.reason,
        afterAvailable: lot.quantityAvailable,
      },
    });

    return NextResponse.json({ ok: true, lot });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Invalid request body.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
