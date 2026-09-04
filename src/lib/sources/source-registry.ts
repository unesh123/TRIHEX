import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type SourceTrustLevel =
  | "OFFICIAL_GOVERNMENT"
  | "OFFICIAL_VENDOR"
  | "COMMUNITY_VERIFIED"
  | "CURATED";

export type SourceHealthStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "STALE"
  | "RATE_LIMITED"
  | "OFFLINE";

export interface SourceDefinition {
  id: string;
  slug: string;
  name: string;
  baseUrl: string;
  sourceType: string;
  ingestionMethod: "REST_JSON" | "CSV_STREAM" | "XML_FEED" | "PULL_API";
  trustLevel: SourceTrustLevel;
  enabled: boolean;
  refreshIntervalMinutes: number;
  licenseNotes: string;
  lastSuccessfulSyncAt?: string;
  lastFailedSyncAt?: string;
  consecutiveFailures: number;
  healthStatus: SourceHealthStatus;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_REGISTERED_SOURCES: SourceDefinition[] = [
  {
    id: "src-nrb-forex",
    slug: "nrb-forex",
    name: "Nepal Rastra Bank Forex API",
    baseUrl: "https://www.nrb.org.np/api/forex/v1/rates",
    sourceType: "ECONOMIC_CENTRAL_BANK",
    ingestionMethod: "REST_JSON",
    trustLevel: "OFFICIAL_GOVERNMENT",
    enabled: true,
    refreshIntervalMinutes: 240, // 4 hours
    licenseNotes: "Public official central bank rates. Open for public and civic consumption.",
    consecutiveFailures: 0,
    healthStatus: "HEALTHY",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T08:00:00Z",
  },
  {
    id: "src-usgs-seismic",
    slug: "usgs-nepal-seismic",
    name: "USGS Nepal Geodetic Monitor (FDSN)",
    baseUrl: "https://earthquake.usgs.gov/fdsnws/event/1/query",
    sourceType: "SEISMIC_GEODETIC",
    ingestionMethod: "REST_JSON",
    trustLevel: "OFFICIAL_GOVERNMENT",
    enabled: true,
    refreshIntervalMinutes: 30,
    licenseNotes: "United States Geological Survey Public Domain data. Global seismological monitoring.",
    consecutiveFailures: 0,
    healthStatus: "HEALTHY",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T08:30:00Z",
  },
  {
    id: "src-prompts-chat",
    slug: "prompts-chat-archive",
    name: "prompts.chat Open CC0 Archive",
    baseUrl: "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv",
    sourceType: "COMMUNITY_PROMPTS",
    ingestionMethod: "CSV_STREAM",
    trustLevel: "COMMUNITY_VERIFIED",
    enabled: true,
    refreshIntervalMinutes: 720, // 12 hours
    licenseNotes: "Creative Commons Zero 1.0 (CC0-1.0) Public Domain Dedication. Author attribution preserved.",
    consecutiveFailures: 0,
    healthStatus: "HEALTHY",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T06:00:00Z",
  },
  {
    id: "src-resourify-deals",
    slug: "resourify-deals",
    name: "Resourify Software Deals Candidate Stream",
    baseUrl: "https://resourify.com/api/deals",
    sourceType: "DEAL_RADAR_CANDIDATE",
    ingestionMethod: "REST_JSON",
    trustLevel: "COMMUNITY_VERIFIED",
    enabled: true,
    refreshIntervalMinutes: 360,
    licenseNotes: "Candidate deals feed. Each deal must be vendor-verified before publishing.",
    consecutiveFailures: 0,
    healthStatus: "HEALTHY",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T09:00:00Z",
  },
  {
    id: "src-open-data-nepal",
    slug: "open-data-nepal",
    name: "Open Data Nepal Civic Catalog",
    baseUrl: "https://opendatanepal.com/api/3/action/package_search",
    sourceType: "CIVIC_DATASETS",
    ingestionMethod: "REST_JSON",
    trustLevel: "CURATED",
    enabled: true,
    refreshIntervalMinutes: 1440,
    licenseNotes: "Open civic research data under respective open government and academic licenses.",
    consecutiveFailures: 0,
    healthStatus: "HEALTHY",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
  },
];

let sourcesStore: SourceDefinition[] = [...INITIAL_REGISTERED_SOURCES];

export async function getAllSources(): Promise<SourceDefinition[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(schema.sources);
      if (rows.length === 0) {
        // Seed database
        for (const s of INITIAL_REGISTERED_SOURCES) {
          try {
            await db.insert(schema.sources).values({
              slug: s.slug,
              name: s.name,
              baseUrl: s.baseUrl,
              sourceType: s.sourceType,
              ingestionMethod: s.ingestionMethod,
              trustLevel: s.trustLevel,
              enabled: s.enabled,
              refreshIntervalMinutes: s.refreshIntervalMinutes,
              licenseNotes: s.licenseNotes,
              healthStatus: s.healthStatus,
              consecutiveFailures: s.consecutiveFailures,
            });
          } catch (insertErr) {
            console.error(`[sources] Failed to seed source ${s.slug}:`, insertErr);
          }
        }
        return [...sourcesStore];
      }

      sourcesStore = rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        baseUrl: r.baseUrl,
        sourceType: r.sourceType,
        ingestionMethod: r.ingestionMethod as any,
        trustLevel: r.trustLevel as any,
        enabled: r.enabled,
        refreshIntervalMinutes: r.refreshIntervalMinutes,
        licenseNotes: r.licenseNotes || "",
        lastSuccessfulSyncAt: r.lastSuccessfulSyncAt ? r.lastSuccessfulSyncAt.toISOString() : undefined,
        lastFailedSyncAt: r.lastFailedSyncAt ? r.lastFailedSyncAt.toISOString() : undefined,
        consecutiveFailures: r.consecutiveFailures,
        healthStatus: r.healthStatus as any,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));

      return [...sourcesStore];
    } catch (e) {
      console.error("[sources] DB query failed, falling back to cache:", e);
    }
  }

  return [...sourcesStore];
}

export function getSourceBySlug(slug: string): SourceDefinition | undefined {
  return sourcesStore.find((s) => s.slug === slug);
}

export async function updateSourceStatus(
  slug: string,
  status: SourceHealthStatus,
  success: boolean
): Promise<void> {
  const source = sourcesStore.find((s) => s.slug === slug);
  const now = new Date();

  if (source) {
    source.healthStatus = status;
    source.updatedAt = now.toISOString();

    if (success) {
      source.lastSuccessfulSyncAt = now.toISOString();
      source.consecutiveFailures = 0;
    } else {
      source.lastFailedSyncAt = now.toISOString();
      source.consecutiveFailures += 1;
    }
  }

  const db = getDb();
  if (db) {
    try {
      await db
        .update(schema.sources)
        .set({
          healthStatus: status,
          lastSuccessfulSyncAt: success ? now : undefined,
          lastFailedSyncAt: !success ? now : undefined,
          consecutiveFailures: success ? 0 : (source?.consecutiveFailures || 1),
          updatedAt: now,
        })
        .where(eq(schema.sources.slug, slug));
    } catch (e) {
      console.error(`[sources] Failed to update DB for source ${slug}:`, e);
    }
  }
}

/** Reset in-memory sources for tests */
export function resetSourcesStoreForTest(items?: SourceDefinition[]): void {
  sourcesStore = items ? [...items] : [...INITIAL_REGISTERED_SOURCES];
}
