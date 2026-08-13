/**
 * Admin overview revenue / profit from manually verified payments.
 */
import { eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { isDatabaseConfigured } from "@/lib/env";
import { formatNpr } from "@/lib/money";

export type VerifiedRevenueStats = {
  verifiedCount: number;
  revenueNprMinor: number;
  profitNprMinor: number;
  costNprMinor: number;
  pendingCount: number;
  revenueLabel: string;
  profitLabel: string;
  costLabel: string;
};

export async function getVerifiedRevenueStats(): Promise<VerifiedRevenueStats> {
  const empty: VerifiedRevenueStats = {
    verifiedCount: 0,
    revenueNprMinor: 0,
    profitNprMinor: 0,
    costNprMinor: 0,
    pendingCount: 0,
    revenueLabel: formatNpr(0),
    profitLabel: formatNpr(0),
    costLabel: formatNpr(0),
  };

  if (!isDatabaseConfigured()) return empty;
  const db = getDb();
  if (!db) return empty;

  try {
    const payments = await db
      .select({
        id: schema.manualPaymentSubmissions.id,
        status: schema.manualPaymentSubmissions.status,
        amountMinor: schema.manualPaymentSubmissions.amountMinor,
        orderId: schema.manualPaymentSubmissions.orderId,
      })
      .from(schema.manualPaymentSubmissions);

    const verified = payments.filter((p) => p.status === "VERIFIED");
    const pending = payments.filter((p) =>
      ["SUBMITTED", "UNDER_REVIEW"].includes(String(p.status)),
    );

    const revenueNprMinor = verified.reduce(
      (sum, p) => sum + (p.amountMinor ?? 0),
      0,
    );

    let profitNprMinor = 0;
    let costNprMinor = 0;

    const orderIds = verified.map((p) => p.orderId).filter(Boolean);
    if (orderIds.length) {
      const items = await db
        .select({
          orderId: schema.orderItems.orderId,
          totalMinor: schema.orderItems.totalMinor,
          profitSnapshotMinor: schema.orderItems.profitSnapshotMinor,
          supplierCostSnapshotMinor: schema.orderItems.supplierCostSnapshotMinor,
          quantity: schema.orderItems.quantity,
        })
        .from(schema.orderItems)
        .where(inArray(schema.orderItems.orderId, orderIds));

      for (const item of items) {
        const qty = item.quantity > 0 ? item.quantity : 1;
        const unitProfit = item.profitSnapshotMinor ?? 0;
        const unitCost = item.supplierCostSnapshotMinor ?? 0;
        // Snapshots are per-unit from pricing engine
        if (item.profitSnapshotMinor != null) {
          profitNprMinor += unitProfit * qty;
        } else if (item.supplierCostSnapshotMinor != null) {
          profitNprMinor += item.totalMinor - unitCost * qty;
        }
        costNprMinor += unitCost * qty;
      }

      if (profitNprMinor === 0 && costNprMinor > 0) {
        profitNprMinor = revenueNprMinor - costNprMinor;
      }
    }

    return {
      verifiedCount: verified.length,
      revenueNprMinor,
      profitNprMinor,
      costNprMinor,
      pendingCount: pending.length,
      revenueLabel: formatNpr(revenueNprMinor),
      profitLabel: formatNpr(profitNprMinor),
      costLabel: formatNpr(costNprMinor),
    };
  } catch (err) {
    console.error("[admin] getVerifiedRevenueStats failed", err);
    return empty;
  }
}

/** Paid orders count (payment_status = PAID) for overview. */
export async function getPaidOrdersCount(): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  const db = getDb();
  if (!db) return 0;
  try {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.orders)
      .where(eq(schema.orders.paymentStatus, "PAID"));
    return Number(rows[0]?.count ?? 0);
  } catch {
    return 0;
  }
}
