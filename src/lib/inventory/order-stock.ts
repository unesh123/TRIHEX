/**
 * Commit / restore storefront stock for an order (seed_visible_quantity).
 * Used when admin verifies (deduct) or rejects after verify (restore).
 */
import { eq, sql } from "drizzle-orm";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";

export async function deductStockForPaidOrder(orderId: string): Promise<{
  ok: boolean;
  lines: number;
  error?: string;
}> {
  try {
    const db = requireDb();

    // Idempotency: if payment already PAID and we already committed stock once,
    // look for a marker in order notes. Prefer checking a dedicated flag via notes.
    const [order] = await db
      .select({
        id: schema.orders.id,
        paymentStatus: schema.orders.paymentStatus,
        orderNotes: schema.orders.orderNotes,
      })
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) return { ok: false, lines: 0, error: "Order not found" };
    if (order.orderNotes?.includes("[STOCK_COMMITTED]")) {
      return { ok: true, lines: 0 };
    }

    const items = await db
      .select({
        variantId: schema.orderItems.variantId,
        quantity: schema.orderItems.quantity,
      })
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, orderId));

    let lines = 0;
    for (const item of items) {
      if (!item.variantId || item.quantity <= 0) continue;

      const [variant] = await db
        .select({
          id: schema.productVariants.id,
          qty: schema.productVariants.seedVisibleQuantity,
        })
        .from(schema.productVariants)
        .where(eq(schema.productVariants.id, item.variantId))
        .limit(1);

      // null qty = unlimited — skip
      if (!variant || variant.qty == null) continue;

      await db
        .update(schema.productVariants)
        .set({
          seedVisibleQuantity: sql`GREATEST(0, COALESCE(${schema.productVariants.seedVisibleQuantity}, 0) - ${item.quantity})`,
          updatedAt: new Date(),
        })
        .where(eq(schema.productVariants.id, item.variantId));

      // If stock hits 0, turn off Buy Now
      const [after] = await db
        .select({ qty: schema.productVariants.seedVisibleQuantity })
        .from(schema.productVariants)
        .where(eq(schema.productVariants.id, item.variantId))
        .limit(1);
      if (after?.qty === 0) {
        await db
          .update(schema.productVariants)
          .set({ purchasable: false, updatedAt: new Date() })
          .where(eq(schema.productVariants.id, item.variantId));
      }

      lines += 1;
    }

    const notes = order.orderNotes?.trim() ?? "";
    await db
      .update(schema.orders)
      .set({
        orderNotes: notes
          ? `${notes}\n[STOCK_COMMITTED]`
          : "[STOCK_COMMITTED]",
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, orderId));

    return { ok: true, lines };
  } catch (err) {
    console.error("[stock] deductStockForPaidOrder failed", err);
    return {
      ok: false,
      lines: 0,
      error: err instanceof Error ? err.message : "Stock deduct failed",
    };
  }
}

export async function restoreStockForOrder(orderId: string): Promise<{
  ok: boolean;
  lines: number;
}> {
  try {
    const db = requireDb();
    const [order] = await db
      .select({
        id: schema.orders.id,
        orderNotes: schema.orders.orderNotes,
      })
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) return { ok: false, lines: 0 };
    // Only restore if we committed on approve
    if (!order.orderNotes?.includes("[STOCK_COMMITTED]")) {
      return { ok: true, lines: 0 };
    }

    const items = await db
      .select({
        variantId: schema.orderItems.variantId,
        quantity: schema.orderItems.quantity,
      })
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, orderId));

    let lines = 0;
    for (const item of items) {
      if (!item.variantId || item.quantity <= 0) continue;
      const [variant] = await db
        .select({ qty: schema.productVariants.seedVisibleQuantity })
        .from(schema.productVariants)
        .where(eq(schema.productVariants.id, item.variantId))
        .limit(1);
      if (!variant || variant.qty == null) continue;

      await db
        .update(schema.productVariants)
        .set({
          seedVisibleQuantity: sql`COALESCE(${schema.productVariants.seedVisibleQuantity}, 0) + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.productVariants.id, item.variantId));
      lines += 1;
    }

    await db
      .update(schema.orders)
      .set({
        orderNotes: (order.orderNotes ?? "")
          .replace(/\n?\[STOCK_COMMITTED\]/g, "")
          .trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, orderId));

    return { ok: true, lines };
  } catch (err) {
    console.error("[stock] restoreStockForOrder failed", err);
    return { ok: false, lines: 0 };
  }
}
