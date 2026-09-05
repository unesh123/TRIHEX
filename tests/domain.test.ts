import { describe, expect, it } from "vitest";
import {
  evaluatePublication,
  isDefaultBlockedProduct,
} from "@/lib/compliance/gate";
import { ALL_SEED_PRODUCTS, SEED_SCREENSHOT_PRODUCTS, SEED_OWNED_PRODUCTS } from "@/db/seed-data";
import {
  canTransitionOrder,
  canFulfillOrder,
} from "@/lib/orders/state-machine";
import { hasPermission } from "@/lib/auth/permissions";
import {
  computeAvailableToSell,
  validateMovement,
  deriveStockState,
} from "@/lib/inventory/ledger";
import {
  reserveStockInMemory,
  getInMemoryAvailable,
  resetInMemoryInventory,
  seedInMemoryLot,
} from "@/lib/inventory/reserve";

describe("compliance gate", () => {
  it("blocks PUBLIC without APPROVED", () => {
    const d = evaluatePublication({
      complianceStatus: "DOCUMENTS_REQUIRED",
      supplyAuthorizationType: "UNKNOWN",
      vendorProofStatus: "NOT_UPLOADED",
      proofExpiryDate: null,
      productStatus: "DRAFT",
    });
    expect(d.canPublish).toBe(false);
    expect(d.canPurchase).toBe(false);
  });

  it("allows owned digital products when APPROVED", () => {
    const d = evaluatePublication({
      complianceStatus: "APPROVED",
      supplyAuthorizationType: "OWN_DIGITAL_PRODUCT",
      vendorProofStatus: "VERIFIED",
      proofExpiryDate: null,
      productStatus: "PUBLIC",
    });
    expect(d.canPublish).toBe(true);
    expect(d.canPurchase).toBe(true);
  });

  it("defaults Cursor to blocked", () => {
    const r = isDefaultBlockedProduct({
      productName: "Cursor Ultra",
      brandSlug: "cursor",
      supplyAuthorizationType: "UNKNOWN",
    });
    expect(r.blocked).toBe(true);
  });
});

describe("seed audit", () => {
  it("has screenshot, owned, and owner-added packages", () => {
    expect(SEED_SCREENSHOT_PRODUCTS).toHaveLength(28);
    expect(SEED_OWNED_PRODUCTS).toHaveLength(3);
    expect(ALL_SEED_PRODUCTS.length).toBeGreaterThanOrEqual(25);
  });

  it("has unique slugs and SKUs", () => {
    const slugs = ALL_SEED_PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const skus = ALL_SEED_PRODUCTS.flatMap((p) => p.variants.map((v) => v.sku));
    expect(new Set(skus).size).toBe(skus.length);
  });

  it("Gemini 18m sells at owner manual Rs.399", () => {
    const gem = ALL_SEED_PRODUCTS.find(
      (p) => p.slug === "gemini-pro-18-months-link",
    );
    expect(gem).toBeTruthy();
    expect(gem!.productStatus).toBe("PUBLIC");
    expect(gem!.complianceStatus).toBe("APPROVED");
    expect(gem!.variants[0]!.manualSellingPriceNprMinor).toBe(39900);
    expect(gem!.variants[0]!.purchasable).toBe(true);
  });

  it("Gemini 5TB 12M is fixed at owner price (Rs.3,699 full warranty)", () => {
    const gem = ALL_SEED_PRODUCTS.find(
      (p) => p.slug === "gemini-ai-pro-5tb-12m-mail-a",
    );
    expect(gem).toBeTruthy();
    expect(gem!.variants[0]!.manualSellingPriceNprMinor).toBe(369900);
    expect(gem!.variants[0]!.purchasable).toBe(true);
    expect(3699).toBeGreaterThan(2200);
  });

  it("duplicate Gemini Variant B is removed from live seed catalogue", () => {
    expect(
      ALL_SEED_PRODUCTS.some((p) => p.slug === "gemini-ai-pro-5tb-12m-mail-b"),
    ).toBe(false);
  });

  it("Cursor remains blocked", () => {
    const cursor = ALL_SEED_PRODUCTS.filter((p) =>
      p.slug.startsWith("cursor-"),
    );
    for (const p of cursor) {
      expect(p.productStatus).toBe("BLOCKED");
      expect(p.variants[0]!.purchasable).toBe(false);
    }
  });
});

describe("order state machine", () => {
  it("allows PAID → PROCESSING", () => {
    expect(canTransitionOrder("PAID", "PROCESSING")).toBe(true);
  });

  it("rejects unpaid fulfillment", () => {
    expect(
      canFulfillOrder({ orderStatus: "AWAITING_PAYMENT", paymentStatus: "UNPAID" }),
    ).toBe(false);
  });
});

describe("RBAC", () => {
  it("SUPPORT cannot verify payments", () => {
    expect(hasPermission("SUPPORT", "payments:review")).toBe(false);
  });

  it("FINANCE can review payments", () => {
    expect(hasPermission("FINANCE", "payments:review")).toBe(true);
  });

  it("FULFILLMENT cannot edit pricing", () => {
    expect(hasPermission("FULFILLMENT", "pricing:edit")).toBe(false);
  });
});

describe("inventory", () => {
  it("never allows negative available", () => {
    const r = validateMovement({
      beforeAvailable: 1,
      quantityDelta: -2,
      type: "RESERVE",
    });
    expect(r.ok).toBe(false);
  });

  it("derives low stock", () => {
    expect(
      deriveStockState({ availableToSell: 2, lowStockThreshold: 3 }),
    ).toBe("LOW_STOCK");
  });

  it("computes available to sell", () => {
    expect(
      computeAvailableToSell([
        {
          quantityAvailable: 5,
          quantityReserved: 0,
          quantitySold: 0,
          quantityReceived: 5,
          status: "ACTIVE",
        },
      ]),
    ).toBe(5);
  });
});

describe("concurrency reservation", () => {
  it("only one of two simultaneous reserves succeeds for qty 1", async () => {
    resetInMemoryInventory();
    seedInMemoryLot("variant-last-unit", 1);

    const results = await Promise.allSettled([
      reserveStockInMemory({
        variantId: "variant-last-unit",
        quantity: 1,
        idempotencyKey: "a",
      }),
      reserveStockInMemory({
        variantId: "variant-last-unit",
        quantity: 1,
        idempotencyKey: "b",
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(getInMemoryAvailable("variant-last-unit")).toBe(0);
  });
});
