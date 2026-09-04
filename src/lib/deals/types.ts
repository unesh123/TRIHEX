/**
 * Deal Radar Data Models & Status Enums
 */

export type DealType =
  | "FREE_TRIAL"
  | "CREDITS"
  | "DISCOUNT"
  | "PROMO_CODE"
  | "FREEBIE"
  | "STUDENT_TIER";

export type DealCandidateStatus =
  | "DISCOVERED"
  | "ENRICHING"
  | "VERIFICATION_REQUIRED"
  | "VERIFIED"
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "EXPIRED"
  | "BROKEN"
  | "CHANGED";

export type DealApprovalType = "FREE" | "PAID";

export interface DealRevision {
  id: string;
  candidateId: string;
  field: string;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;
  changedBy: string;
  reason?: string;
  createdAt: string;
}

export interface VerificationEvidenceItem {
  field: string;
  candidateValue?: string;
  detectedValue?: string;
  match: boolean;
  scoreContribution: number;
  reason: string;
}

export interface DealVerificationReport {
  score: number; // 0 - 100
  vendorUrl: string;
  verifiedAt: string;
  isOfficialVendorDomain: boolean;
  httpStatus: number;
  claimsMatch: boolean;
  notes: string;
  detectedVendorTextSnippet?: string;
  detectedExpirationDate?: string;
  requiresCreditCard?: boolean;
  evidence?: VerificationEvidenceItem[];
}

export type SaleRightsStatus =
  | "FREE_LINK_ONLY"
  | "COMMERCIAL_RESELL_ALLOWED"
  | "TRIHEX_SERVICE"
  | "OWNER_ASSET"
  | "UNKNOWN";

export interface DealCandidate {
  id: string;
  sourceId: string;
  sourceExternalId?: string;
  title: string;
  slug: string;
  vendor: string;
  summary: string;
  dealType: DealType;
  detectedValueNprMinor?: number; // minor units e.g. 500000 = NPR 5,000
  currency?: string;
  promoCode?: string;
  eligibility?: string; // e.g. "New accounts only", "Students with .edu email"
  cardRequired: boolean;
  sourceClaimUrl: string;
  officialVendorUrl?: string;
  discoveredAt: string;
  validFrom?: string;
  validUntil?: string;
  lastVerifiedAt?: string;
  verificationScore: number;
  verificationReport?: DealVerificationReport;
  vendorClaimSummary?: string;
  status: DealCandidateStatus;
  approvalType?: DealApprovalType;
  saleRightsStatus?: SaleRightsStatus;
  assignedProductId?: string; // if approved as paid bundle on TRIHEX
  revisions: DealRevision[];
  category: "AI_DEV" | "CLOUD" | "DESIGN" | "PRODUCTIVITY" | "EDUCATION" | "INFRASTRUCTURE";
  createdAt: string;
  updatedAt: string;
}

export interface ResourifyRawItem {
  id: string;
  title: string;
  slug?: string;
  companyName: string;
  description: string;
  dealType?: string;
  couponCode?: string;
  dealValue?: string;
  requirements?: string;
  requiresCreditCard?: boolean;
  dealUrl: string;
  officialUrl?: string;
  expiryDate?: string;
  category?: string;
}
