import { describe, expect, it } from "vitest";
import {
  calculateContribution,
  GEMINI_18M_NPR300_EXAMPLE,
} from "@/lib/pricing/contribution";
import { calculatePrice } from "@/lib/pricing/engine";

describe("NPR 300 Gemini contribution example", () => {
  it("has USD 1.80, FX 160, cost NPR 288, sell NPR 300, gross NPR 12", () => {
    expect(GEMINI_18M_NPR300_EXAMPLE.supplierCostUsdMinor).toBe(180);
    expect(GEMINI_18M_NPR300_EXAMPLE.fxRateNprPerUsd).toBe(160);
    expect(GEMINI_18M_NPR300_EXAMPLE.convertedSupplierCostNprMinor).toBe(28800);
    expect(GEMINI_18M_NPR300_EXAMPLE.manualSellingPriceNprMinor).toBe(30000);
    expect(GEMINI_18M_NPR300_EXAMPLE.grossDifferenceNprMinor).toBe(1200);
  });

  it("shows LOW_MARGIN when organic sale with zero allowances", () => {
    const result = calculateContribution({
      sellingPriceNprMinor: 30000,
      supplierCostConvertedNprMinor: 28800,
      paymentAllowanceNprMinor: 0,
      advertisingAllowanceNprMinor: 0,
      operatingAllowanceNprMinor: 0,
      supportAllowanceNprMinor: 0,
      warrantyAllowanceNprMinor: 0,
      taxAllowanceNprMinor: 0,
      minimumPolicyNprMinor: 5000,
      lowMarginThresholdNprMinor: 5000,
    });
    expect(result.grossDifferenceNprMinor).toBe(1200);
    expect(result.estimatedContributionNprMinor).toBe(1200);
    expect(result.risk).toBe("BELOW_POLICY");
  });

  it("shows ESTIMATED_LOSS when allowances exceed gross", () => {
    const result = calculateContribution({
      sellingPriceNprMinor: 30000,
      supplierCostConvertedNprMinor: 28800,
      paymentAllowanceNprMinor: 500,
      advertisingAllowanceNprMinor: 1000,
      operatingAllowanceNprMinor: 500,
      supportAllowanceNprMinor: 0,
      warrantyAllowanceNprMinor: 0,
      taxAllowanceNprMinor: 0,
    });
    expect(result.estimatedContributionNprMinor).toBe(-800);
    expect(result.risk).toBe("ESTIMATED_LOSS");
  });
});

describe("pricing engine manual mode", () => {
  it("retains manual selling price", () => {
    const breakdown = calculatePrice({
      supplierCostMinor: 180,
      supplierCurrency: "USD",
      fxRateNprMinorPerUsd: 16000,
      gatewayFeeBasisPoints: 0,
      fixedOperationalCostNprMinor: 0,
      riskReserveBasisPoints: 0,
      warrantyReserveNprMinor: 0,
      minimumProfitNprMinor: 0,
      targetMarginBasisPoints: 0,
      roundingMode: "NO_ROUNDING",
      pricingMode: "MANUAL_ONLY",
      manualSellingPriceNprMinor: 30000,
    });
    expect(breakdown.finalPriceNprMinor).toBe(30000);
    expect(breakdown.supplierCostConvertedNprMinor).toBe(28800);
    expect(breakdown.usedManualOverride).toBe(true);
  });
});
