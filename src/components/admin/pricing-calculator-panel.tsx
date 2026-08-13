"use client";

import { useMemo, useState } from "react";
import { ContributionPanel } from "@/components/admin/contribution-panel";
import { Input } from "@/components/ui/input";
import {
  calculateContribution,
  GEMINI_18M_NPR300_EXAMPLE,
} from "@/lib/pricing/contribution";
import { formatNpr } from "@/lib/money";

export function PricingCalculatorPanel() {
  const [fxMajor, setFxMajor] = useState(
    String(GEMINI_18M_NPR300_EXAMPLE.fxRateNprPerUsd),
  );
  const [sellMajor, setSellMajor] = useState("300");

  const breakdown = useMemo(() => {
    const fx = Math.round(Number.parseFloat(fxMajor || "0") * 100);
    const sell = Math.round(Number.parseFloat(sellMajor || "0") * 100);
    const supplierNpr = Math.floor(
      (GEMINI_18M_NPR300_EXAMPLE.supplierCostUsdMinor * fx) / 100,
    );

    return calculateContribution({
      sellingPriceNprMinor: sell,
      supplierCostConvertedNprMinor: supplierNpr,
      paymentAllowanceNprMinor: 0,
      advertisingAllowanceNprMinor: 0,
      operatingAllowanceNprMinor: 0,
      supportAllowanceNprMinor: 0,
      warrantyAllowanceNprMinor: 0,
      taxAllowanceNprMinor: 0,
      minimumPolicyNprMinor: 0,
    });
  }, [fxMajor, sellMajor]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-text-muted">
            FX rate (NPR per USD)
          </label>
          <Input
            type="number"
            step="0.01"
            value={fxMajor}
            onChange={(e) => setFxMajor(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-muted">
            Manual sell price (NPR)
          </label>
          <Input
            type="number"
            step="1"
            value={sellMajor}
            onChange={(e) => setSellMajor(e.target.value)}
          />
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Supplier cost fixed at USD 1.80 (
        {formatNpr(
          Math.floor(
            (GEMINI_18M_NPR300_EXAMPLE.supplierCostUsdMinor *
              Math.round(Number.parseFloat(fxMajor || "0") * 100)) /
              100,
          ),
        )}{" "}
        converted at current FX).
      </p>

      <ContributionPanel
        breakdown={breakdown}
        ownerNote={GEMINI_18M_NPR300_EXAMPLE.ownerNote}
      />
    </div>
  );
}
