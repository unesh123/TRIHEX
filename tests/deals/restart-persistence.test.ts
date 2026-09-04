import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllDealCandidates,
  approveDeal,
  rejectDeal,
  addDealCandidate,
  resetDealsStoreForTest,
  getDealCandidateBySlug,
} from "@/lib/deals/store";
import { DealCandidate } from "@/lib/deals/types";

describe("Deal Radar Persistence & State Invariants", () => {
  const testCandidate: DealCandidate = {
    id: "deal-persistence-test-1",
    sourceId: "src-resourify-deals",
    title: "Persistent PostgreSQL Test Cloud Credits",
    slug: "persistent-test-cloud-credits",
    vendor: "TestCloud Inc",
    summary: "Verification that state survives restart without dropping attributes.",
    dealType: "CREDITS",
    detectedValueNprMinor: 500000,
    cardRequired: false,
    sourceClaimUrl: "https://example.com/claim",
    officialVendorUrl: "https://example.com/vendor",
    discoveredAt: new Date().toISOString(),
    verificationScore: 88,
    status: "DISCOVERED",
    revisions: [],
    category: "CLOUD",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    resetDealsStoreForTest();
  });

  it("stores newly added candidate with all metadata intact", () => {
    addDealCandidate(testCandidate);

    const found = getDealCandidateBySlug("persistent-test-cloud-credits");
    expect(found).toBeDefined();
    expect(found?.vendor).toBe("TestCloud Inc");
    expect(found?.verificationScore).toBe(88);
    expect(found?.status).toBe("DISCOVERED");
  });

  it("records immutable revisions when approved by admin", () => {
    addDealCandidate(testCandidate);
    const approved = approveDeal("deal-persistence-test-1", "FREE", "admin-tester");

    expect(approved).not.toBeNull();
    expect(approved?.status).toBe("PUBLISHED");
    expect(approved?.approvalType).toBe("FREE");
    expect(approved?.revisions.length).toBeGreaterThan(0);
    expect(approved?.revisions[0].changedBy).toBe("admin-tester");
    expect(approved?.revisions[0].newValue).toBe("PUBLISHED");
  });

  it("records immutable revisions when rejected by admin", () => {
    addDealCandidate(testCandidate);
    const rejected = rejectDeal("deal-persistence-test-1", "Vendor page 404", "admin-tester");

    expect(rejected).not.toBeNull();
    expect(rejected?.status).toBe("REJECTED");
    expect(rejected?.revisions[0].reason).toBe("Vendor page 404");
  });

  it("survives simulated process reload with state intact", () => {
    addDealCandidate(testCandidate);
    approveDeal("deal-persistence-test-1", "FREE", "admin-tester");

    // Snapshot current state
    const beforeRestart = getAllDealCandidates().find((d) => d.id === "deal-persistence-test-1");
    expect(beforeRestart?.status).toBe("PUBLISHED");

    // Simulate process reboot by re-initializing store with persisted items
    resetDealsStoreForTest([beforeRestart!]);

    const afterRestart = getAllDealCandidates().find((d) => d.id === "deal-persistence-test-1");
    expect(afterRestart).toBeDefined();
    expect(afterRestart?.id).toBe("deal-persistence-test-1");
    expect(afterRestart?.status).toBe("PUBLISHED");
    expect(afterRestart?.revisions[0].changedBy).toBe("admin-tester");
  });
});
