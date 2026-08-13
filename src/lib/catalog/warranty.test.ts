import { describe, expect, it } from "vitest";
import {
  applyWarrantyPrice,
  guaranteeForPlanDays,
  warrantyOptionsForPlan,
} from "@/lib/catalog/warranty";

describe("warranty tiers", () => {
  it("gives 15-day guarantee for 1-month plans", () => {
    expect(guaranteeForPlanDays(30)).toEqual({
      days: 15,
      label: "15-day replacement guarantee",
    });
  });

  it("gives 1-month guarantee for 3-month plans", () => {
    expect(guaranteeForPlanDays(90).days).toBe(30);
  });

  it("gives 3-month guarantee for 10-month plans", () => {
    expect(guaranteeForPlanDays(300).days).toBe(90);
  });

  it("gives full year guarantee for 12-month plans", () => {
    expect(guaranteeForPlanDays(365)).toEqual({
      days: 365,
      label: "Full 1-year replacement guarantee",
    });
  });

  it("prices protected at +30% rounded to rupee", () => {
    // Rs.1000 → Rs.1300
    expect(applyWarrantyPrice(100000, "none")).toBe(100000);
    expect(applyWarrantyPrice(100000, "protected")).toBe(130000);
  });

  it("exposes both options", () => {
    const opts = warrantyOptionsForPlan(30);
    expect(opts).toHaveLength(2);
    expect(opts[0]!.tier).toBe("none");
    expect(opts[1]!.tier).toBe("protected");
    expect(opts[1]!.priceMultiplier).toBe(1.3);
  });
});
