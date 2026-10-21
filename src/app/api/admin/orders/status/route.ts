import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, or } from "drizzle-orm";
import {
  deductStockForPaidOrder,
  restoreStockForOrder,
} from "@/lib/inventory/order-stock";
import { getRepositories } from "@/lib/repositories";
import { updateVipOrderStatus } from "@/lib/vip/vip-order-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, status, notes } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required." },
        { status: 400 },
      );
    }

    const now = new Date();
    const validUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const dbActorUuid = validUuidRegex.test(gate.session.userId || "") ? gate.session.userId : null;

    let updatedInDb = false;
    let paymentStatus = "UNPAID";
    let fulfillmentStatus = "NOT_STARTED";
    let orderStatus = status;

    switch (status) {
      case "PAID":
        orderStatus = "PAID";
        paymentStatus = "PAID";
        fulfillmentStatus = "PROCESSING";
        break;
      case "PROCESSING":
        orderStatus = "PROCESSING";
        paymentStatus = "UNDER_REVIEW";
        fulfillmentStatus = "IN_PROGRESS";
        break;
      case "FULFILLED":
        orderStatus = "FULFILLED";
        paymentStatus = "PAID";
        fulfillmentStatus = "DELIVERED";
        break;
      case "CANCELLED":
        orderStatus = "CANCELLED";
        paymentStatus = "CANCELLED";
        fulfillmentStatus = "CANCELLED";
        break;
      case "AWAITING_PAYMENT":
      case "PENDING_PAYMENT":
        orderStatus = "AWAITING_PAYMENT";
        paymentStatus = "UNPAID";
        fulfillmentStatus = "NOT_STARTED";
        break;
      default:
        orderStatus = status;
        break;
    }

    // 1. Try DB update if available
    const db = getDb();
    if (db) {
      try {
        const [existing] = await db
          .select()
          .from(schema.orders)
          .where(
            or(
              eq(schema.orders.id, orderId),
              eq(schema.orders.humanReadableOrderNumber, orderId)
            )
          )
          .limit(1);

        if (existing) {
          const updates: Partial<typeof schema.orders.$inferInsert> = {
            orderStatus: orderStatus as any,
            paymentStatus: paymentStatus as any,
            fulfillmentStatus: fulfillmentStatus as any,
            updatedAt: now,
          };

          if (notes) {
            updates.internalNotes = notes;
          }

          if (status === "PAID") {
            try {
              await deductStockForPaidOrder(existing.id);
            } catch {
              // non-fatal
            }
            try {
              await db
                .update(schema.manualPaymentSubmissions)
                .set({ status: "VERIFIED", reviewedAt: now, reviewerId: dbActorUuid })
                .where(eq(schema.manualPaymentSubmissions.orderId, existing.id));
            } catch {
              // non-fatal
            }
          } else if (status === "FULFILLED") {
            updates.fulfillmentActivated = true;
            updates.fulfillmentWhatsappDelivered = true;
            updates.fulfillmentDeliveredAt = now;
          } else if (status === "CANCELLED") {
            try {
              await restoreStockForOrder(existing.id);
            } catch {
              // non-fatal
            }
          }

          await db
            .update(schema.orders)
            .set(updates)
            .where(eq(schema.orders.id, existing.id));

          // Log history
          try {
            await db.insert(schema.orderStatusHistory).values({
              orderId: existing.id,
              fromStatus: existing.orderStatus,
              toStatus: orderStatus,
              statusType: "order",
              reason: notes || `Admin changed status to ${status}`,
              actorId: dbActorUuid,
            });

            await db.insert(schema.auditLogs).values({
              action: "ADMIN_ORDER_STATUS_CHANGED",
              entityType: "ORDER",
              entityId: existing.id,
              actorRole: gate.session.role,
              metadata: {
                fromStatus: existing.orderStatus,
                toStatus: orderStatus,
                orderNumber: existing.humanReadableOrderNumber,
              },
            });
          } catch {
            // non-fatal
          }

          updatedInDb = true;
        }
      } catch (dbErr) {
        console.warn("[OrderStatusAPI] DB update attempt note:", dbErr);
      }
    }

    // 2. Synchronize with VIP order store if applicable
    try {
      await updateVipOrderStatus(orderId, orderStatus, notes);
    } catch {
      // non-fatal
    }

    // 3. Fallback to repositories if in memory mode
    try {
      const repos = getRepositories();
      await repos.orders.updatePaymentStatus(orderId, paymentStatus as any, orderStatus);
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderStatus,
        paymentStatus,
        fulfillmentStatus,
      },
    });
  } catch (err) {
    console.error("[OrderStatusAPI] Status change error:", err);
    return NextResponse.json(
      { error: "Failed to update order status." },
      { status: 500 },
    );
  }
}
