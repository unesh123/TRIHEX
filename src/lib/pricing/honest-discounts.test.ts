import { describe, expect, it } from "vitest";
import {
  assertHonestListPrice,
  discountPercentFromList,
  honestCompareAtNprMinor,
  isLossPrice,
} from "@/lib/pricing/honest-discounts";
import {
  buildCustomerTimeline,
  isFulfillmentComplete,
} from "@/lib/orders/fulfillment-checklist";
import { hashProofBytes } from "@/lib/payments/proof-hash";

describe("honest discounts", () => {
  it("requires list >= sell (real basis)", () => {
    expect(() =>
      assertHonestListPrice({ sellNprMinor: 99900, listNprMinor: 50000 }),
    ).toThrow(/must be >= sell/);
  });

  it("hides fabricated 70–90% off list prices", () => {
    const sell = 39900;
    const fakeList = Math.round(sell / 0.15); // ~85% off
    expect(
      honestCompareAtNprMinor({ sellNprMinor: sell, listNprMinor: fakeList }),
    ).toBeNull();
  });

  it("allows honest markdowns within 35%", () => {
    const sell = 100000;
    const list = 130000; // ~23% off
    expect(
      honestCompareAtNprMinor({ sellNprMinor: sell, listNprMinor: list }),
    ).toBe(list);
    expect(discountPercentFromList(sell, list)).toBe(23);
  });

  it("flags loss when sell < cost", () => {
    expect(isLossPrice(33900, 74900)).toBe(true);
    expect(isLossPrice(99900, 74900)).toBe(false);
  });
});

describe("fulfillment checklist", () => {
  it("is complete only when WhatsApp delivered", () => {
    expect(isFulfillmentComplete({ whatsappDelivered: false })).toBe(false);
    expect(isFulfillmentComplete({ whatsappDelivered: true })).toBe(true);
  });

  it("builds customer timeline steps", () => {
    const steps = buildCustomerTimeline({
      createdAt: "2026-07-22T00:00:00.000Z",
      paymentStatus: "PAID",
      orderStatus: "PAID",
      whatsappDelivered: true,
      deliveredAt: "2026-07-22T01:00:00.000Z",
    });
    expect(steps.map((s) => s.key)).toEqual([
      "placed",
      "review",
      "paid",
      "delivered",
    ]);
    expect(steps.at(-1)?.done).toBe(true);
  });
});

describe("proof hash", () => {
  it("hashes screenshot bytes deterministically", () => {
    const a = hashProofBytes(Buffer.from("proof-bytes"));
    const b = hashProofBytes(Buffer.from("proof-bytes"));
    const c = hashProofBytes(Buffer.from("other"));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toHaveLength(64);
  });
});
