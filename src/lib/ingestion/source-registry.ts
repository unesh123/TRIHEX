import { Source } from "./types";

export const INITIAL_SOURCES: Source[] = [
  {
    id: "src-resourify-deals",
    name: "Resourify Software Deals & Credits",
    slug: "resourify-deals",
    baseUrl: "https://resourify.com",
    sourceType: "DEALS",
    ingestionMethod: "JSON",
    trustLevel: "COMMUNITY",
    enabled: true,
    refreshIntervalMinutes: 180,
    requiresVendorVerification: true,
    allowFullContent: false,
    licenseNotes: "Third-party deals catalog. Must be independently verified against vendor source before publishing.",
    consecutiveFailures: 0,
    status: "HEALTHY",
  },
  {
    id: "src-prompts-chat",
    name: "prompts.chat Public MCP Archive",
    slug: "prompts-chat",
    baseUrl: "https://prompts.chat",
    sourceType: "PROMPTS",
    ingestionMethod: "MCP",
    trustLevel: "VERIFIED_PARTNER",
    enabled: true,
    refreshIntervalMinutes: 360,
    requiresVendorVerification: false,
    allowFullContent: true,
    licenseNotes: "Creative Commons CC0 1.0 Universal (Public Domain Dedication). Preserve author provenance.",
    consecutiveFailures: 0,
    status: "HEALTHY",
  },
  {
    id: "src-trihex-curated-prompts",
    name: "TRIHEX Original Curated Prompts",
    slug: "trihex-prompts",
    baseUrl: "https://trihexdigital.shop",
    sourceType: "PROMPTS",
    ingestionMethod: "MANUAL",
    trustLevel: "OFFICIAL",
    enabled: true,
    refreshIntervalMinutes: 1440,
    requiresVendorVerification: false,
    allowFullContent: true,
    licenseNotes: "Original TRIHEX Digital Engineering prompts for C#, Laravel, Next.js, Video, UGC, and Sales.",
    consecutiveFailures: 0,
    status: "HEALTHY",
  },
  {
    id: "src-nrb-forex",
    name: "Nepal Rastra Bank Official Forex Rates",
    slug: "nrb-forex",
    baseUrl: "https://www.nrb.org.np",
    sourceType: "PUBLIC_DATA",
    ingestionMethod: "OFFICIAL_API",
    trustLevel: "OFFICIAL",
    enabled: true,
    refreshIntervalMinutes: 60,
    requiresVendorVerification: false,
    allowFullContent: true,
    licenseNotes: "Official Open Government Data published by Central Bank of Nepal (NRB).",
    consecutiveFailures: 0,
    status: "HEALTHY",
  },
  {
    id: "src-usgs-nepal-seismic",
    name: "USGS FDSN Earthquake Feed (Nepal)",
    slug: "usgs-nepal-seismic",
    baseUrl: "https://earthquake.usgs.gov",
    sourceType: "PUBLIC_DATA",
    ingestionMethod: "OFFICIAL_API",
    trustLevel: "OFFICIAL",
    enabled: true,
    refreshIntervalMinutes: 15,
    requiresVendorVerification: false,
    allowFullContent: true,
    licenseNotes: "USGS Public Domain seismic hazard data for Nepal coordinates [26-31N, 80-89E].",
    consecutiveFailures: 0,
    status: "HEALTHY",
  },
  {
    id: "src-open-data-nepal",
    name: "Open Data Nepal Civic Datasets",
    slug: "open-data-nepal",
    baseUrl: "https://opendatanepal.com",
    sourceType: "PUBLIC_DATA",
    ingestionMethod: "OFFICIAL_API",
    trustLevel: "OFFICIAL",
    enabled: true,
    refreshIntervalMinutes: 720,
    requiresVendorVerification: false,
    allowFullContent: true,
    licenseNotes: "Public Civic Datasets under Open Database License (ODbL) / Open Data Commons.",
    consecutiveFailures: 0,
    status: "HEALTHY",
  },
  {
    id: "src-sdny-public-dockets",
    name: "SDNY Federal Court Public Dockets",
    slug: "sdny-public-dockets",
    baseUrl: "https://www.courtlistener.com",
    sourceType: "PUBLIC_RECORDS",
    ingestionMethod: "OFFICIAL_API",
    trustLevel: "OFFICIAL",
    enabled: true,
    refreshIntervalMinutes: 1440,
    requiresVendorVerification: false,
    allowFullContent: true,
    licenseNotes: "US Federal Court unsealed judicial records and exhibits (e.g., 15-cv-07433). Public domain under 17 U.S.C. 105.",
    consecutiveFailures: 0,
    status: "HEALTHY",
  },
];

export function getSourceBySlug(slug: string): Source | undefined {
  return INITIAL_SOURCES.find((s) => s.slug === slug);
}

export function getSourceById(id: string): Source | undefined {
  return INITIAL_SOURCES.find((s) => s.id === id);
}

export function listSources(filter?: { sourceType?: Source["sourceType"]; enabled?: boolean }): Source[] {
  return INITIAL_SOURCES.filter((s) => {
    if (filter?.sourceType && s.sourceType !== filter.sourceType) return false;
    if (filter?.enabled !== undefined && s.enabled !== filter.enabled) return false;
    return true;
  });
}
