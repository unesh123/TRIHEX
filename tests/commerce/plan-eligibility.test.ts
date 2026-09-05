import { describe, it, expect } from "vitest";
import { canPurchasePlan } from "@/lib/commerce/plan-eligibility";

describe("Commerce Plan Eligibility Engine (canPurchasePlan)", () => {
  it("allows standard in-stock, verified products with BUY_NOW", () => {
    const result = canPurchasePlan({
      purchasable: true,
      stockQty: 10,
      availability: "available",
      productStatus: "PUBLISHED",
    });

    expect(result.allowed).toBe(true);
    expect(result.status).toBe("available");
    expect(result.primaryAction).toBe("BUY_NOW");
    expect(result.ctaLabel).toBe("Buy Now");
  });

  it("handles out of stock products with CHECK_AVAILABILITY", () => {
    const result = canPurchasePlan({
      stockQty: 0,
      availability: "available",
    });

    expect(result.allowed).toBe(false);
    expect(result.status).toBe("out_of_stock");
    expect(result.primaryAction).toBe("CHECK_AVAILABILITY");
    expect(result.ctaLabel).toBe("Confirm Availability");
  });

  it("handles products under review or needing data verification", () => {
    const result = canPurchasePlan({
      needsDataVerification: true,
      purchasable: true,
      stockQty: 5,
    });

    expect(result.allowed).toBe(false);
    expect(result.status).toBe("under_review");
    expect(result.primaryAction).toBe("CHECK_AVAILABILITY");
  });

  it("blocks non-compliant products with UNAVAILABLE", () => {
    const result = canPurchasePlan({
      complianceStatus: "REJECTED",
      purchasable: true,
      stockQty: 10,
    });

    expect(result.allowed).toBe(false);
    expect(result.status).toBe("blocked");
    expect(result.primaryAction).toBe("UNAVAILABLE");
    expect(result.ctaLabel).toBe("Unavailable");
  });
});
