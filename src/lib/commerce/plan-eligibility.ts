/**
 * TRIHEX DIGITAL — Commerce Eligibility Engine (Phase 7.5.14)
 * Single source of truth for whether a product or plan can be purchased immediately,
 * requires availability confirmation, or is blocked for compliance.
 *
 * Used across catalogue cards, PDP purchase panels, cart, checkout, and JSON-LD.
 */

export type PurchaseAction =
  | "BUY_NOW"
  | "CHECK_AVAILABILITY"
  | "CONTACT_SUPPORT"
  | "UNAVAILABLE"
  | "OWNER_REVIEW";

export interface PlanEligibilityInput {
  purchasable?: boolean;
  visibility?: string;
  stockQty?: number | null;
  complianceStatus?: string;
  productStatus?: string;
  needsDataVerification?: boolean;
  availability?: "available" | "under_review" | "out_of_stock" | string;
}

export interface PlanEligibility {
  allowed: boolean;
  status: "available" | "under_review" | "out_of_stock" | "blocked";
  primaryAction: PurchaseAction;
  ctaLabel: string;
  reason?: string;
}

export function canPurchasePlan(input: PlanEligibilityInput): PlanEligibility {
  // 1. Out of stock check
  if (input.stockQty === 0 || input.availability === "out_of_stock" || input.visibility === "OUT_OF_STOCK") {
    return {
      allowed: false,
      status: "out_of_stock",
      primaryAction: "CHECK_AVAILABILITY",
      ctaLabel: "Confirm Availability",
      reason: "Current batch is fully reserved. Enquire to confirm incoming availability.",
    };
  }

  // 2. Compliance blocks
  if (
    input.complianceStatus === "REJECTED" ||
    input.productStatus === "BLOCKED" ||
    input.visibility === "BLOCKED"
  ) {
    return {
      allowed: false,
      status: "blocked",
      primaryAction: "UNAVAILABLE",
      ctaLabel: "Unavailable",
      reason: "This product line is restricted for resale compliance.",
    };
  }

  // 3. Draft / under review / data verification
  if (
    input.needsDataVerification ||
    input.productStatus === "DRAFT" ||
    input.visibility === "AVAILABILITY_UNDER_REVIEW" ||
    input.availability === "under_review" ||
    input.purchasable === false
  ) {
    return {
      allowed: false,
      status: "under_review",
      primaryAction: "CHECK_AVAILABILITY",
      ctaLabel: "Confirm Availability",
      reason: "Supplier batch under review. Availability confirmed before payment.",
    };
  }

  // 4. Approved & Purchasable
  return {
    allowed: true,
    status: "available",
    primaryAction: "BUY_NOW",
    ctaLabel: "Buy Now",
  };
}
