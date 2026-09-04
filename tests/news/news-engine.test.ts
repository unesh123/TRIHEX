import { describe, it, expect } from "vitest";
import { getAllNews, getNewsBySlug, getBreakingNews, getGeoNewsEvents } from "@/lib/news/store";
import { normalizeTitleFingerprint, calculateHotScore } from "@/lib/news/ingestion";

describe("Live News Intelligence Platform Engine", () => {
  it("retrieves news articles sorted by priority and hot score", () => {
    const news = getAllNews();
    expect(news.length).toBeGreaterThan(0);
    expect(news[0].isPinned || news[0].hotScore >= 80).toBe(true);
  });

  it("filters news articles by category", () => {
    const nepalTech = getAllNews({ category: "NEPAL_TECH" });
    expect(nepalTech.length).toBeGreaterThan(0);
    nepalTech.forEach((a) => expect(a.category).toBe("NEPAL_TECH"));

    const globalAi = getAllNews({ category: "AI_GLOBAL" });
    expect(globalAi.length).toBeGreaterThan(0);
    globalAi.forEach((a) => expect(a.category).toBe("AI_GLOBAL"));
  });

  it("finds article by slug and returns key takeaways", () => {
    const article = getNewsBySlug("nepal-releases-draft-national-ai-policy-2026");
    expect(article).toBeDefined();
    expect(article?.title).toContain("National AI Policy");
    expect(article?.bulletPoints.length).toBeGreaterThanOrEqual(2);
  });

  it("extracts geo-coordinated news events for map layers", () => {
    const geoEvents = getGeoNewsEvents();
    expect(geoEvents.length).toBeGreaterThan(0);
    expect(geoEvents[0]).toHaveProperty("lat");
    expect(geoEvents[0]).toHaveProperty("lng");
    expect(geoEvents[0]).toHaveProperty("location");
  });

  it("calculates title fingerprints and hot scores correctly", () => {
    const fp1 = normalizeTitleFingerprint("Nepal Ministry of Communication Releases Draft National AI Policy 2026");
    const fp2 = normalizeTitleFingerprint("nepal ministry of communication releases draft national ai policy 2026");
    expect(fp1).toBe(fp2);

    const freshScore = calculateHotScore({
      publishedAt: new Date().toISOString(),
      corroboratingSources: 3,
      isNepalSpecific: true,
    });
    expect(freshScore).toBeGreaterThanOrEqual(80);
  });
});
