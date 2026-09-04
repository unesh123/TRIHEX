import { describe, it, expect } from "vitest";
import { getConfidenceTier } from "@/lib/research/types";
import { computeReportConfidence } from "@/lib/research/citation-validator";

describe("Nepal Research 3.0 4-Tier Confidence Scoring", () => {
  it("maps confidence scores to exact 4 tiers", () => {
    expect(getConfidenceTier(95)).toBe("Strong");
    expect(getConfidenceTier(85)).toBe("Strong");
    expect(getConfidenceTier(84)).toBe("Good");
    expect(getConfidenceTier(70)).toBe("Good");
    expect(getConfidenceTier(69)).toBe("Mixed");
    expect(getConfidenceTier(50)).toBe("Mixed");
    expect(getConfidenceTier(49)).toBe("Limited");
    expect(getConfidenceTier(10)).toBe("Limited");
    expect(getConfidenceTier(0)).toBe("Limited");
  });

  it("calculates high confidence for corroborated structured sources", () => {
    const verifiedCitations = [
      {
        id: "c1",
        title: "NRB Forex API",
        url: "https://www.nrb.org.np",
        publisher: "Nepal Rastra Bank",
        snippet: "Official rate",
        isVerifiedSource: true,
      },
      {
        id: "c2",
        title: "USGS FDSN",
        url: "https://earthquake.usgs.gov",
        publisher: "USGS",
        snippet: "FDSN seismic stream",
        isVerifiedSource: true,
      },
    ];

    const score = computeReportConfidence(verifiedCitations, 2);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(["Strong", "Good"]).toContain(getConfidenceTier(score));
  });
});
