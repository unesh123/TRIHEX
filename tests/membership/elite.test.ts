import { describe, it, expect } from "vitest";
import { TRIHEX_ELITE_MEMBERSHIP } from "@/lib/membership/elite-product";

describe("TRIHEX ELITE Membership Spec", () => {
  it("strictly enforces DRAFT status to prevent unauthorized checkout before formal launch", () => {
    expect(TRIHEX_ELITE_MEMBERSHIP.status).toBe("DRAFT");
  });

  it("sets the exact NPR 13,699 price (1,369,900 minor units)", () => {
    expect(TRIHEX_ELITE_MEMBERSHIP.priceNprMinor).toBe(1369900);
    expect(TRIHEX_ELITE_MEMBERSHIP.currency).toBe("NPR");
    expect(TRIHEX_ELITE_MEMBERSHIP.billingPeriod).toBe("ANNUAL");
  });

  it("contains zero deceptive wealth guarantee claims across pillars and faq", () => {
    const serialized = JSON.stringify(TRIHEX_ELITE_MEMBERSHIP).toLowerCase();
    expect(serialized).not.toContain("guaranteed profit");
    expect(serialized).not.toContain("become rich");
    expect(serialized).not.toContain("billionaire");
    expect(serialized).not.toContain("get rich quick");
  });

  it("includes all 4 required operational intelligence pillars", () => {
    expect(TRIHEX_ELITE_MEMBERSHIP.pillars).toHaveLength(4);
    const titles = TRIHEX_ELITE_MEMBERSHIP.pillars.map((p) => p.title);
    expect(titles.some((t) => t.includes("Intelligence"))).toBe(true);
    expect(titles.some((t) => t.includes("Prompt"))).toBe(true);
    expect(titles.some((t) => t.includes("Concierge"))).toBe(true);
    expect(titles.some((t) => t.includes("Credits"))).toBe(true);
  });
});
