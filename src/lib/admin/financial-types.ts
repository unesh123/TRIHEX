import { formatNpr } from "@/lib/money";

export interface FinancialMetricSummary {
  totalRevenueNprMinor: number;
  totalCostNprMinor: number;
  grossProfitNprMinor: number;
  profitMarginPercent: number;
  paidOrdersCount: number;
  averageOrderValueNprMinor: number;
  revenueLabel: string;
  costLabel: string;
  profitLabel: string;
  aovLabel: string;
}

export interface PaymentMethodBreakdown {
  method: string;
  label: string;
  count: number;
  totalNprMinor: number;
  percentage: number;
}

export interface TopProductPerformance {
  sku: string;
  productName: string;
  variantName: string;
  unitsSold: number;
  revenueNprMinor: number;
  profitNprMinor: number;
}

export interface DailyTimeSeriesPoint {
  date: string;
  revenueNprMinor: number;
  costNprMinor: number;
  profitNprMinor: number;
  orderCount: number;
}

export interface FullFinancialReport {
  summary: FinancialMetricSummary;
  methods: PaymentMethodBreakdown[];
  topProducts: TopProductPerformance[];
  timeSeries: DailyTimeSeriesPoint[];
  generatedAt: string;
  isLiveDb: boolean;
}

export function generatePnlCsv(report: FullFinancialReport): string {
  const lines: string[] = [];
  lines.push(`TRIHEX DIGITAL — Profit & Loss Financial Report`);
  lines.push(`Generated at,${report.generatedAt}`);
  lines.push(`Source,${report.isLiveDb ? "Postgres Live Database" : "Offline Baseline"}`);
  lines.push(``);

  lines.push(`EXECUTIVE METRICS SUMMARY`);
  lines.push(`Metric,Value (NPR)`);
  lines.push(`Total Verified Revenue,${(report.summary.totalRevenueNprMinor / 100).toFixed(2)}`);
  lines.push(`Total Supplier Cost,${(report.summary.totalCostNprMinor / 100).toFixed(2)}`);
  lines.push(`Gross Profit,${(report.summary.grossProfitNprMinor / 100).toFixed(2)}`);
  lines.push(`Gross Margin %,${report.summary.profitMarginPercent}%`);
  lines.push(`Verified Orders Count,${report.summary.paidOrdersCount}`);
  lines.push(`Average Order Value (AOV),${(report.summary.averageOrderValueNprMinor / 100).toFixed(2)}`);
  lines.push(``);

  lines.push(`PAYMENT GATEWAY & METHOD BREAKDOWN`);
  lines.push(`Method,Count,Volume (NPR),Share %`);
  for (const m of report.methods) {
    lines.push(
      `"${m.label}",${m.count},${(m.totalNprMinor / 100).toFixed(2)},${m.percentage}%`,
    );
  }
  lines.push(``);

  lines.push(`TOP PERFORMING PRODUCTS & SKUS`);
  lines.push(`SKU,Product Name,Variant,Units Sold,Revenue (NPR),Estimated Profit (NPR)`);
  for (const p of report.topProducts) {
    lines.push(
      `"${p.sku}","${p.productName}","${p.variantName}",${p.unitsSold},${(p.revenueNprMinor / 100).toFixed(2)},${(p.profitNprMinor / 100).toFixed(2)}`,
    );
  }

  return lines.join("\n");
}
