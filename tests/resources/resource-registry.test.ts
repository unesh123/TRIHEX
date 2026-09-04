import { describe, it, expect } from "vitest";
import { getAllResources, getResourceBySlug } from "@/lib/resources/store";

describe("Heavy Resource Library & Legal Rights Engine", () => {
  it("retrieves resources with verified legal rights tags", () => {
    const resources = getAllResources();
    expect(resources.length).toBeGreaterThanOrEqual(10);
    resources.forEach((r) => {
      expect(["PUBLIC_DOMAIN", "OPEN_LICENSE", "LINK_ONLY", "TRIHEX_ORIGINAL"]).toContain(r.rightsTag);
      expect(r.licenseName.length).toBeGreaterThan(0);
      expect(r.verifiedBy.length).toBeGreaterThan(0);
    });
  });

  it("filters resources by category", () => {
    const security = getAllResources({ category: "SECURITY_ADVISORY" });
    expect(security.length).toBeGreaterThan(0);
    security.forEach((s) => expect(s.category).toBe("SECURITY_ADVISORY"));

    const datasets = getAllResources({ category: "PUBLIC_DATASET" });
    expect(datasets.length).toBeGreaterThan(0);
    datasets.forEach((d) => expect(d.category).toBe("PUBLIC_DATASET"));
  });

  it("finds CISA KEV catalog by slug and verifies download URL", () => {
    const kev = getResourceBySlug("cisa-known-exploited-vulnerabilities-catalog");
    expect(kev).toBeDefined();
    expect(kev?.rightsTag).toBe("PUBLIC_DOMAIN");
    expect(kev?.downloadUrl).toContain("cisa.gov");
  });
});
