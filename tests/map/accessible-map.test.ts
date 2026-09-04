import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { calculateDistanceFromKathmanduKm, BASELINE_NEPAL_SEISMIC } from "@/lib/nepal/earthquake-adapter";
import { VERIFIED_NEPAL_DATASETS } from "@/lib/nepal/open-data-adapter";

describe("Google Maps Geospatial Explorer & Accessibility Engine", () => {
  it("verifies accessible list view and mobile single-column styling in trihex-map.tsx", () => {
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/maps/trihex-map.tsx"),
      "utf8",
    );

    // Strict accessibility requirements
    expect(fileContent).toContain('aria-label="Geospatial Explorer View Options"');
    expect(fileContent).toContain('role="list"');
    expect(fileContent).toContain('role="listitem"');
    expect(fileContent).toContain('aria-live="polite"');
    expect(fileContent).toContain("Accessible List");

    // Strict mobile layout: 1 card per row under 640px
    expect(fileContent).toContain("grid-cols-1 md:grid-cols-2 lg:grid-cols-3");

    // Truthful status badge when Maps Key is unset
    expect(fileContent).toContain("Interactive Canvas Mode (Maps Key Unset)");
    expect(fileContent).toContain("Google Maps Live");
  });

  it("calculates distance from Kathmandu for all baseline earthquakes and dataset coordinates", () => {
    for (const eq of BASELINE_NEPAL_SEISMIC) {
      const dist = calculateDistanceFromKathmanduKm(eq.latitude, eq.longitude);
      expect(dist).toBeGreaterThanOrEqual(0);
      expect(dist).toBeLessThan(1000); // Inside/near Nepal borders
    }

    const geoDatasets = VERIFIED_NEPAL_DATASETS.filter((d) => d.coordinates);
    for (const ds of geoDatasets) {
      const dist = calculateDistanceFromKathmanduKm(ds.coordinates!.lat, ds.coordinates!.lng);
      expect(dist).toBeGreaterThanOrEqual(0);
      expect(dist).toBeLessThan(1000);
    }
  });
});
