import { describe, it, expect } from "vitest";
import {
  canCheckout,
  assertCheckoutAllowed,
  availabilityBadgeLabel,
} from "@/lib/commerce/availability";

describe("Commerce Availability Gates", () => {
  it("permits checkout only for available status", () => {
    expect(canCheckout({ availability: "available" })).toBe(true);
    expect(canCheckout({ availability: "under_review" })).toBe(false);
    expect(canCheckout({ availability: "out_of_stock" })).toBe(false);
    expect(canCheckout({ availability: "disabled" })).toBe(false);
  });

  it("throws clear errors in assertCheckoutAllowed when unavailable", () => {
    expect(() =>
      assertCheckoutAllowed({
        publishable: true,
        availabilityStatus: "under_review",
        sku: "test-sku",
        sellPriceNpr: 1000,
      }),
    ).toThrow(/confirm availability/i);
    expect(() =>
      assertCheckoutAllowed({
        publishable: true,
        availabilityStatus: "out_of_stock",
        sku: "test-sku",
        sellPriceNpr: 1000,
      }),
    ).toThrow(/out of stock/i);
  });

  it("provides friendly badges for storefront", () => {
    expect(availabilityBadgeLabel("available").label).toBe("Ready to activate");
    expect(availabilityBadgeLabel("under_review").label).toBe(
      "Availability under review",
    );
    expect(availabilityBadgeLabel("out_of_stock").label).toBe("Out of stock");
  });
});

