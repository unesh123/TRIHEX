import { describe, it, expect } from "vitest";
import { checkGoogleMapsClientConfig } from "@/lib/maps/diagnostic";

describe("Google Maps Diagnostic & Key Standard", () => {
  it("returns diagnostic status object with feature support flags", () => {
    const diag = checkGoogleMapsClientConfig();
    expect(diag).toHaveProperty("browserKeyConfigured");
    expect(diag).toHaveProperty("browserKeySource");
    expect(diag).toHaveProperty("mapIdConfigured");
    expect(diag.hasTrafficLayerSupport).toBe(true);
    expect(diag.hasPlacesSupport).toBe(true);
    expect(diag.hasAdvancedMarkerSupport).toBe(true);
  });
});
