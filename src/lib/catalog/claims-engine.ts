/**
 * TRIHEX Claim Verification & Entitlement Engine
 * 
 * Provides verifiable, audited product assertions (entitlements, warranty, activation,
 * features, limitations, and expiration dates) to ensure zero false promises on the storefront.
 */

export type ClaimStatus = "VERIFIED" | "NEEDS_REVIEW" | "EXPIRED" | "REJECTED";
export type ClaimCategory =
  | "entitlement"
  | "warranty"
  | "activation"
  | "feature"
  | "limitation";

export interface ProductClaim {
  id: string;
  productSlug: string;
  claim: string;
  category: ClaimCategory;
  status: ClaimStatus;
  sourceUrl?: string;
  verifiedAt: string; // ISO date string (YYYY-MM-DD)
  expiresAt?: string; // Optional expiry date (YYYY-MM-DD)
  reviewedBy?: string;
  notes?: string;
}

export const AUTHORITATIVE_CLAIMS: ProductClaim[] = [
  // ChatGPT Plus
  {
    id: "clm-chatgpt-1",
    productSlug: "chatgpt-plus-1-month-fw",
    claim: "Access to GPT-4o, OpenAI o1, Canvas, and Advanced Voice Mode",
    category: "feature",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Operations",
  },
  {
    id: "clm-chatgpt-2",
    productSlug: "chatgpt-plus-1-month-fw",
    claim: "Private account or dedicated slot delivered via email credentials",
    category: "activation",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Operations",
  },
  {
    id: "clm-chatgpt-3",
    productSlug: "chatgpt-plus-1-month-fw",
    claim: "Full replacement warranty during active 30-day subscription cycle",
    category: "warranty",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Legal",
  },

  // Cursor Pro
  {
    id: "clm-cursor-1",
    productSlug: "cursor-pro-12m",
    claim: "500 fast premium requests per month on Claude 3.5 Sonnet & GPT-4o",
    category: "entitlement",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Technical Team",
  },
  {
    id: "clm-cursor-2",
    productSlug: "cursor-pro-12m",
    claim: "Unlimited slow requests included after fast monthly quota",
    category: "feature",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Technical Team",
  },
  {
    id: "clm-cursor-3",
    productSlug: "cursor-pro-12m",
    claim: "Direct workspace activation or dedicated account handover",
    category: "activation",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Operations",
  },

  // Claude Code
  {
    id: "clm-claude-1",
    productSlug: "claude-code-api-access",
    claim: "Anthropic Claude 3.7 Sonnet & 3.5 Sonnet terminal developer environment",
    category: "feature",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Technical Team",
  },
  {
    id: "clm-claude-2",
    productSlug: "claude-code-api-access",
    claim: "Pre-configured CLI access key with dedicated usage quota",
    category: "activation",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Technical Team",
  },

  // Google AI Pro (Gemini)
  {
    id: "clm-gemini-1",
    productSlug: "gemini-pro-18-months-link",
    claim: "2 Million Token context window with Gemini Advanced 1.5 Pro & Deep Research",
    category: "feature",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Technical Team",
  },
  {
    id: "clm-gemini-2",
    productSlug: "gemini-pro-18-months-link",
    claim: "Includes 5TB expanded Google Drive cloud storage entitlement",
    category: "entitlement",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Operations",
  },
  {
    id: "clm-gemini-3",
    productSlug: "gemini-pro-18-months-link",
    claim: "Activated directly onto customer's existing Google account via invite link",
    category: "activation",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Operations",
  },

  // ElevenLabs
  {
    id: "clm-eleven-1",
    productSlug: "elevenlabs-creator-shared",
    claim: "Voice cloning, ultra-realistic dubbing, and commercial audio licensing",
    category: "feature",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Operations",
  },

  // Canva Pro
  {
    id: "clm-canva-1",
    productSlug: "canva-pro-1-year",
    claim: "Full library of 100M+ stock photos, videos, and Brand Kit presets",
    category: "feature",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Operations",
  },
  {
    id: "clm-canva-2",
    productSlug: "canva-pro-1-year",
    claim: "Enterprise team invitation link added directly to existing email",
    category: "activation",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Operations",
  },

  // AI Money Maker Vault Course
  {
    id: "clm-aimoney-1",
    productSlug: "ai-money-maker-digital-course-2026",
    claim: "50+ complete prompt frameworks, automation templates, and funnel blueprints",
    category: "feature",
    status: "VERIFIED",
    verifiedAt: "2026-09-01",
    reviewedBy: "TRIHEX Operations",
  },
  {
    id: "clm-aimoney-2",
    productSlug: "ai-money-maker-digital-course-2026",
    claim: "Encrypted package delivered with expiring single-use download token",
    category: "activation",
    status: "VERIFIED",
    verifiedAt: "2026-09-04",
    reviewedBy: "TRIHEX Security",
  },

  // pCloud Promo (Past Promotion - Expired Aug 22, 2026)
  {
    id: "clm-pcloud-1",
    productSlug: "pcloud-500gb-90-days-voucher",
    claim: "500GB 90-day cloud voucher promo campaign",
    category: "entitlement",
    status: "EXPIRED",
    verifiedAt: "2026-08-01",
    expiresAt: "2026-08-22",
    reviewedBy: "TRIHEX Operations",
    notes: "Vendor promo window concluded on August 22, 2026. Deal retired from catalog.",
  },
];

/**
 * Checks if a date string (YYYY-MM-DD) is in the past compared to reference date or today
 */
export function isDateExpired(dateStr?: string, referenceDate = new Date()): boolean {
  if (!dateStr) return false;
  const expiry = new Date(dateStr + "T23:59:59Z");
  return expiry.getTime() < referenceDate.getTime();
}

/**
 * Retrieves all claims registered for a given product slug
 */
export function getClaimsForProduct(productSlug: string): ProductClaim[] {
  return AUTHORITATIVE_CLAIMS.filter((c) => c.productSlug === productSlug);
}

/**
 * Retrieves only active, verified claims for a given product slug, omitting any expired ones
 */
export function getVerifiedClaimsForProduct(productSlug: string): ProductClaim[] {
  const now = new Date();
  return AUTHORITATIVE_CLAIMS.filter((c) => {
    if (c.productSlug !== productSlug) return false;
    if (c.status !== "VERIFIED") return false;
    if (c.expiresAt && isDateExpired(c.expiresAt, now)) return false;
    return true;
  });
}

/**
 * Audit check: returns all claims requiring review or expired claims that need status updates
 */
export function auditCatalogClaims(): {
  needsReview: ProductClaim[];
  expired: ProductClaim[];
  verifiedCount: number;
} {
  const now = new Date();
  const needsReview: ProductClaim[] = [];
  const expired: ProductClaim[] = [];
  let verifiedCount = 0;

  for (const claim of AUTHORITATIVE_CLAIMS) {
    if (claim.status === "EXPIRED" || (claim.expiresAt && isDateExpired(claim.expiresAt, now))) {
      expired.push(claim);
    } else if (claim.status === "NEEDS_REVIEW") {
      needsReview.push(claim);
    } else if (claim.status === "VERIFIED") {
      verifiedCount++;
    }
  }

  return { needsReview, expired, verifiedCount };
}
