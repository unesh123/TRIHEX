import { describe, it, expect } from "vitest";
import {
  VAULT_ITEMS,
  getVaultItemBySlug,
  getVaultItemsByCategory,
  calculatePurchasingPower,
  HISTORICAL_CPI_DATA,
} from "@/lib/catalog/vault-items";
import { getMerchCardBySlug } from "@/lib/catalog/merchandising";
import fs from "fs";
import path from "path";

describe("TRIHEX Classified Vault & Developer Loots", () => {
  it("contains structured items with unique IDs and slugs", () => {
    expect(VAULT_ITEMS.length).toBeGreaterThanOrEqual(8);
    const slugs = VAULT_ITEMS.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const ids = VAULT_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("paid vault products have server secret refs and zero leaked plaintext keys", () => {
    const paid = VAULT_ITEMS.filter((i) => i.type === "PAID_BUNDLE");
    expect(paid.length).toBeGreaterThanOrEqual(4);

    for (const item of paid) {
      expect(item.priceNpr).toBeGreaterThan(0);
      expect(item.fulfillmentSecretId).toBeTruthy();
      expect((item as unknown as Record<string, unknown>).decryptionKey).toBeUndefined();
      expect(item.deliverable).toBeTruthy();
      expect(item.highlights.length).toBeGreaterThanOrEqual(3);
    }

    // Explicitly verify the AI Money Maker product has NO plaintext decryption key in catalog
    const aiMoneyMaker = getVaultItemBySlug("ai-money-maker-digital-course-2026");
    expect(aiMoneyMaker).toBeDefined();
    expect((aiMoneyMaker as unknown as Record<string, unknown>)?.decryptionKey).toBeUndefined();
    expect(aiMoneyMaker?.fulfillmentSecretId).toBe("sec-vault-aimoney-2026");
    expect(aiMoneyMaker?.priceNpr).toBe(499);
  });

  it("paid vault products are active and purchasable in the customer merchandising catalog", () => {
    const aiMoneyMakerCard = getMerchCardBySlug("ai-money-maker-digital-course-2026");
    expect(aiMoneyMakerCard).toBeDefined();
    expect(aiMoneyMakerCard?.purchasable).toBe(true);
    expect(aiMoneyMakerCard?.priceNprMinor).toBe(49900);

    const psychCard = getMerchCardBySlug("the-psychology-of-closing-bundle");
    expect(psychCard).toBeDefined();
    expect(psychCard?.purchasable).toBe(true);
    expect(psychCard?.priceNprMinor).toBe(39900);

    const passiveCard = getMerchCardBySlug("the-passive-rebel-antisocial-leads");
    expect(passiveCard).toBeDefined();
    expect(passiveCard?.purchasable).toBe(true);
    expect(passiveCard?.priceNprMinor).toBe(39900);
  });

  it("free developer perks and public legal records have verified URLs and badges", () => {
    const perks = getVaultItemsByCategory("developer-perks");
    expect(perks.length).toBeGreaterThanOrEqual(4);
    for (const perk of perks) {
      expect(perk.priceNpr).toBe(0);
      expect(perk.securityLevel).toBe("UNLOCKED");
      expect(perk.downloadUrl).toMatch(/^https?:\/\//);
    }

    const publicRecords = getVaultItemsByCategory("public-records");
    expect(publicRecords.length).toBeGreaterThanOrEqual(1);
    const epsteinDocket = publicRecords.find((r) => r.slug === "doj-epstein-unsealed-court-records");
    expect(epsteinDocket).toBeDefined();
    expect(epsteinDocket?.sourceCitation).toContain("Docket 15-cv-07433");
    expect(epsteinDocket?.downloadUrl).toMatch(/^https?:\/\//);
  });

  it("Silent Tax calculator computes accurate historical inflation factors", () => {
    // 1913 baseline
    const stats1913 = calculatePurchasingPower(1913, 100);
    expect(stats1913.purchasingPowerLostPercent).toBeGreaterThan(95);
    expect(stats1913.multiplier).toBeGreaterThan(30);
    expect(stats1913.equivalentToday).toBeGreaterThan(3000);

    // 1971 Nixon Shock baseline
    const stats1971 = calculatePurchasingPower(1971, 100);
    expect(stats1971.purchasingPowerLostPercent).toBeGreaterThan(85);
    expect(stats1971.multiplier).toBeGreaterThan(7.5);

    // 2026 present baseline
    const stats2026 = calculatePurchasingPower(2026, 100);
    expect(stats2026.multiplier).toBe(1);
    expect(stats2026.equivalentToday).toBe(100);
  });

  it("product-grid.tsx has single-column layout on mobile (grid-cols-1)", () => {
    const gridFile = fs.readFileSync(
      path.join(process.cwd(), "src/components/storefront/product-grid.tsx"),
      "utf8",
    );
    expect(gridFile).toContain("grid-cols-1");
    expect(gridFile).toContain("sm:grid-cols-2");
  });

  it("cryptographically signs, verifies, and rejects tampered delivery tokens", async () => {
    const { createSignedDeliveryToken, verifySignedDeliveryToken } = await import(
      "@/lib/fulfillment/secrets-store"
    );

    const validToken = createSignedDeliveryToken({
      orderId: "ord-test-123",
      orderNumber: "THX-9999",
      sku: "THX-VAULT-AIMONEY-2026",
      secretId: "sec-vault-aimoney-2026",
      expiresInHours: 72,
    });

    expect(validToken).toBeTruthy();
    expect(validToken.split(".").length).toBe(2);

    const verified = verifySignedDeliveryToken(validToken);
    expect(verified).not.toBeNull();
    expect(verified?.orderNumber).toBe("THX-9999");
    expect(verified?.secretId).toBe("sec-vault-aimoney-2026");

    // Tampered token test
    const tamperedToken = validToken.slice(0, -4) + "XXXX";
    expect(verifySignedDeliveryToken(tamperedToken)).toBeNull();

    // Expired token test
    const expiredToken = createSignedDeliveryToken({
      orderId: "ord-test-expired",
      orderNumber: "THX-EXPIRED",
      sku: "THX-VAULT-AIMONEY-2026",
      secretId: "sec-vault-aimoney-2026",
      expiresInHours: -1, // Expired 1 hour ago
    });
    expect(verifySignedDeliveryToken(expiredToken)).toBeNull();
  });

  it("identifies expired promotions like pCloud automatically", () => {
    const pcloud = getVaultItemBySlug("pcloud-500gb-90-days-voucher");
    expect(pcloud).toBeDefined();
    expect(pcloud?.status).toBe("EXPIRED");
    expect(pcloud?.validUntil).toBe("2026-08-22");
  });

  it("aggregates entries across catalog, deals, prompts, and research into Unified Vault", async () => {
    const { getAllVaultEntries, getHomepageVaultEntries } = await import("@/lib/vault/vault-aggregator");

    const all = getAllVaultEntries();
    expect(all.length).toBeGreaterThan(5);

    // Verify entity types are represented
    const entityTypes = new Set(all.map((e) => e.entityType));
    expect(entityTypes.has("PRODUCT")).toBe(true);
    expect(entityTypes.has("DEAL")).toBe(true);
    expect(entityTypes.has("PROMPT_PACK")).toBe(true);

    // Every item has valid provenance and display price
    for (const item of all) {
      expect(item.provenance).toBeTruthy();
      expect(item.displayPrice).toBeTruthy();
      expect(item.destinationUrl).toBeTruthy();
      expect(item.title).toBeTruthy();
    }

    // Homepage showcase returns balanced subset <= 6 items
    const homepage = getHomepageVaultEntries();
    expect(homepage.length).toBeLessThanOrEqual(6);
    expect(homepage.length).toBeGreaterThan(0);
  });
});
