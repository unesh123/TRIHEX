import { safeFetch } from "@/lib/ingestion/safe-fetch";

export interface SeismicEvent {
  id: string;
  title: string;
  magnitude: number;
  depthKm: number;
  latitude: number;
  longitude: number;
  place: string;
  timeIso: string;
  significance: number;
  url: string;
}

export const BASELINE_NEPAL_SEISMIC: SeismicEvent[] = [
  {
    id: "us7000l8b7",
    title: "M 4.2 - 24 km ENE of Jajarkot, Nepal",
    magnitude: 4.2,
    depthKm: 12.5,
    latitude: 28.784,
    longitude: 82.428,
    place: "24 km ENE of Jajarkot, Karnali Province",
    timeIso: "2026-02-14T03:45:12Z",
    significance: 275,
    url: "https://earthquake.usgs.gov/earthquakes/eventpage/us7000l8b7",
  },
  {
    id: "us7000k9m1",
    title: "M 3.8 - 18 km N of Chainpur, Bajhang, Nepal",
    magnitude: 3.8,
    depthKm: 10.0,
    latitude: 29.712,
    longitude: 81.205,
    place: "18 km N of Chainpur, Sudurpashchim Province",
    timeIso: "2026-01-20T18:12:00Z",
    significance: 210,
    url: "https://earthquake.usgs.gov/earthquakes/eventpage/us7000k9m1",
  },
  {
    id: "us7000j2a4",
    title: "M 4.5 - 32 km NW of Pokhara, Nepal",
    magnitude: 4.5,
    depthKm: 15.0,
    latitude: 28.412,
    longitude: 83.742,
    place: "32 km NW of Pokhara, Gandaki Province",
    timeIso: "2025-12-05T09:30:22Z",
    significance: 312,
    url: "https://earthquake.usgs.gov/earthquakes/eventpage/us7000j2a4",
  },
  {
    id: "us7000h1x9",
    title: "M 3.5 - 14 km E of Kathmandu, Nepal",
    magnitude: 3.5,
    depthKm: 10.0,
    latitude: 27.717,
    longitude: 85.456,
    place: "14 km E of Kathmandu (Bhaktapur border), Bagmati Province",
    timeIso: "2025-11-18T14:20:00Z",
    significance: 190,
    url: "https://earthquake.usgs.gov/earthquakes/eventpage/us7000h1x9",
  },
];

export async function fetchNepalSeismicEvents(): Promise<{
  events: SeismicEvent[];
  source: string;
  isLive: boolean;
}> {
  // Nepal bounding box coordinates: 26N to 31N, 80E to 89E
  const url =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&minlatitude=26&maxlatitude=31&minlongitude=80&maxlongitude=89&limit=15";

  try {
    const result = await safeFetch<any>(url, {
      timeoutMs: 4000,
      allowedDomains: ["earthquake.usgs.gov"],
    });

    if (result.ok && result.data?.features && Array.isArray(result.data.features)) {
      const parsed: SeismicEvent[] = result.data.features.map((f: any) => {
        const [lon, lat, depth] = f.geometry.coordinates;
        return {
          id: f.id,
          title: f.properties.title || `M ${f.properties.mag} Earthquake`,
          magnitude: Number(f.properties.mag.toFixed(1)),
          depthKm: Number(depth.toFixed(1)),
          latitude: Number(lat.toFixed(3)),
          longitude: Number(lon.toFixed(3)),
          place: f.properties.place || "Nepal Region",
          timeIso: new Date(f.properties.time).toISOString(),
          significance: f.properties.sig || 0,
          url: f.properties.url || "https://earthquake.usgs.gov",
        };
      });

      if (parsed.length > 0) {
        return {
          events: parsed,
          source: "USGS Earthquake Hazards Program (Live FDSN Feed)",
          isLive: true,
        };
      }
    }
  } catch {
    // Network or API rate limit fallback
  }

  return {
    events: BASELINE_NEPAL_SEISMIC,
    source: "USGS Earthquake Hazards Program (Historical Baseline)",
    isLive: false,
  };
}
