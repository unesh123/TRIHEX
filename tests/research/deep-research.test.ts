import { describe, it, expect } from "vitest";
import { buildResearchPlan } from "@/lib/research/planner";
import { validateCitation, computeReportConfidence } from "@/lib/research/citation-validator";
import { executeDeepResearch } from "@/lib/research/engine";

describe("Nepal Deep Research Engine & Ground Truth Synthesizer", () => {
  it("accurately classifies research queries into domain categories and plans structured ingest", () => {
    const forexPlan = buildResearchPlan("What is the current USD NPR exchange rate and spread?");
    expect(forexPlan.detectedCategory).toBe("FOREX");
    expect(forexPlan.requiresStructuredForex).toBe(true);

    const quakePlan = buildResearchPlan("Analyze recent Jajarkot earthquake clusters and magnitudes");
    expect(quakePlan.detectedCategory).toBe("SEISMOLOGY");
    expect(quakePlan.requiresStructuredSeismic).toBe(true);

    const macroPlan = buildResearchPlan("Evaluate Nepal remittance inflows and gross forex reserves cover");
    expect(macroPlan.detectedCategory).toBe("ECONOMY");
    expect(macroPlan.requiresStructuredEconomy).toBe(true);
  });

  it("validates official government and institutional citations", () => {
    const validNrb = validateCitation({
      id: "test-1",
      title: "NRB Forex",
      url: "https://www.nrb.org.np/api/forex/v1/rates",
      publisher: "NRB",
      snippet: "Forex rates",
      isVerifiedSource: false,
    });
    expect(validNrb.isVerifiedSource).toBe(true);

    const validUsgs = validateCitation({
      id: "test-2",
      title: "USGS Earthquakes",
      url: "https://earthquake.usgs.gov/earthquakes/eventpage/us7000l8b7",
      publisher: "USGS",
      snippet: "Seismic event",
      isVerifiedSource: false,
    });
    expect(validUsgs.isVerifiedSource).toBe(true);

    const untrusted = validateCitation({
      id: "test-3",
      title: "Random Blog",
      url: "https://random-unverified-blog.xyz/nepal-news",
      publisher: "Unknown",
      snippet: "Rumors",
      isVerifiedSource: false,
    });
    expect(untrusted.isVerifiedSource).toBe(false);
  });

  it("calculates report confidence based on structured sources and verified domains", () => {
    // 0 sources & 0 citations -> floor 30
    expect(computeReportConfidence([], 0)).toBe(30);

    // 2 structured sources (NRB + USGS) -> 50 + 30 = 80
    expect(computeReportConfidence([], 2)).toBe(80);

    // 2 structured sources + 2 verified citations -> 50 + 30 + 10 = 90
    const citations = [
      { id: "1", title: "", url: "", publisher: "", snippet: "", isVerifiedSource: true },
      { id: "2", title: "", url: "", publisher: "", snippet: "", isVerifiedSource: true },
    ];
    expect(computeReportConfidence(citations, 2)).toBe(90);
  });

  it("executes deep research and generates complete EvidenceReport with verified claims", async () => {
    const report = await executeDeepResearch("Current NPR to USD exchange rate and monetary reserves");

    expect(report).toBeDefined();
    expect(report.query).toBe("Current NPR to USD exchange rate and monetary reserves");
    expect(report.executiveSummary).toBeTruthy();
    expect(report.executiveSummary.length).toBeGreaterThan(20);
    expect(report.confidenceScore).toBeGreaterThanOrEqual(60);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.citations.length).toBeGreaterThan(0);
    expect(report.groundTruthSourcesUsed.length).toBeGreaterThan(0);

    // Verify structured claims exist
    const allClaims = report.findings.flatMap((f) => f.claims);
    expect(allClaims.length).toBeGreaterThan(0);
    for (const claim of allClaims) {
      expect(claim.claim).toBeTruthy();
      expect(claim.status).toBeTruthy();
    }
  }, 15000); // Allow time for live feed & model reasoning
});
