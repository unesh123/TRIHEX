export type VaultEntityType =
  | "PRODUCT"
  | "DEAL"
  | "FREE_RESOURCE"
  | "PROMPT_PACK"
  | "GUIDE"
  | "RESEARCH"
  | "TOOL";

export type VaultPriceMode = "PAID" | "FREE" | "EXTERNAL";

export type VaultProvenance =
  | "TRIHEX ORIGINAL"
  | "TRIHEX PRODUCT"
  | "VERIFIED EXTERNAL DEAL"
  | "FREE EXTERNAL RESOURCE"
  | "OPEN RESOURCE"
  | "PUBLIC RECORD";

export type VaultTabId =
  | "all"
  | "featured"
  | "premium"
  | "deals"
  | "free"
  | "prompts"
  | "developer"
  | "guides"
  | "research";

export interface VaultEntry {
  id: string;
  slug: string;
  entityType: VaultEntityType;
  entityId: string;
  title: string;
  summary: string;
  category: string;
  tabCategory: VaultTabId;
  image?: string;
  priceMode: VaultPriceMode;
  displayPrice: string;
  compareAtPrice?: string;
  sourceName: string;
  provenance: VaultProvenance;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | "PENDING";
  verificationScore?: number;
  freshnessStatus: "LIVE" | "CACHED" | "STALE" | "EXPIRED";
  publishedAt: string;
  validUntil?: string;
  destinationUrl: string;
  badgeText?: string;
  highlights?: string[];
  isFeatured?: boolean;
}

export interface VaultFilterOptions {
  query?: string;
  tab?: VaultTabId;
  priceMode?: VaultPriceMode | "ALL";
  provenance?: VaultProvenance | "ALL";
  verifiedOnly?: boolean;
  expiringSoon?: boolean;
}
