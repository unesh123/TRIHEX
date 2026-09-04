export type ResourceCategory =
  | "SECURITY_ADVISORY"
  | "DEVELOPER_CHEAT_SHEET"
  | "PUBLIC_DATASET"
  | "OPEN_TOOL"
  | "CIVIC_RECORD";

export type ResourceRightsTag =
  | "PUBLIC_DOMAIN"
  | "OPEN_LICENSE"
  | "LINK_ONLY"
  | "TRIHEX_ORIGINAL";

export interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  category: ResourceCategory;
  rightsTag: ResourceRightsTag;
  licenseName: string;
  summary: string;
  format: "PDF" | "MARKDOWN" | "CSV" | "GEOJSON" | "WEB_TOOL" | "CLI";
  fileSizeBytes?: number;
  officialUrl: string;
  downloadUrl?: string;
  verifiedBy: string;
  lastAuditedAt: string;
  tags: string[];
  isPinned?: boolean;
}

export interface ResourceFilterOptions {
  category?: ResourceCategory | "ALL";
  rightsTag?: ResourceRightsTag | "ALL";
  query?: string;
}
