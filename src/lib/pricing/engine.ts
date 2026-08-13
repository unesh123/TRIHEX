/**
 * Deterministic pricing engine for TRIHEX DIGITAL.
 * All amounts are integer minor units. FX rate is owner-controlled.
 */

import {
  applyBasisPoints,
  applyPsychologicalRounding,
  convertUsdToNpr,
  type RoundingMode,
} from "@/lib/money";

export type PricingMode = "MANUAL_ONLY" | "FORMULA_WITH_OVERRIDE" | "FORMULA_ONLY";

export interface PricingInput {
  supplierCostMinor: number;
  supplierCurrency: "USD" | "NPR";
  /** NPR minor units per 1 USD (e.g. 13550 for 135.50 NPR/USD) */
  fxRateNprMinorPerUsd: number;
  gatewayFeeBasisPoints: number;
  fixedOperationalCostNprMinor: number;
  riskReserveBasisPoints: number;
  warrantyReserveNprMinor: number;
  minimumProfitNprMinor: number;
  /** e.g. 2500 = 25% target margin */
  targetMarginBasisPoints: number;
  roundingMode: RoundingMode;
  pricingMode: PricingMode;
  manualSellingPriceNprMinor: number | null;
  /** Optional duration risk multiplier in basis points added to risk reserve */
  durationRiskBonusBasisPoints?: number;
}

export interface PricingBreakdown {
  supplierCostOriginalMinor: number;
  supplierCurrency: "USD" | "NPR";
  fxRateNprMinorPerUsd: number;
  supplierCostConvertedNprMinor: number;
  gatewayCostEstimateNprMinor: number;
  fixedOperationalCostNprMinor: number;
  warrantyReserveNprMinor: number;
  riskReserveNprMinor: number;
  landedCostNprMinor: number;
  candidateByProfitNprMinor: number;
  candidateByMarginNprMinor: number;
  preRoundSellingPriceNprMinor: number;
  finalPriceNprMinor: number;
  profitAmountNprMinor: number;
  profitBasisPoints: number;
  usedManualOverride: boolean;
  belowLandedCost: boolean;
  belowMinimumProfit: boolean;
  alerts: string[];
}

/**
 * Base formula:
 * landedCostNpr = supplierCostConvertedNpr + gatewayCostEstimate + fixedOperationalCost + warrantyReserve + riskReserve
 * candidateByProfit = landedCostNpr + minimumProfitNpr
 * candidateByMargin = ceil(landedCostNpr / (1 - targetMarginRate))
 * preRound = max(candidateByProfit, candidateByMargin)
 * final = round(preRound)
 */
export function calculatePrice(input: PricingInput): PricingBreakdown {
  const alerts: string[] = [];

  const supplierCostConvertedNprMinor =
    input.supplierCurrency === "USD"
      ? convertUsdToNpr(input.supplierCostMinor, input.fxRateNprMinorPerUsd).amountMinor
      : input.supplierCostMinor;

  const riskBp =
    input.riskReserveBasisPoints + (input.durationRiskBonusBasisPoints ?? 0);
  const riskReserveNprMinor = applyBasisPoints(supplierCostConvertedNprMinor, riskBp);

  // Gateway fee is estimated on a provisional selling price; iterate once for stability
  const provisionalLanded =
    supplierCostConvertedNprMinor +
    input.fixedOperationalCostNprMinor +
    input.warrantyReserveNprMinor +
    riskReserveNprMinor;

  const provisionalByMargin =
    input.targetMarginBasisPoints >= 10000
      ? provisionalLanded * 2
      : Math.ceil(
          (provisionalLanded * 10000) / (10000 - input.targetMarginBasisPoints),
        );

  const provisionalSell = Math.max(
    provisionalLanded + input.minimumProfitNprMinor,
    provisionalByMargin,
  );

  const gatewayCostEstimateNprMinor = applyBasisPoints(
    provisionalSell,
    input.gatewayFeeBasisPoints,
  );

  const landedCostNprMinor =
    supplierCostConvertedNprMinor +
    gatewayCostEstimateNprMinor +
    input.fixedOperationalCostNprMinor +
    input.warrantyReserveNprMinor +
    riskReserveNprMinor;

  const candidateByProfitNprMinor = landedCostNprMinor + input.minimumProfitNprMinor;

  const candidateByMarginNprMinor =
    input.targetMarginBasisPoints >= 10000
      ? landedCostNprMinor * 2
      : Math.ceil(
          (landedCostNprMinor * 10000) / (10000 - input.targetMarginBasisPoints),
        );

  const preRoundSellingPriceNprMinor = Math.max(
    candidateByProfitNprMinor,
    candidateByMarginNprMinor,
  );

  const formulaPrice = applyPsychologicalRounding(
    preRoundSellingPriceNprMinor,
    input.roundingMode,
  );

  let usedManualOverride = false;
  let finalPriceNprMinor = formulaPrice;

  if (input.pricingMode === "MANUAL_ONLY") {
    if (input.manualSellingPriceNprMinor == null) {
      throw new Error("MANUAL_ONLY pricing requires manualSellingPriceNprMinor");
    }
    finalPriceNprMinor = input.manualSellingPriceNprMinor;
    usedManualOverride = true;
  } else if (
    input.pricingMode === "FORMULA_WITH_OVERRIDE" &&
    input.manualSellingPriceNprMinor != null
  ) {
    finalPriceNprMinor = input.manualSellingPriceNprMinor;
    usedManualOverride = true;
  } else {
    finalPriceNprMinor = formulaPrice;
  }

  const profitAmountNprMinor = finalPriceNprMinor - landedCostNprMinor;
  const profitBasisPoints =
    finalPriceNprMinor === 0
      ? 0
      : Math.floor((profitAmountNprMinor * 10000) / finalPriceNprMinor);

  const belowLandedCost = finalPriceNprMinor < landedCostNprMinor;
  const belowMinimumProfit =
    profitAmountNprMinor < input.minimumProfitNprMinor;

  if (belowLandedCost) {
    alerts.push("Manual price is below landed cost — product would be loss-making.");
  }
  if (belowMinimumProfit) {
    alerts.push(
      "Price is below configured minimum-profit policy after fees and reserves.",
    );
  }

  return {
    supplierCostOriginalMinor: input.supplierCostMinor,
    supplierCurrency: input.supplierCurrency,
    fxRateNprMinorPerUsd: input.fxRateNprMinorPerUsd,
    supplierCostConvertedNprMinor,
    gatewayCostEstimateNprMinor,
    fixedOperationalCostNprMinor: input.fixedOperationalCostNprMinor,
    warrantyReserveNprMinor: input.warrantyReserveNprMinor,
    riskReserveNprMinor,
    landedCostNprMinor,
    candidateByProfitNprMinor,
    candidateByMarginNprMinor,
    preRoundSellingPriceNprMinor,
    finalPriceNprMinor,
    profitAmountNprMinor,
    profitBasisPoints,
    usedManualOverride,
    belowLandedCost,
    belowMinimumProfit,
    alerts,
  };
}
