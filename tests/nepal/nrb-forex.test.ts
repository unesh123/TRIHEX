import { describe, it, expect } from "vitest";
import {
  fetchNrbForexRates,
  convertForeignToNpr,
  convertNprToForeign,
  BASELINE_NRB_RATES,
} from "@/lib/nepal/nrb-forex-adapter";

describe("Nepal Rastra Bank Forex Adapter & Calculator", () => {
  it("fetches forex snapshot with all required major currencies", async () => {
    const snapshot = await fetchNrbForexRates();
    expect(snapshot).toBeDefined();
    expect(snapshot.rates.length).toBeGreaterThanOrEqual(10);

    const currencies = snapshot.rates.map((r) => r.currency);
    expect(currencies).toContain("USD");
    expect(currencies).toContain("EUR");
    expect(currencies).toContain("GBP");
    expect(currencies).toContain("AUD");
  });

  it("calculates foreign to NPR conversion correctly with unit consideration", () => {
    // 1 USD at buy rate 135.20 = NPR 135.20
    const usdToNpr = convertForeignToNpr(100, 135.20, 1);
    expect(usdToNpr).toBe(13520);

    // 1000 JPY (unit = 10) at buy rate 8.95 = (1000 * 8.95) / 10 = NPR 895
    const jpyToNpr = convertForeignToNpr(1000, 8.95, 10);
    expect(jpyToNpr).toBe(895);
  });

  it("calculates NPR to foreign conversion correctly", () => {
    // NPR 13580 at sell rate 135.80 = 100 USD
    const nprToUsd = convertNprToForeign(13580, 135.80, 1);
    expect(nprToUsd).toBe(100);
  });

  it("ensures sell rate is always >= buy rate (positive spread)", () => {
    for (const rate of BASELINE_NRB_RATES) {
      expect(rate.sell).toBeGreaterThanOrEqual(rate.buy);
      expect(rate.spreadNpr).toBeGreaterThanOrEqual(0);
    }
  });
});
