export interface OpenDataset {
  id: string;
  title: string;
  slug: string;
  category: "ECONOMY" | "DEMOGRAPHICS" | "EDUCATION" | "HEALTH" | "INFRASTRUCTURE" | "ENERGY" | "ENVIRONMENT";
  organization: string;
  description: string;
  license: string;
  formats: string[]; // e.g. ["CSV", "JSON", "GEOJSON", "PDF"]
  lastUpdated: string;
  recordsCount?: number;
  downloadUrl?: string;
  coordinates?: { lat: number; lng: number };
}

export const VERIFIED_NEPAL_DATASETS: OpenDataset[] = [
  {
    id: "ds-nso-census-2021",
    title: "Nepal National Population & Housing Census 2021 (Demographics by District)",
    slug: "nepal-census-2021-districts",
    category: "DEMOGRAPHICS",
    organization: "National Statistics Office (NSO Nepal)",
    description: "Complete district-level census data covering 29.16 million citizens across 77 districts, gender distributions, literacy rates, household amenities, and urbanization indicators.",
    license: "Open Government Data (Nepal)",
    formats: ["CSV", "JSON", "XLSX"],
    lastUpdated: "2024-06-15",
    recordsCount: 77,
    downloadUrl: "https://censusnepal.cbs.gov.np",
    coordinates: { lat: 27.7172, lng: 85.3240 },
  },
  {
    id: "ds-nrb-macroeconomic-indicators",
    title: "Current Macroeconomic & Financial Situation of Nepal (Monthly Balance of Payments)",
    slug: "nrb-macroeconomic-indicators",
    category: "ECONOMY",
    organization: "Nepal Rastra Bank",
    description: "Monthly macroeconomic data: remittance inflows, foreign exchange reserves in USD & NPR, inflation metrics, export-import values, and trade deficit tracking.",
    license: "Public Domain (NRB)",
    formats: ["CSV", "PDF"],
    lastUpdated: "2026-02-01",
    recordsCount: 120,
    downloadUrl: "https://www.nrb.org.np/publications",
  },
  {
    id: "ds-nea-hydro-generation",
    title: "Nepal Hydroelectric Power Plants Capacity & Daily Grid Generation",
    slug: "nepal-hydroelectric-generation-grid",
    category: "ENERGY",
    organization: "Nepal Electricity Authority (NEA)",
    description: "Operational hydroelectric generation capacity (Upper Tamakoshi, Trishuli, Kaligandaki, Marshyangdi) and seasonal cross-border power transmission to India.",
    license: "Open Government Data",
    formats: ["JSON", "CSV"],
    lastUpdated: "2025-11-20",
    recordsCount: 142,
    coordinates: { lat: 27.818, lng: 86.136 }, // Upper Tamakoshi
  },
  {
    id: "ds-nepal-administrative-boundaries",
    title: "Nepal Administrative Boundaries GeoJSON (Provinces, Districts & Municipalities)",
    slug: "nepal-administrative-boundaries-geojson",
    category: "INFRASTRUCTURE",
    organization: "Survey Department of Nepal",
    description: "High-precision vector polygons for 7 provinces, 77 districts, and 753 local level government units (Gaupalika and Nagarpalika).",
    license: "ODbL 1.0",
    formats: ["GEOJSON", "SHP", "KML"],
    lastUpdated: "2025-08-10",
    recordsCount: 753,
    coordinates: { lat: 28.3949, lng: 84.1240 },
  },
  {
    id: "ds-nepal-hospitals-health-facilities",
    title: "Nepal Public Hospitals, Primary Health Centers & ICU Beds Registry",
    slug: "nepal-hospitals-health-facilities-registry",
    category: "HEALTH",
    organization: "Ministry of Health and Population (MoHP)",
    description: "National registry of hospitals, tertiary health complexes, bed counts, emergency ventilator availability, and geographic coordinates across 7 provinces.",
    license: "Open Data Commons",
    formats: ["CSV", "JSON"],
    lastUpdated: "2025-10-05",
    recordsCount: 1410,
    coordinates: { lat: 27.700, lng: 85.314 }, // Bir Hospital Kathmandu
  },
  {
    id: "ds-nepal-tourism-arrivals",
    title: "Annual Tourist Arrivals by Nationality, Purpose & Port of Entry (TIA & Land Borders)",
    slug: "nepal-tourist-arrivals-statistics",
    category: "ECONOMY",
    organization: "Nepal Tourism Board (NTB)",
    description: "Disaggregated tourism statistics covering trekking permits, mountaineering royalties, avg length of stay, and foreign tourist arrivals via Tribhuvan International Airport.",
    license: "Public Domain",
    formats: ["CSV", "XLSX"],
    lastUpdated: "2026-01-15",
    recordsCount: 240,
    coordinates: { lat: 27.6966, lng: 85.3590 }, // TIA Airport
  },
];

export function getOpenDatasets(category?: string): OpenDataset[] {
  if (!category || category === "ALL") return [...VERIFIED_NEPAL_DATASETS];
  return VERIFIED_NEPAL_DATASETS.filter((d) => d.category === category);
}

export function getDatasetBySlug(slug: string): OpenDataset | undefined {
  return VERIFIED_NEPAL_DATASETS.find((d) => d.slug === slug);
}
