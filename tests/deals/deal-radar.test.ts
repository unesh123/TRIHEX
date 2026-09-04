import { describe, it, expect } from "vitest";
import { normalizeResourifyCandidate } from "@/lib/deals/resourify-adapter";
import {
  getAllDealCandidates,
  getPublishedDeals,
  approveDeal,
  rejectDeal,
  checkDealExpirations,
} from "@/lib/deals/store";

describe("TRIHEX Deal Radar Engine", () => {
  it("normalizes raw third-party items cleanly", () => {
    const raw = {
      id: "raw-test-1",
      title: "AWS $1000 Cloud Credits for Builders",
      companyName: "Amazon Web Services",
      description: "Get credits for EC2 and S3.",
      dealType: "credits",
      couponCode: "BUILDER2026",
      dealValue: "$1000",
      dealUrl: "https://resourify.com/deal/aws",
      officialUrl: "https://aws.amazon.com/activate",
      requiresCreditCard: true,
    };

    const candidate = normalizeResourifyCandidate(raw);
    expect(candidate.id).toBe("deal-raw-test-1");
    expect(candidate.vendor).toBe("Amazon Web Services");
    expect(candidate.dealType).toBe("CREDITS");
    expect(candidate.promoCode).toBe("BUILDER2026");
    expect(candidate.cardRequired).toBe(true);
    expect(candidate.status).toBe("DISCOVERED");
    expect(candidate.detectedValueNprMinor).toBe(13500000); // $1000 * 135 * 100
  });

  it("handles deal approvals with audit revisions", () => {
    const all = getAllDealCandidates();
    const candidate = all.find((d) => d.status !== "PUBLISHED") || all[0];

    const approved = approveDeal(candidate.id, "FREE", "tester-admin");
    expect(approved).not.toBeNull();
    expect(approved?.status).toBe("PUBLISHED");
    expect(approved?.approvalType).toBe("FREE");
    expect(approved?.revisions[0].changedBy).toBe("tester-admin");
  });

  it("handles deal rejections with audit reason", () => {
    const all = getAllDealCandidates();
    const candidate = all[0];

    const rejected = rejectDeal(candidate.id, "Vendor discontinued campaign", "tester-admin");
    expect(rejected).not.toBeNull();
    expect(rejected?.status).toBe("REJECTED");
    expect(rejected?.revisions[0].reason).toBe("Vendor discontinued campaign");
  });

  it("automatically expires past deals", () => {
    const stats = checkDealExpirations();
    expect(stats).toBeDefined();

    const published = getPublishedDeals();
    for (const deal of published) {
      if (deal.validUntil) {
        expect(new Date(deal.validUntil).getTime()).toBeGreaterThan(Date.now());
      }
    }
  });
});
