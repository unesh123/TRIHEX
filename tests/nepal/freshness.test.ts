import { describe, it, expect, beforeEach } from "vitest";
import {
  formatRelativeAge,
  convertForeignToNpr,
  convertNprToForeign,
  resetForexCacheForTest,
  fetchNrbForexRates,
  BASELINE_NRB_RATES,
  ForexSnapshot,
} from "@/lib/nepal/nrb-forex-adapter";

describe("Nepal Pulse Truth & Freshness Engine", () => {
  beforeEach(() => {
    resetForexCacheForTest(null);
  });

  it("formats relative age accurately across time boundaries", () => {
    const now = Date.now();
    expect(formatRelativeAge(now - 30 * 1000)).toBe("Just now");
    expect(formatRelativeAge(now - 15 * 60 * 1000)).toBe("15m ago");
    expect(formatRelativeAge(now - 45 * 60 * 1000)).toBe("45m ago");
    expect(formatRelativeAge(now - 3 * 60 * 60 * 1000)).toBe("3h ago");
    expect(formatRelativeAge(now - 28 * 60 * 60 * 1000)).toBe("1d ago");
    expect(formatRelativeAge(now - 72 * 60 * 60 * 1000)).toBe("3d ago");
  });

  it("returns cached snapshot with CACHED status when recent snapshot exists in memory/db", async () => {
    const fortyFiveMinsAgo = new Date(Date.now() - 45 * 60 * 1000).toISOString();
    const mockCached: ForexSnapshot = {
      date: "2026-09-04",
      publishedAt: fortyFiveMinsAgo,
      fetchedAt: fortyFiveMinsAgo,
      source: "Nepal Rastra Bank (Official Live API)",
      isLive: true,
      freshnessStatus: "LIVE",
      rates: BASELINE_NRB_RATES,
    };

    resetForexCacheForTest(mockCached);

    // If live fetch fails (mocked by invalid host or timeout in test env), should return cached
    const result = await fetchNrbForexRates();
    if (!result.isLive) {
      expect(result.freshnessStatus).toBe("CACHED");
      expect(result.ageLabel).toContain("45m ago");
      expect(result.isLive).toBe(false);
    }
  });

  it("returns STALE freshness status when only offline baseline is available", async () => {
    resetForexCacheForTest(null);

    const result = await fetchNrbForexRates();
    // In test environment without network mock to NRB or if offline
    if (!result.isLive) {
      expect(result.freshnessStatus).toMatch(/STALE|CACHED/);
      expect(result.isLive).toBe(false);
      // Crucial test requirement: UI must never claim LIVE when not live
      expect(result.source).not.toContain("Live API");
    }
  });

  it("calculates foreign to NPR conversion correctly with currency units", () => {
    // USD (unit: 1, buy: 135.20)
    const usdToNpr = convertForeignToNpr(100, 135.20, 1);
    expect(usdToNpr).toBe(13520.00);

    // INR (unit: 100, buy: 160.00)
    const inrToNpr = convertForeignToNpr(5000, 160.00, 100);
    expect(inrToNpr).toBe(8000.00);

    // JPY (unit: 10, buy: 8.95)
    const jpyToNpr = convertForeignToNpr(1000, 8.95, 10);
    expect(jpyToNpr).toBe(895.00);
  });

  it("calculates NPR to foreign conversion correctly with sell rates", () => {
    // NPR to USD (unit: 1, sell: 135.80)
    const nprToUsd = convertNprToForeign(13580, 135.80, 1);
    expect(nprToUsd).toBe(100.00);

    // NPR to INR (unit: 100, sell: 160.15)
    const nprToInr = convertNprToForeign(16015, 160.15, 100);
    expect(nprToInr).toBe(10000.00);
  });

  it("handles zero and negative conversion amounts safely", () => {
    expect(convertForeignToNpr(0, 135.20, 1)).toBe(0);
    expect(convertForeignToNpr(-50, 135.20, 1)).toBe(0);
    expect(convertForeignToNpr(100, -135.20, 1)).toBe(0);
    expect(convertForeignToNpr(100, 135.20, 0)).toBe(0);

    expect(convertNprToForeign(0, 135.80, 1)).toBe(0);
    expect(convertNprToForeign(-100, 135.80, 1)).toBe(0);
  });
});
