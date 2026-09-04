import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllSources,
  getSourceBySlug,
  updateSourceStatus,
  resetSourcesStoreForTest,
} from "@/lib/sources/source-registry";
import { checkSystemHealth } from "@/lib/system/system-health";

describe("Sources Registry & System Observability", () => {
  beforeEach(() => {
    resetSourcesStoreForTest();
  });

  it("retrieves all registered external intelligence sources with valid configurations", async () => {
    const sources = await getAllSources();
    expect(sources.length).toBeGreaterThanOrEqual(5);

    const nrb = sources.find((s) => s.slug === "nrb-forex");
    expect(nrb).toBeDefined();
    expect(nrb?.trustLevel).toBe("OFFICIAL_GOVERNMENT");
    expect(nrb?.baseUrl).toContain("nrb.org.np");

    const usgs = sources.find((s) => s.slug === "usgs-nepal-seismic");
    expect(usgs).toBeDefined();
    expect(usgs?.trustLevel).toBe("OFFICIAL_GOVERNMENT");

    const prompts = sources.find((s) => s.slug === "prompts-chat-archive");
    expect(prompts).toBeDefined();
    expect(prompts?.trustLevel).toBe("COMMUNITY_VERIFIED");
    expect(prompts?.licenseNotes).toContain("CC0");
  });

  it("updates source health status and failure counts accurately", async () => {
    const slug = "resourify-deals";
    expect(getSourceBySlug(slug)?.healthStatus).toBe("HEALTHY");

    // Simulate failure
    await updateSourceStatus(slug, "DEGRADED", false);
    const degraded = getSourceBySlug(slug);
    expect(degraded?.healthStatus).toBe("DEGRADED");
    expect(degraded?.consecutiveFailures).toBe(1);
    expect(degraded?.lastFailedSyncAt).toBeDefined();

    // Simulate recovery
    await updateSourceStatus(slug, "HEALTHY", true);
    const recovered = getSourceBySlug(slug);
    expect(recovered?.healthStatus).toBe("HEALTHY");
    expect(recovered?.consecutiveFailures).toBe(0);
    expect(recovered?.lastSuccessfulSyncAt).toBeDefined();
  });

  it("executes comprehensive system diagnostic probe without throwing", async () => {
    const report = await checkSystemHealth();

    expect(report.checkedAt).toBeDefined();
    expect(report.overallStatus).toMatch(/HEALTHY|DEGRADED|CRITICAL/);
    expect(report.components.length).toBeGreaterThanOrEqual(4);

    // Verify key subsystems checked
    const componentNames = report.components.map((c) => c.name);
    expect(componentNames.some((n) => n.includes("PostgreSQL"))).toBe(true);
    expect(componentNames.some((n) => n.includes("Fulfillment"))).toBe(true);
    expect(componentNames.some((n) => n.includes("Job Scheduler"))).toBe(true);
    expect(componentNames.some((n) => n.includes("SafeFetch"))).toBe(true);
  });
});
