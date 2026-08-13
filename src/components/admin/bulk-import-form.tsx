"use client";

import { useMemo, useState } from "react";
import { parseImportText } from "@/lib/catalog/bulk-import";
import { DEFAULT_MARGIN_PERCENT } from "@/db/stock-pricing";

const EXAMPLE = `# Paste one product per line: Name | your buy cost
# Cost can be USD (default), USDT, or NPR
ChatGPT Plus — 1 Month | 18 USD
CapCut Pro — 1 Month | 5
Canva Pro — 1 Year | 55 USD | 35
Gemini AI Pro 5TB — 12 Months | 95
Office 365 + 1TB — Lifetime | 160 NPR
`;

export function BulkImportForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [text, setText] = useState(EXAMPLE);
  const [margin, setMargin] = useState(DEFAULT_MARGIN_PERCENT);

  const rows = useMemo(
    () => parseImportText(text, margin),
    [text, margin],
  );
  const valid = rows.filter((r) => !r.error);
  const invalid = rows.filter((r) => r.error);
  const totalProfit = valid.reduce((s, r) => s + r.profitNpr, 0);
  const totalCost = valid.reduce((s, r) => s + r.costNpr, 0);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-[var(--text-muted)]">
          Your profit margin % (on cost)
          <input
            name="marginPercent"
            type="number"
            min={0}
            max={500}
            step={1}
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-[var(--text)]">
          <input type="checkbox" name="skipDuplicates" defaultChecked />
          Skip products that already exist (by name slug)
        </label>
      </div>

      <label className="block text-xs text-[var(--text-muted)]">
        Your buying list
        <textarea
          name="lines"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-xs leading-relaxed"
          placeholder="Product name | buy cost USD"
          required
        />
      </label>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--page-soft)] p-4 text-sm">
        <p className="font-semibold text-[var(--text)]">
          Preview · FX 160 NPR/USD · margin {margin}%
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {valid.length} ready · {invalid.length} errors · total cost NPR{" "}
          {totalCost.toLocaleString("en-NP")} · est. profit NPR{" "}
          {totalProfit.toLocaleString("en-NP")}
        </p>
        <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="sticky top-0 bg-[var(--page-soft)] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Cost</th>
                <th className="px-3 py-2 font-medium">Cost NPR</th>
                <th className="px-3 py-2 font-medium">Sell NPR</th>
                <th className="px-3 py-2 font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 80).map((r, i) => (
                <tr
                  key={`${r.slug}-${i}`}
                  className={
                    r.error
                      ? "bg-[var(--danger-soft)]/40"
                      : "border-t border-[var(--border)]"
                  }
                >
                  <td className="px-3 py-1.5 font-medium text-[var(--text)]">
                    {r.name}
                    {r.error ? (
                      <span className="ml-2 text-[var(--danger)]">{r.error}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-1.5 text-[var(--text-secondary)]">
                    {r.costRaw} {r.currency}
                  </td>
                  <td className="px-3 py-1.5">{r.costNpr.toLocaleString("en-NP")}</td>
                  <td className="px-3 py-1.5 font-semibold">
                    {r.sellNpr.toLocaleString("en-NP")}
                  </td>
                  <td
                    className={
                      r.profitNpr < 0
                        ? "px-3 py-1.5 text-[var(--danger)]"
                        : "px-3 py-1.5 text-[var(--success)]"
                    }
                  >
                    {r.profitNpr.toLocaleString("en-NP")} ({r.profitPercent}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
      >
        Import as Check Availability products
      </button>
      <p className="text-xs text-[var(--text-muted)]">
        Imported products appear on the shop as <strong>Under Review</strong> with
        a WhatsApp <strong>Check Availability / Inquire</strong> button — not Buy
        Now. Customers message you; you confirm stock, take payment, then deliver
        on WhatsApp.
      </p>
    </form>
  );
}
