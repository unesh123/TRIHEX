import { describe, it, expect } from "vitest";
import { revalidateCart } from "@/lib/commerce/revalidate-cart";
import type { ProductVariantContract } from "@/lib/commerce/catalogue-contract";

describe("Server-Side Cart Revalidation", () => {
  const liveVariants: ProductVariantContract[] = [
    {
      id: "v1",
      productId: "prod_1",
      variantId: "var_1",
      slug: "chatgpt-plus-1m",
      sku: "chatgpt-plus-1m",
      name: "ChatGPT Plus",
      variantName: "1 Month Shared",
      brandSlug: "openai",
      categorySlug: "ai-tools",
      accessType: "shared",
      activationMethod: "invite",
      durationDays: 30,
      durationLabel: "1 Month",
      warrantyPolicyCode: "LIMITED",
      warrantyDays: 20,
      availabilityStatus: "available",
      publishable: true,
      authorizationStatus: "authorized_reseller",
      supplierId: "sup_1",
      supplierCostNpr: 1400,
      supplierCostVersion: 1,
      supplierCostUsdMinor: 1000,
      sellPriceNpr: 2699,
      sellPriceNprMinor: 269900,
      compareAtNpr: null,
      priceVersion: 1,
      stock: 10,
      stockOnHand: 10,
      entitlement: {},
      mediaManifestId: null,
    },
    {
      id: "v2",
      productId: "prod_2",
      variantId: "var_2",
      slug: "manus-ai-12m",
      sku: "manus-ai-12m",
      name: "Manus AI",
      variantName: "12 Months",
      brandSlug: "manus",
      categorySlug: "ai-tools",
      accessType: "dedicated",
      activationMethod: "customer_email",
      durationDays: 365,
      durationLabel: "12 Months",
      warrantyPolicyCode: "FULL_TERM",
      warrantyDays: 365,
      availabilityStatus: "under_review",
      publishable: true,
      authorizationStatus: "unverified",
      supplierId: "sup_2",
      supplierCostNpr: 7000,
      supplierCostVersion: 1,
      supplierCostUsdMinor: 5000,
      sellPriceNpr: 9679,
      sellPriceNprMinor: 967900,
      compareAtNpr: null,
      priceVersion: 1,
      stock: 5,
      stockOnHand: 5,
      entitlement: {},
      mediaManifestId: null,
    },
  ];

  it("successfully validates available cart items", async () => {
    const result = await revalidateCart(
      [{ sku: "chatgpt-plus-1m", quantity: 2, clientPriceNprMinor: 269900 }],
      liveVariants,
    );
    expect(result.valid).toBe(true);
    expect(result.hasPriceDrift).toBe(false);
    expect(result.hasAvailabilityIssue).toBe(false);
    expect(result.subtotalNprMinor).toBe(539800);
  });

  it("detects price drift when client prices differ from authoritative DB", async () => {
    const result = await revalidateCart(
      [{ sku: "chatgpt-plus-1m", quantity: 1, clientPriceNprMinor: 199900 }],
      liveVariants,
    );
    expect(result.hasPriceDrift).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.subtotalNprMinor).toBe(269900); // authoritative DB price
  });

  it("blocks items that are under review or out of stock", async () => {
    const result = await revalidateCart(
      [{ sku: "manus-ai-12m", quantity: 1, clientPriceNprMinor: 967900 }],
      liveVariants,
    );
    expect(result.hasAvailabilityIssue).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.lines[0].error).toMatch(/availability/i);
  });
});

