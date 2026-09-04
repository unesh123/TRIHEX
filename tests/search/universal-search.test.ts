import { describe, it, expect } from "vitest";
import { performUniversalSearch } from "@/lib/search/universal-search";

describe("Universal Cross-Entity Search Engine", () => {
  it("returns empty result set for blank query", async () => {
    const res = await performUniversalSearch("   ");
    expect(res.totalCount).toBe(0);
    expect(res.groups).toHaveLength(0);
  });

  it("finds products, deals, prompts, and skills matching relevant keywords", async () => {
    // "cursor" should match Cursor Pro product, Cursor IDE trial deal, and Cursor prompt/skill
    const res = await performUniversalSearch("cursor");
    expect(res.totalCount).toBeGreaterThan(0);

    const types = res.groups.map((g) => g.type);
    expect(types.length).toBeGreaterThan(0);

    const allMatches = res.groups.flatMap((g) => g.results);
    for (const match of allMatches) {
      const combined = `${match.title} ${match.subtitle} ${match.description || ""}`.toLowerCase();
      expect(combined).toContain("cursor");
    }
  });

  it("finds Nepal public data and datasets", async () => {
    const res = await performUniversalSearch("nepal");
    expect(res.totalCount).toBeGreaterThan(0);

    const datasetGroup = res.groups.find((g) => g.type === "DATASET");
    expect(datasetGroup).toBeDefined();
    expect(datasetGroup?.results.length).toBeGreaterThan(0);
  });
});
