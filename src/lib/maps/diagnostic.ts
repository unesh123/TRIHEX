import { clientEnv } from "@/lib/env/client";

export interface GoogleMapsDiagnostic {
  browserKeyConfigured: boolean;
  browserKeySource: "CANONICAL" | "LEGACY" | "NONE";
  mapIdConfigured: boolean;
  mapId?: string;
  hasTrafficLayerSupport: boolean;
  hasPlacesSupport: boolean;
  hasAdvancedMarkerSupport: boolean;
  timestamp: string;
}

/**
 * Returns safe diagnostic metadata about Google Maps configuration.
 * Never exposes the key string.
 */
export function checkGoogleMapsClientConfig(): GoogleMapsDiagnostic {
  const canonical = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY : undefined;
  const legacy = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : undefined;
  const activeKey = clientEnv.googleMapsBrowserKey;

  let browserKeySource: GoogleMapsDiagnostic["browserKeySource"] = "NONE";
  if (canonical && canonical.trim() !== "") {
    browserKeySource = "CANONICAL";
  } else if (legacy && legacy.trim() !== "") {
    browserKeySource = "LEGACY";
  }

  return {
    browserKeyConfigured: Boolean(activeKey && activeKey.trim() !== ""),
    browserKeySource,
    mapIdConfigured: Boolean(clientEnv.googleMapsMapId && clientEnv.googleMapsMapId.trim() !== ""),
    mapId: clientEnv.googleMapsMapId ? `${clientEnv.googleMapsMapId.slice(0, 4)}...` : undefined,
    hasTrafficLayerSupport: true,
    hasPlacesSupport: true,
    hasAdvancedMarkerSupport: true,
    timestamp: new Date().toISOString(),
  };
}
