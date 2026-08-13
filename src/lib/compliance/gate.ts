/**
 * Compliance gate — server-side and DB-enforced publication rules.
 * Admins cannot bypass these with UI-only changes.
 */

export const ComplianceStatus = {
  UNREVIEWED: "UNREVIEWED",
  DOCUMENTS_REQUIRED: "DOCUMENTS_REQUIRED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;
export type ComplianceStatus =
  (typeof ComplianceStatus)[keyof typeof ComplianceStatus];

export const SupplyAuthorizationType = {
  AUTHORIZED_RESELLER: "AUTHORIZED_RESELLER",
  OFFICIAL_TEAM_SEAT: "OFFICIAL_TEAM_SEAT",
  OFFICIAL_BUSINESS_SEAT: "OFFICIAL_BUSINESS_SEAT",
  OFFICIAL_REDEEM_CODE: "OFFICIAL_REDEEM_CODE",
  CUSTOMER_EMAIL_ACTIVATION: "CUSTOMER_EMAIL_ACTIVATION",
  API_POWERED_SERVICE: "API_POWERED_SERVICE",
  OWN_DIGITAL_PRODUCT: "OWN_DIGITAL_PRODUCT",
  MANAGED_IMPLEMENTATION_SERVICE: "MANAGED_IMPLEMENTATION_SERVICE",
  UNKNOWN: "UNKNOWN",
} as const;
export type SupplyAuthorizationType =
  (typeof SupplyAuthorizationType)[keyof typeof SupplyAuthorizationType];

export const VendorProofStatus = {
  NOT_UPLOADED: "NOT_UPLOADED",
  PENDING_REVIEW: "PENDING_REVIEW",
  VERIFIED: "VERIFIED",
  EXPIRED: "EXPIRED",
  REJECTED: "REJECTED",
} as const;
export type VendorProofStatus =
  (typeof VendorProofStatus)[keyof typeof VendorProofStatus];

export const ProductStatus = {
  DRAFT: "DRAFT",
  BLOCKED: "BLOCKED",
  PUBLIC: "PUBLIC",
  ARCHIVED: "ARCHIVED",
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export interface ComplianceRecord {
  complianceStatus: ComplianceStatus;
  supplyAuthorizationType: SupplyAuthorizationType;
  vendorProofStatus: VendorProofStatus;
  proofExpiryDate: Date | string | null;
  productStatus: ProductStatus;
}

export interface PublicationDecision {
  canPublish: boolean;
  canPurchase: boolean;
  reasons: string[];
}

/**
 * Only APPROVED + VERIFIED (non-expired) products may become PUBLIC / purchasable.
 * OWN_DIGITAL_PRODUCT and MANAGED_IMPLEMENTATION_SERVICE may skip vendor proof
 * if complianceStatus is APPROVED (TRIHEX-owned supply).
 */
export function evaluatePublication(record: ComplianceRecord): PublicationDecision {
  const reasons: string[] = [];
  const now = new Date();

  if (record.productStatus === "BLOCKED") {
    reasons.push("Product is BLOCKED and cannot be published or purchased.");
    return { canPublish: false, canPurchase: false, reasons };
  }

  if (record.complianceStatus !== "APPROVED") {
    reasons.push(
      `Compliance status is ${record.complianceStatus}; only APPROVED products may be public.`,
    );
  }

  const ownedSupply =
    record.supplyAuthorizationType === "OWN_DIGITAL_PRODUCT" ||
    record.supplyAuthorizationType === "MANAGED_IMPLEMENTATION_SERVICE" ||
    record.supplyAuthorizationType === "API_POWERED_SERVICE";

  if (!ownedSupply && record.vendorProofStatus !== "VERIFIED") {
    reasons.push(
      `Vendor proof is ${record.vendorProofStatus}; VERIFIED authorization required.`,
    );
  }

  if (record.vendorProofStatus === "EXPIRED") {
    reasons.push("Vendor authorization has expired.");
  }

  if (record.proofExpiryDate) {
    const expiry = new Date(record.proofExpiryDate);
    if (expiry < now) {
      reasons.push("Authorization proof expiry date has passed.");
    }
  }

  if (record.supplyAuthorizationType === "UNKNOWN") {
    reasons.push("Supply authorization type is UNKNOWN.");
  }

  const canPublish = reasons.length === 0;

  // Purchase requires PUBLIC + compliance OK
  const purchaseOk =
    canPublish && record.productStatus === "PUBLIC";

  if (!purchaseOk && record.productStatus !== "PUBLIC") {
    if (!reasons.includes("Product is not PUBLIC.")) {
      reasons.push("Product is not PUBLIC.");
    }
  }

  return {
    canPublish,
    canPurchase: purchaseOk,
    reasons: purchaseOk ? [] : reasons,
  };
}

/** Brands/products that must default to BLOCKED per policy */
export const DEFAULT_BLOCKED_BRAND_KEYS = [
  "cursor",
  "chatgpt-consumer",
  "claude-personal",
  "canva-edu",
  "adobe-individual",
] as const;

export function isDefaultBlockedProduct(opts: {
  brandSlug?: string;
  productName: string;
  supplyAuthorizationType: SupplyAuthorizationType;
  sourceListingText?: string;
}): { blocked: boolean; reason: string | null } {
  const name = opts.productName.toLowerCase();
  const source = (opts.sourceListingText ?? "").toLowerCase();
  const brand = (opts.brandSlug ?? "").toLowerCase();

  if (brand === "cursor" || name.includes("cursor")) {
    return {
      blocked: true,
      reason:
        "Cursor publicly states that third-party resellers are not authorized. Default BLOCKED.",
    };
  }

  if (
    (name.includes("canva") && (name.includes("edu") || source.includes("edu"))) ||
    brand === "canva-edu"
  ) {
    return {
      blocked: true,
      reason: "Canva EDU must never be sold as a commercial consumer product.",
    };
  }

  if (
    (name.includes("chatgpt") || name.includes("gpt plus") || name.includes("chat gpt")) &&
    opts.supplyAuthorizationType !== "API_POWERED_SERVICE" &&
    opts.supplyAuthorizationType !== "OFFICIAL_BUSINESS_SEAT"
  ) {
    return {
      blocked: true,
      reason:
        "ChatGPT consumer accounts are BLOCKED. Only explicitly permitted business/API/partner models may be activated.",
    };
  }

  if (
    name.includes("claude") &&
    (name.includes("personal") ||
      opts.supplyAuthorizationType === "UNKNOWN" ||
      source.includes("personal"))
  ) {
    return {
      blocked: true,
      reason:
        "Claude personal/consumer accounts are BLOCKED. Only official business seats, enterprise, or permitted API services may be activated.",
    };
  }

  if (
    (name.includes("adobe") || brand === "adobe") &&
    opts.supplyAuthorizationType !== "AUTHORIZED_RESELLER"
  ) {
    return {
      blocked: true,
      reason:
        "Adobe individual-account products are BLOCKED unless TRIHEX has authorized reseller status.",
    };
  }

  return { blocked: false, reason: null };
}

export const COMPLIANCE_FOOTER_DISCLAIMER =
  "TRIHEX DIGITAL is an independent digital-services retailer. Third-party product names and trademarks belong to their respective owners. Affiliation or authorization is stated only where verified.";

/** Shown near prices / checkout — rates can move with supply. */
export const PRICE_INQUIRY_NOTICE =
  "Prices can be lower or higher at times depending on availability and supply. Please inquire about the product before proceeding to buy.";
