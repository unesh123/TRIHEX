import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { AdminApiError, requireAdminApi } from "@/lib/api/guard";
import { isFulfillmentComplete } from "@/lib/orders/fulfillment-checklist";

const bodySchema = z.object({
  orderId: z.string().uuid(),
  activated: z.boolean(),
  emailSent: z.boolean(),
  whatsappDelivered: z.boolean(),
  notes: z.string().max(4000).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdminApi();
    const parsed = bodySchema.parse(await request.json());
    const db = requireDb();

    const delivered = isFulfillmentComplete({
      whatsappDelivered: parsed.whatsappDelivered,
    });

    const [existing] = await db
      .select({
        id: schema.orders.id,
        deliveredAt: schema.orders.fulfillmentDeliveredAt,
        orderStatus: schema.orders.orderStatus,
        paymentStatus: schema.orders.paymentStatus,
      })
      .from(schema.orders)
      .where(eq(schema.orders.id, parsed.orderId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
    }

    const deliveredAt = delivered
      ? existing.deliveredAt ?? new Date()
      : null;

    await db
      .update(schema.orders)
      .set({
        fulfillmentActivated: parsed.activated,
        fulfillmentEmailSent: parsed.emailSent,
        fulfillmentWhatsappDelivered: parsed.whatsappDelivered,
        fulfillmentNotes: parsed.notes?.trim() || null,
        fulfillmentDeliveredAt: deliveredAt,
        fulfillmentStatus: delivered ? "DELIVERED" : "IN_PROGRESS",
        orderStatus: delivered
          ? "COMPLETED"
          : existing.paymentStatus === "PAID"
            ? "PROCESSING"
            : existing.orderStatus,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, parsed.orderId));

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/fulfillment");
    revalidatePath(`/admin/orders/${parsed.orderId}`);

    return NextResponse.json({
      ok: true,
      complete: delivered,
      deliveredAt: deliveredAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
