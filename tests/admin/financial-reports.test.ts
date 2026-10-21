import { describe, it, expect } from "vitest";
import {
  generatePnlCsv,
  type FullFinancialReport,
} from "@/lib/admin/financial-types";

describe("Financial & P&L Reporting Engine", () => {
  const mockReport: FullFinancialReport = {
    summary: {
      totalRevenueNprMinor: 159900,
      totalCostNprMinor: 95000,
      grossProfitNprMinor: 64900,
      profitMarginPercent: 41,
      paidOrdersCount: 2,
      averageOrderValueNprMinor: 79950,
      revenueLabel: "Rs. 1,599",
      costLabel: "Rs. 950",
      profitLabel: "Rs. 649",
      aovLabel: "Rs. 799.50",
    },
    methods: [
      {
        method: "BANK_TRANSFER",
        label: "Bank Transfer (QR)",
        count: 1,
        totalNprMinor: 99900,
        percentage: 62,
      },
      {
        method: "ESEWA_MANUAL",
        label: "eSewa Direct",
        count: 1,
        totalNprMinor: 60000,
        percentage: 38,
      },
    ],
    topProducts: [
      {
        sku: "GEMINI-PRO-18M",
        productName: "Gemini Advanced 18 Months",
        variantName: "18 Months Private Link",
        unitsSold: 1,
        revenueNprMinor: 99900,
        profitNprMinor: 40000,
      },
    ],
    timeSeries: [
      {
        date: "2026-10-16",
        revenueNprMinor: 159900,
        costNprMinor: 95000,
        profitNprMinor: 64900,
        orderCount: 2,
      },
    ],
    generatedAt: "2026-10-16T12:00:00Z",
    isLiveDb: true,
  };

  it("generates structured, RFC-compliant CSV text with all key sections", () => {
    const csv = generatePnlCsv(mockReport);

    expect(csv).toContain("TRIHEX DIGITAL — Profit & Loss Financial Report");
    expect(csv).toContain("EXECUTIVE METRICS SUMMARY");
    expect(csv).toContain("Total Verified Revenue,1599.00");
    expect(csv).toContain("Total Supplier Cost,950.00");
    expect(csv).toContain("Gross Profit,649.00");
    expect(csv).toContain("Gross Margin %,41%");
    expect(csv).toContain("PAYMENT GATEWAY & METHOD BREAKDOWN");
    expect(csv).toContain('"Bank Transfer (QR)",1,999.00,62%');
    expect(csv).toContain('"eSewa Direct",1,600.00,38%');
    expect(csv).toContain("TOP PERFORMING PRODUCTS & SKUS");
    expect(csv).toContain('"GEMINI-PRO-18M","Gemini Advanced 18 Months"');
  });

  it("handles empty or zero report gracefully without throwing NaN", () => {
    const emptyReport: FullFinancialReport = {
      summary: {
        totalRevenueNprMinor: 0,
        totalCostNprMinor: 0,
        grossProfitNprMinor: 0,
        profitMarginPercent: 0,
        paidOrdersCount: 0,
        averageOrderValueNprMinor: 0,
        revenueLabel: "Rs. 0",
        costLabel: "Rs. 0",
        profitLabel: "Rs. 0",
        aovLabel: "Rs. 0",
      },
      methods: [],
      topProducts: [],
      timeSeries: [],
      generatedAt: "2026-10-16T12:00:00Z",
      isLiveDb: false,
    };

    const csv = generatePnlCsv(emptyReport);
    expect(csv).toContain("Total Verified Revenue,0.00");
    expect(csv).toContain("Gross Margin %,0%");
  });
});
