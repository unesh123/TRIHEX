import { describe, expect, it } from "vitest";
import {
  familyDisplayTitle,
  groupIntoFamilies,
  productFamilyKey,
} from "@/lib/catalog/product-families";
import type { MerchCard } from "@/lib/catalog/merchandising";

function card(partial: Partial<MerchCard> & { slug: string; title: string }): MerchCard {
  return {
    brandSlug: "capcut",
    brandName: "CapCut",
    brandFamily: "capcut",
    categorySlug: "video-editing",
    categoryName: "Video",
    categoryLabel: "Video",
    packageLabel: partial.packageLabel ?? "Plan",
    shortDescription: "",
    durationLabel: partial.durationLabel ?? null,
    activationLabel: "Email",
    fulfillmentEstimate: "Hours",
    warrantyLabel: null,
    priceNprMinor: partial.priceNprMinor ?? 10000,
    compareAtPriceNprMinor: null,
    discountPercent: null,
    showPrice: true,
    visibility: "AVAILABLE",
    purchasable: true,
    variantSku: "sku",
    featured: false,
    sourceListingText: partial.title,
    features: [],
    stockQty: 5,
    stockLabel: "5 in stock",
    ...partial,
  };
}

describe("productFamilyKey", () => {
  it("groups CapCut duration SKUs", () => {
    expect(productFamilyKey("capcut-pro-7-days")).toBe("capcut-pro");
    expect(productFamilyKey("capcut-pro-30-days")).toBe("capcut-pro");
    expect(productFamilyKey("capcut-pro-6-months")).toBe("capcut-pro");
  });

  it("groups Replit 1m and 12m", () => {
    expect(productFamilyKey("replit-core-1-month")).toBe("replit-core");
    expect(productFamilyKey("replit-core-12-months")).toBe("replit-core");
  });

  it("groups Grok Super naming variants", () => {
    expect(productFamilyKey("grok-super-3-months")).toBe("grok-super");
    expect(productFamilyKey("grok-super-6-months")).toBe("grok-super");
    expect(productFamilyKey("super-grok-6-months")).toBe("grok-super");
    expect(
      productFamilyKey("grok super — 6 months full build plan"),
    ).toBe("grok-super");
  });

  it("keeps ChatGPT Plus vs Go separate", () => {
    expect(productFamilyKey("chatgpt-plus-1-month-fw")).toBe("chatgpt-plus");
    expect(productFamilyKey("chatgpt-go-3-months-coupon")).toBe("chatgpt-go");
  });
});

describe("groupIntoFamilies", () => {
  it("collapses duration cards into one family with plans", () => {
    const families = groupIntoFamilies([
      card({
        slug: "capcut-pro-7-days",
        title: "CapCut Pro — 7 Days",
        durationLabel: "7 days",
        priceNprMinor: 4900,
      }),
      card({
        slug: "capcut-pro-30-days",
        title: "CapCut Pro — 1 Month",
        durationLabel: "30 days",
        priceNprMinor: 41900,
      }),
      card({
        slug: "capcut-pro-6-months",
        title: "CapCut Pro — 6 Months",
        durationLabel: "6 months",
        priceNprMinor: 355900,
      }),
    ]);
    expect(families).toHaveLength(1);
    expect(families[0]!.planCount).toBe(3);
    expect(families[0]!.fromPriceNprMinor).toBe(4900);
    expect(familyDisplayTitle(families[0]!.card)).toMatch(/CapCut Pro/i);
  });
});
