import "server-only";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { isDatabaseConfigured } from "@/lib/env";
import { formatNpr } from "@/lib/money";
import type {
  FullFinancialReport,
  PaymentMethodBreakdown,
  TopProductPerformance,
  DailyTimeSeriesPoint,
} from "./financial-types";

export async function getFinancialReportData(options?: {
  days?: number;
}): Promise<FullFinancialReport> {
  const now = new Date();
  const daysLimit = options?.days ?? 30;
  const cutoffDate = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);

  const fallback: FullFinancialReport = {
    summary: {
      totalRevenueNprMinor: 0,
      totalCostNprMinor: 0,
      grossProfitNprMinor: 0,
      profitMarginPercent: 0,
      paidOrdersCount: 0,
      averageOrderValueNprMinor: 0,
      revenueLabel: formatNpr(0),
      costLabel: formatNpr(0),
      profitLabel: formatNpr(0),
      aovLabel: formatNpr(0),
    },
    methods: [
      { method: "BANK_TRANSFER", label: "Bank Transfer (QR)", count: 0, totalNprMinor: 0, percentage: 0 },
      { method: "ESEWA_MANUAL", label: "eSewa Direct", count: 0, totalNprMinor: 0, percentage: 0 },
      { method: "KHALTI_MANUAL", label: "Khalti Wallet", count: 0, totalNprMinor: 0, percentage: 0 },
    ],
    topProducts: [],
    timeSeries: [],
    generatedAt: now.toISOString(),
    isLiveDb: false,
  };

  if (!isDatabaseConfigured()) return fallback;
  const db = getDb();
  if (!db) return fallback;

  try {
    const verifiedPayments = await db
      .select({
        id: schema.manualPaymentSubmissions.id,
        orderId: schema.manualPaymentSubmissions.orderId,
        method: schema.manualPaymentSubmissions.method,
        amountMinor: schema.manualPaymentSubmissions.amountMinor,
        status: schema.manualPaymentSubmissions.status,
        reviewedAt: schema.manualPaymentSubmissions.reviewedAt,
        createdAt: schema.manualPaymentSubmissions.createdAt,
      })
      .from(schema.manualPaymentSubmissions)
      .where(eq(schema.manualPaymentSubmissions.status, "VERIFIED"));

    const filteredPayments = verifiedPayments.filter((p) => {
      const date = p.reviewedAt ?? p.createdAt;
      return daysLimit >= 9999 || new Date(date).getTime() >= cutoffDate.getTime();
    });

    const totalRevenueNprMinor = filteredPayments.reduce(
      (acc, p) => acc + (p.amountMinor ?? 0),
      0,
    );
    const paidOrdersCount = filteredPayments.length;
    const averageOrderValueNprMinor =
      paidOrdersCount > 0 ? Math.round(totalRevenueNprMinor / paidOrdersCount) : 0;

    // Payment methods aggregation
    const methodCounts: Record<string, { count: number; total: number }> = {
      BANK_TRANSFER: { count: 0, total: 0 },
      ESEWA_MANUAL: { count: 0, total: 0 },
      KHALTI_MANUAL: { count: 0, total: 0 },
    };

    for (const p of filteredPayments) {
      const m = String(p.method ?? "BANK_TRANSFER");
      if (!methodCounts[m]) methodCounts[m] = { count: 0, total: 0 };
      methodCounts[m].count += 1;
      methodCounts[m].total += p.amountMinor ?? 0;
    }

    const methodLabels: Record<string, string> = {
      BANK_TRANSFER: "Bank Transfer (QR)",
      ESEWA_MANUAL: "eSewa Direct",
      KHALTI_MANUAL: "Khalti Wallet",
    };

    const methods: PaymentMethodBreakdown[] = Object.entries(methodCounts).map(
      ([m, data]) => ({
        method: m,
        label: methodLabels[m] ?? m,
        count: data.count,
        totalNprMinor: data.total,
        percentage:
          totalRevenueNprMinor > 0
            ? Math.round((data.total / totalRevenueNprMinor) * 100)
            : 0,
      }),
    );

    // Order items & profit calculation
    let totalCostNprMinor = 0;
    let grossProfitNprMinor = 0;
    const productStats: Record<
      string,
      { productName: string; variantName: string; units: number; revenue: number; profit: number }
    > = {};

    const orderIds = filteredPayments.map((p) => p.orderId).filter(Boolean);
    if (orderIds.length > 0) {
      const items = await db
        .select({
          orderId: schema.orderItems.orderId,
          sku: schema.orderItems.sku,
          productName: schema.orderItems.productName,
          variantName: schema.orderItems.variantName,
          quantity: schema.orderItems.quantity,
          totalMinor: schema.orderItems.totalMinor,
          supplierCostSnapshotMinor: schema.orderItems.supplierCostSnapshotMinor,
          profitSnapshotMinor: schema.orderItems.profitSnapshotMinor,
        })
        .from(schema.orderItems)
        .where(inArray(schema.orderItems.orderId, orderIds));

      for (const item of items) {
        const qty = item.quantity > 0 ? item.quantity : 1;
        const unitCost = item.supplierCostSnapshotMinor ?? 0;
        const lineCost = unitCost * qty;
        totalCostNprMinor += lineCost;

        let lineProfit = 0;
        if (item.profitSnapshotMinor != null) {
          lineProfit = (item.profitSnapshotMinor ?? 0) * qty;
        } else {
          lineProfit = item.totalMinor - lineCost;
        }
        grossProfitNprMinor += lineProfit;

        const key = item.sku || item.productName;
        if (!productStats[key]) {
          productStats[key] = {
            productName: item.productName,
            variantName: item.variantName,
            units: 0,
            revenue: 0,
            profit: 0,
          };
        }
        productStats[key].units += qty;
        productStats[key].revenue += item.totalMinor;
        productStats[key].profit += lineProfit;
      }
    }

    if (grossProfitNprMinor === 0 && totalCostNprMinor > 0) {
      grossProfitNprMinor = totalRevenueNprMinor - totalCostNprMinor;
    }

    const profitMarginPercent =
      totalRevenueNprMinor > 0
        ? Math.round((grossProfitNprMinor / totalRevenueNprMinor) * 100)
        : 0;

    const topProducts: TopProductPerformance[] = Object.entries(productStats)
      .map(([sku, data]) => ({
        sku,
        productName: data.productName,
        variantName: data.variantName,
        unitsSold: data.units,
        revenueNprMinor: data.revenue,
        profitNprMinor: data.profit,
      }))
      .sort((a, b) => b.revenueNprMinor - a.revenueNprMinor)
      .slice(0, 10);

    // Time series (group by YYYY-MM-DD)
    const timeMap: Record<string, DailyTimeSeriesPoint> = {};
    for (const p of filteredPayments) {
      const d = new Date(p.reviewedAt ?? p.createdAt).toISOString().split("T")[0];
      if (!timeMap[d]) {
        timeMap[d] = {
          date: d,
          revenueNprMinor: 0,
          costNprMinor: 0,
          profitNprMinor: 0,
          orderCount: 0,
        };
      }
      timeMap[d].revenueNprMinor += p.amountMinor ?? 0;
      timeMap[d].orderCount += 1;
    }

    const timeSeries = Object.values(timeMap).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return {
      summary: {
        totalRevenueNprMinor,
        totalCostNprMinor,
        grossProfitNprMinor,
        profitMarginPercent,
        paidOrdersCount,
        averageOrderValueNprMinor,
        revenueLabel: formatNpr(totalRevenueNprMinor),
        costLabel: formatNpr(totalCostNprMinor),
        profitLabel: formatNpr(grossProfitNprMinor),
        aovLabel: formatNpr(averageOrderValueNprMinor),
      },
      methods,
      topProducts,
      timeSeries,
      generatedAt: now.toISOString(),
      isLiveDb: true,
    };
  } catch (err) {
    console.error("[financial-reports] Failed to compute metrics:", err);
    return fallback;
  }
}
