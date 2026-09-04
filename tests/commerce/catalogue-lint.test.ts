import { describe, it, expect } from "vitest";
import { isInternalOrTestSku, lintVariant } from "@/lib/commerce/catalogue-lint";

describe("Catalogue Lint & Test SKU Gate", () => {
  it("identifies internal and test SKUs", () => {
    expect(isInternalOrTestSku("trihex-test-sku")).toBe(true);
    expect(isInternalOrTestSku("concurrency-test-product")).toBe(true);
    expect(isInternalOrTestSku("test-item")).toBe(true);
    expect(isInternalOrTestSku("item-test")).toBe(true);
    expect(isInternalOrTestSku("chatgpt-plus-1m")).toBe(false);
    expect(isInternalOrTestSku("cursor-pro-12m")).toBe(false);
  });

  it("flags test SKUs in lintVariant", () => {
    const issues = lintVariant({
      sku: "trihex-test-sku",
      name: "Test Product",
      variantName: "1 Month",
      sellPriceNprMinor: 100000,
      costNprMinor: 50000,
      supplierSnapshotPresent: true,
      unverifiedOfficialClaim: false,
    });
    expect(issues.some((i) => i.code === "INTERNAL_TEST_SKU")).toBe(true);
  });

  it("flags unverified official affiliation claims", () => {
    const issues = lintVariant({
      sku: "chatgpt-plus-1m",
      name: "Official ChatGPT Plus Authorized Reseller",
      variantName: "1 Month",
      sellPriceNprMinor: 100000,
      costNprMinor: 50000,
      supplierSnapshotPresent: true,
      unverifiedOfficialClaim: true,
    });
    expect(issues.some((i) => i.code === "UNVERIFIED_AFFILIATION_CLAIM")).toBe(
      true,
    );
  });
});

