/**
 * Source Registry & Ingestion Engine Types
 */

export type SourceType =
  | "DEALS"
  | "PROMPTS"
  | "SKILLS"
  | "PUBLIC_DATA"
  | "PUBLIC_RECORDS"
  | "NEWS"
  | "DOCUMENTS"
  | "MAP_DATA"
  | "GUIDES_SOURCE";

export type IngestionMethod =
  | "OFFICIAL_API"
  | "MCP"
  | "RSS"
  | "ATOM"
  | "JSON"
  | "SITEMAP"
  | "PUBLIC_HTML"
  | "MANUAL";

export type TrustLevel =
  | "OFFICIAL"
  | "VERIFIED_PARTNER"
  | "COMMUNITY"
  | "EXPERIMENTAL"
  | "UNTRUSTED";

export interface Source {
  id: string;
  name: string;
  slug: string;
  baseUrl: string;
  sourceType: SourceType;
  ingestionMethod: IngestionMethod;
  trustLevel: TrustLevel;
  enabled: boolean;
  refreshIntervalMinutes: number;
  robotsReviewedAt?: string;
  termsReviewedAt?: string;
  licenseNotes?: string;
  allowFullContent: boolean;
  requiresVendorVerification: boolean;
  lastSuccessfulSync?: string;
  lastFailedSync?: string;
  consecutiveFailures: number;
  status: "HEALTHY" | "DEGRADED" | "SOURCE_RESTRICTED" | "PARSER_DRIFT_SUSPECTED";
}

export type IngestionRunStatus =
  | "RUNNING"
  | "SUCCESS"
  | "PARTIAL"
  | "FAILED"
  | "PARSER_DRIFT_SUSPECTED";

export interface IngestionRun {
  id: string;
  sourceId: string;
  startedAt: string;
  completedAt?: string;
  status: IngestionRunStatus;
  itemsFetched: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsUnchanged: number;
  itemsRejected: number;
  errors: string[];
  latencyMs?: number;
}
