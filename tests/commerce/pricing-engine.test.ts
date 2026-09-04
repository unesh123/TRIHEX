import { describe, it, expect } from "vitest";
import {
  roundCommercialNpr,
  calculateSellPrice,
  validateCompareAt,
} from "@/lib/commerce/pricing-engine";

describe("Commerce Pricing Engine", () => {
  it("rounds commercial NPR to clean psychology endings", () => {
    expect(roundCommercialNpr(250)).toBe(249);
    expect(roundCommercialNpr(1450)).toBe(1499);
    expect(roundCommercialNpr(2650)).toBe(2699);
  });

  it("enforces target gross margin in calculateSellPrice", () => {
    const result = calculateSellPrice({
      supplierCostNpr: 1000,
      targetGrossMarginRate: 0.25,
    });
    expect(result.sellPriceNpr).toBeGreaterThan(result.landedCostNpr);
    expect(result.grossMarginRate).toBeGreaterThanOrEqual(0.20);
    expect(result.markupMultiple).toBeGreaterThan(1);
  });

  it("validates compare-at prices to prevent deceptive discounts", () => {
    expect(() => validateCompareAt(2000, 1500)).toThrow(/compareAt must exceed sell price/);
    expect(() => validateCompareAt(1500, 2500)).not.toThrow();
  });
});


