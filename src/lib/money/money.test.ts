import { describe, expect, it } from "vitest";
import {
  add,
  applyPsychologicalRounding,
  convertUsdToNpr,
  formatNpr,
  money,
  subtract,
} from "@/lib/money";

describe("money arithmetic", () => {
  it("adds and subtracts integer minor units", () => {
    const a = money(30000, "NPR");
    const b = money(28800, "NPR");
    expect(subtract(a, b).amountMinor).toBe(1200);
    expect(add(b, money(1200, "NPR")).amountMinor).toBe(30000);
  });

  it("rejects non-integer amounts", () => {
    expect(() => money(1.5, "NPR")).toThrow();
  });

  it("converts USD cents to NPR paisa with integer FX", () => {
    // USD 1.80 = 180 cents; NPR 160/USD => rateNprMinorPerUsd = 16000
    const npr = convertUsdToNpr(180, 16000);
    expect(npr.amountMinor).toBe(28800); // NPR 288
  });

  it("formats NPR without decimals by default", () => {
    const formatted = formatNpr(30000);
    expect(formatted).toContain("300");
  });

  it("applies psychological rounding", () => {
    expect(applyPsychologicalRounding(30150, "NEAREST_10")).toBe(30000);
  });
});
