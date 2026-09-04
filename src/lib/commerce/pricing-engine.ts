export interface PricingInput {
  supplierCostNpr: number;
  paymentFeeRate?: number;
  fxBufferRate?: number;
  supportReserveNpr?: number;
  replacementRiskRate?: number;
  targetGrossMarginRate: number;
}

export interface PriceBreakdown {
  landedCostNpr: number;
  rawSellNpr: number;
  sellPriceNpr: number;
  grossMarginRate: number;
  markupMultiple: number;
}

export function roundCommercialNpr(value: number): number {
  if (value <= 0) throw new Error("Price must be positive");
  if (value < 1000) {
    return Math.ceil(value / 10) * 10 - 1; // e.g. 299, 799, 999
  }
  return Math.ceil((value + 1) / 100) * 100 - 1; // e.g. 1499, 2999, 6999
}

export function calculateSellPrice(input: PricingInput): PriceBreakdown {
  if (input.supplierCostNpr <= 0) {
    throw new Error("Supplier cost must be positive");
  }
  const fee = input.supplierCostNpr * (input.paymentFeeRate ?? 0.025);
  const fx = input.supplierCostNpr * (input.fxBufferRate ?? 0.05);
  const risk = input.supplierCostNpr * (input.replacementRiskRate ?? 0);
  const landed = input.supplierCostNpr + fee + fx + risk + (input.supportReserveNpr ?? 0);

  if (input.targetGrossMarginRate <= 0 || input.targetGrossMarginRate >= 0.85) {
    throw new Error("Target gross margin must be between 0 and 0.85");
  }

  const raw = landed / (1 - input.targetGrossMarginRate);
  const sell = roundCommercialNpr(raw);
  const grossMargin = (sell - landed) / sell;

  return {
    landedCostNpr: Math.round(landed),
    rawSellNpr: Math.round(raw),
    sellPriceNpr: sell,
    grossMarginRate: grossMargin,
    markupMultiple: sell / input.supplierCostNpr,
  };
}

export function validateCompareAt(sell: number, compareAt: number | null): void {
  if (compareAt !== null && compareAt <= sell) {
    throw new Error("compareAt must exceed sell price");
  }
}
