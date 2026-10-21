"use client";

import { useState, useTransition } from "react";
import {
  Download,
  DollarSign,
  TrendingUp,
  Percent,
  CreditCard,
  Package,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNpr } from "@/lib/money";
import type { FullFinancialReport } from "@/lib/admin/financial-types";
import { generatePnlCsv } from "@/lib/admin/financial-types";

interface FinancialReportDashboardProps {
  initialReport: FullFinancialReport;
}

export function FinancialReportDashboard({
  initialReport,
}: FinancialReportDashboardProps) {
  const [report] = useState<FullFinancialReport>(initialReport);
  const [isExporting, startExport] = useTransition();

  const handleExportCsv = () => {
    startExport(() => {
      const csv = generatePnlCsv(report);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `trihex-pnl-report-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const { summary, methods, topProducts } = report;

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[var(--border)] bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Revenue Truth
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Financial &amp; P&amp;L Performance Ledger
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Computed exclusively from manually verified bank &amp; wallet payments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-950/40"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Generating CSV..." : "Export P&L to CSV"}
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summary.revenueLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            From {summary.paidOrdersCount} approved orders
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Supplier Cost
            </span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summary.costLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Inventory &amp; activation cost (NPR equivalent)
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Net Gross Profit
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600">
            {summary.profitLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Realized cash margin after supplier cost
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Profit Margin
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summary.profitMarginPercent}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            AOV: {summary.aovLabel}
          </p>
        </div>
      </div>

      {/* Two Column Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment Methods */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <CreditCard className="h-4 w-4 text-indigo-600" /> Payment Methods Share
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Volume distribution across Nepal payment gateways
          </p>

          <div className="mt-6 space-y-4">
            {methods.map((m) => (
              <div key={m.method} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{m.label}</span>
                  <span className="text-slate-500">
                    {formatNpr(m.totalNprMinor)} ({m.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.max(m.percentage, 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  {m.count} confirmed {m.count === 1 ? "order" : "orders"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing SKUs */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                <Package className="h-4 w-4 text-indigo-600" /> Top Revenue Products
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Best-performing subscriptions by gross sales
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            {topProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                No verified sales recorded in this interval.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-medium uppercase text-slate-400">
                    <th className="pb-3">Product / SKU</th>
                    <th className="pb-3 text-center">Units Sold</th>
                    <th className="pb-3 text-right">Revenue</th>
                    <th className="pb-3 text-right">Est. Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((p) => (
                    <tr key={p.sku} className="hover:bg-slate-50/50">
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-slate-900">{p.productName}</div>
                        <div className="text-xs text-slate-400 font-mono">{p.sku}</div>
                      </td>
                      <td className="py-3.5 text-center font-medium text-slate-700">
                        {p.unitsSold}
                      </td>
                      <td className="py-3.5 text-right font-medium text-slate-900">
                        {formatNpr(p.revenueNprMinor)}
                      </td>
                      <td className="py-3.5 text-right font-medium text-emerald-600">
                        {formatNpr(p.profitNprMinor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
