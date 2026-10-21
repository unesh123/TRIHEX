import { describe, expect, it } from "vitest";
import { activeElevenLabsOffer, campaignPrice, ELEVENLABS_OFFER } from "../../src/lib/catalog/limited-offer";
import { buildMerchCard } from "../../src/lib/catalog/merchandising";
import { ALL_SEED_PRODUCTS } from "../../src/db/seed-data";

describe("ElevenLabs campaign", () => {
  it("runs for exactly 72 hours and excludes its expiry instant", () => {
    const start = Date.parse(ELEVENLABS_OFFER.startsAt);
    const end = Date.parse(ELEVENLABS_OFFER.endsAt);
    expect(end - start).toBe(72 * 60 * 60 * 1000);
    expect(activeElevenLabsOffer(ELEVENLABS_OFFER.slug, start - 1)).toBeNull();
    expect(activeElevenLabsOffer(ELEVENLABS_OFFER.slug, start)).not.toBeNull();
    expect(activeElevenLabsOffer(ELEVENLABS_OFFER.slug, end)).toBeNull();
  });
  it("discounts only the one-month SKU and restores its regular price", () => {
    const during = Date.parse(ELEVENLABS_OFFER.startsAt);
    expect(campaignPrice(ELEVENLABS_OFFER.slug, ELEVENLABS_OFFER.sku, 269900, during)).toBe(100000);
    expect(campaignPrice(ELEVENLABS_OFFER.slug, "ELV-4M-CREATOR", 469900, during)).toBe(469900);
    expect(campaignPrice(ELEVENLABS_OFFER.slug, ELEVENLABS_OFFER.sku, 269900, Date.parse(ELEVENLABS_OFFER.endsAt))).toBe(269900);
  });
  it("retains MuseAI's confirmed price without inventing a duration", () => {
    const product = ALL_SEED_PRODUCTS.find(p => p.slug === "museai")!;
    const card = buildMerchCard(product);
    expect(card.priceNprMinor).toBe(39900);
    expect(card.purchasable).toBe(false);
    expect(product.variants[0].durationValue).toBeNull();
    expect(product.variants[0].variantName).toContain("1 Billion Tokens");
  });
});
