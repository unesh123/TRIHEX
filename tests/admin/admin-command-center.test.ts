import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllDealCandidates,
  approveDeal,
  updateDealCandidate,
  resetDealsStoreForTest,
} from "@/lib/deals/store";
import {
  getDailyUsageStats,
  recordUsageCost,
  checkBudgetGuard,
  recordFailoverEvent,
  getFailoverEvents,
} from "@/lib/providers/budget";

describe("Admin Command Center 3.0 (Queue & Usage)", () => {
  beforeEach(() => {
    resetDealsStoreForTest();
  });

  it("approves deal candidates in verification queue with revisions audit trail", () => {
    const deals = getAllDealCandidates();
    expect(deals.length).toBeGreaterThan(0);

    const first = deals[0];
    const approved = approveDeal(first.id, "FREE", "admin@trihex.test");

    expect(approved).not.toBeNull();
    expect(approved?.status).toBe("PUBLISHED");
    expect(approved?.approvalType).toBe("FREE");
    expect(approved?.revisions.some((r) => r.changedBy === "admin@trihex.test")).toBe(true);
  });

  it("rejects invalid deal candidates in verification queue", () => {
    const deals = getAllDealCandidates();
    const first = deals[0];

    const rejected = updateDealCandidate(first.id, { status: "REJECTED" }, "admin@trihex.test");
    expect(rejected).not.toBeNull();
    expect(rejected?.status).toBe("REJECTED");
  });

  it("tracks provider usage cost and breaks down by provider ID", () => {
    recordUsageCost(10, "gemini");
    recordUsageCost(15, "openai");

    const stats = getDailyUsageStats();
    expect(stats.dailyCostCents).toBeGreaterThanOrEqual(25);
    expect(stats.providerBreakdown.gemini.costCents).toBeGreaterThanOrEqual(10);
    expect(stats.providerBreakdown.openai.costCents).toBeGreaterThanOrEqual(15);
    expect(stats.budgetRemainingCents).toBeLessThanOrEqual(stats.dailyBudgetCents);
  });

  it("enforces daily budget guard ceiling ($5.00 / 500 cents)", () => {
    // Normal request under budget
    const normalCheck = checkBudgetGuard(5);
    expect(normalCheck.allowed).toBe(true);

    // Huge request that exceeds daily budget limit
    const hugeCheck = checkBudgetGuard(1000);
    expect(hugeCheck.allowed).toBe(false);
    expect(hugeCheck.reason).toContain("Daily external API budget limit reached");
  });

  it("records and retrieves provider failover events", () => {
    recordFailoverEvent("gemini", "openai", "Gemini timeout 8000ms");
    const events = getFailoverEvents();

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].fromProvider).toBe("gemini");
    expect(events[0].toProvider).toBe("openai");
    expect(events[0].reason).toContain("Gemini timeout");
  });
});
