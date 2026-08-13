import { NextResponse } from "next/server";
import { z } from "zod";
import { AdminApiError, requireAdminApi } from "@/lib/api/guard";
import { appendAuditEvent } from "@/lib/audit/log";
import { seedMemoryLot } from "@/lib/inventory/reserve";
import { nanoid } from "nanoid";

const bodySchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  lotId: z.string().optional(),
  supplierReference: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const gate = await requireAdminApi();
    const parsed = bodySchema.parse(await request.json());
    const lotId = parsed.lotId ?? `lot_${nanoid(8)}`;

    const lot = seedMemoryLot({
      lotId,
      variantId: parsed.variantId,
      quantityAvailable: parsed.quantity,
    });

    await appendAuditEvent({
      action: "SYSTEM_EVENT",
      actorId: gate.session.userId,
      actorRole: gate.session.role,
      entityType: "inventory_lot",
      entityId: lot.lotId,
      metadata: {
        movement: "RECEIVE",
        variantId: parsed.variantId,
        quantity: parsed.quantity,
        supplierReference: parsed.supplierReference ?? null,
      },
    });

    return NextResponse.json({ ok: true, lot }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Invalid request body.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
