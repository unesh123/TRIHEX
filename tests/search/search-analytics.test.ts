import { describe, it, expect, beforeEach } from "vitest";
import {
  recordSearchQuery,
  getSearchAnalyticsSummary,
  hashIpForAnalytics,
  resetSearchAnalyticsForTest,
} from "@/lib/search/analytics";
import { performUniversalSearch } from "@/lib/search/universal-search";

describe("Search Analytics & Zero-Result Intelligence Engine", () => {
  beforeEach(() => {
    resetSearchAnalyticsForTest();
  });

  it("anonymizes IP addresses with rotating keyed HMAC-SHA256", () => {
    const d1 = new Date("2026-09-01T12:00:00Z");
    const d2 = new Date("2026-09-01T14:00:00Z"); // same week
    const d3 = new Date("2026-10-15T12:00:00Z"); // different week

    const hash1 = hashIpForAnalytics("192.168.1.100", d1);
    const hash2 = hashIpForAnalytics("192.168.1.100", d2);
    const hashDifferentIp = hashIpForAnalytics("10.0.0.1", d1);
    const hashDifferentWeek = hashIpForAnalytics("192.168.1.100", d3);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDifferentIp);
    expect(hash1).not.toBe(hashDifferentWeek); // Rotated!
    expect(hash1.length).toBe(16);
  });


  it("records queries and aggregates zero-result demand insights", async () => {
    await recordSearchQuery({
      query: "cursor pro",
      resultCount: 2,
      ipHash: "hash-user-1",
    });

    await recordSearchQuery({
      query: "deepseek r1 secret",
      resultCount: 0, // Zero results!
      ipHash: "hash-user-2",
    });

    await recordSearchQuery({
      query: "deepseek r1 secret",
      resultCount: 0, // Repeated zero result search!
      ipHash: "hash-user-3",
    });

    const summary = await getSearchAnalyticsSummary();
    expect(summary.totalSearches).toBe(3);
    expect(summary.zeroResultCount).toBe(2);

    // Unmet demand should flag "deepseek r1 secret" with count = 2
    const zeroDemand = summary.zeroResultQueries.find((q) => q.query === "deepseek r1 secret");
    expect(zeroDemand).toBeDefined();
    expect(zeroDemand?.count).toBe(2);

    // Top query should include cursor pro
    const top = summary.topQueries.find((q) => q.query === "cursor pro");
    expect(top).toBeDefined();
    expect(top?.count).toBe(1);
    expect(top?.lastResultCount).toBe(2);
  });

  it("filters out single-character trivial queries from analytics spam", async () => {
    await recordSearchQuery({
      query: "a",
      resultCount: 10,
    });

    const summary = await getSearchAnalyticsSummary();
    expect(summary.totalSearches).toBe(0);
  });

  it("integrates analytics tracking with performUniversalSearch", async () => {
    resetSearchAnalyticsForTest();

    const results = await performUniversalSearch("gemini pro", 4, {
      ipHash: "test-ip-hash",
      trackAnalytics: true,
    });

    expect(results).toBeDefined();
    const summary = await getSearchAnalyticsSummary();
    expect(summary.totalSearches).toBeGreaterThanOrEqual(1);
    expect(summary.recentSearches[0].queryText).toBe("gemini pro");
    expect(summary.recentSearches[0].ipHash).toBe("test-ip-hash");
  });
});
