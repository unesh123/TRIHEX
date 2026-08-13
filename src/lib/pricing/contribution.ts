/**
 * Contribution / margin preview for owner-controlled low pricing.
 * Labels: HEALTHY | LOW_MARGIN | BELOW_POLICY | ESTIMATED_LOSS
 * Never call the result "guaranteed profit."
 */

export type ContributionRisk =
  | "HEALTHY"
  | "LOW_MARGIN"
  | "BELOW_POLICY"
  | "ESTIMATED_LOSS";

export interface ContributionInput {
  sellingPriceNprMinor: number;
  supplierCostConvertedNprMinor: number;
  paymentAllowanceNprMinor: number;
  advertisingAllowanceNprMinor: number;
  operatingAllowanceNprMinor: number;
  supportAllowanceNprMinor: number;
  warrantyAllowanceNprMinor: number;
  taxAllowanceNprMinor: number;
  /** Absolute minimum contribution policy (minor units). Default 0. */
  minimumPolicyNprMinor?: number;
  /** Below this (but >= policy) → LOW_MARGIN. Default NPR 50 = 5000. */
  lowMarginThresholdNprMinor?: number;
}

export interface ContributionBreakdown {
  sellingPriceNprMinor: number;
  supplierCostConvertedNprMinor: number;
  grossDifferenceNprMinor: number;
  paymentAllowanceNprMinor: number;
  advertisingAllowanceNprMinor: number;
  operatingAllowanceNprMinor: number;
  supportAllowanceNprMinor: number;
  warrantyAllowanceNprMinor: number;
  taxAllowanceNprMinor: number;
  estimatedContributionNprMinor: number;
  risk: ContributionRisk;
  label: string;
}

export function calculateContribution(
  input: ContributionInput,
): ContributionBreakdown {
  const grossDifferenceNprMinor =
    input.sellingPriceNprMinor - input.supplierCostConvertedNprMinor;

  const estimatedContributionNprMinor =
    grossDifferenceNprMinor -
    input.paymentAllowanceNprMinor -
    input.advertisingAllowanceNprMinor -
    input.operatingAllowanceNprMinor -
    input.supportAllowanceNprMinor -
    input.warrantyAllowanceNprMinor -
    input.taxAllowanceNprMinor;

  const minPolicy = input.minimumPolicyNprMinor ?? 0;
  const lowThreshold = input.lowMarginThresholdNprMinor ?? 5000;

  let risk: ContributionRisk;
  if (estimatedContributionNprMinor < 0) {
    risk = "ESTIMATED_LOSS";
  } else if (estimatedContributionNprMinor < minPolicy) {
    risk = "BELOW_POLICY";
  } else if (estimatedContributionNprMinor < lowThreshold) {
    risk = "LOW_MARGIN";
  } else {
    risk = "HEALTHY";
  }

  const labelMap: Record<ContributionRisk, string> = {
    HEALTHY: "Healthy estimated contribution",
    LOW_MARGIN: "Low margin",
    BELOW_POLICY: "Below policy",
    ESTIMATED_LOSS: "Estimated loss",
  };

  return {
    sellingPriceNprMinor: input.sellingPriceNprMinor,
    supplierCostConvertedNprMinor: input.supplierCostConvertedNprMinor,
    grossDifferenceNprMinor,
    paymentAllowanceNprMinor: input.paymentAllowanceNprMinor,
    advertisingAllowanceNprMinor: input.advertisingAllowanceNprMinor,
    operatingAllowanceNprMinor: input.operatingAllowanceNprMinor,
    supportAllowanceNprMinor: input.supportAllowanceNprMinor,
    warrantyAllowanceNprMinor: input.warrantyAllowanceNprMinor,
    taxAllowanceNprMinor: input.taxAllowanceNprMinor,
    estimatedContributionNprMinor,
    risk,
    label: labelMap[risk],
  };
}

/**
 * Canonical NPR 300 Gemini 18-month example (minor units).
 * USD 1.80 @ NPR 160/USD = NPR 288; sell NPR 300; gross NPR 12.
 */
export const GEMINI_18M_NPR300_EXAMPLE = {
  productSlug: "gemini-pro-upgrade-link-18-months",
  supplierCostUsdMinor: 180,
  fxRateNprPerUsd: 160,
  fxRateNprMinorPerUsd: 16000,
  convertedSupplierCostNprMinor: 28800,
  manualSellingPriceNprMinor: 30000,
  grossDifferenceNprMinor: 1200,
  ownerNote: "Owner-selected low launch price",
} as const;
