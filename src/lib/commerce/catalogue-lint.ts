import type { ProductVariantContract } from "./catalogue-contract";

export function isInternalOrTestSku(skuOrSlug: string): boolean {
  if (!skuOrSlug) return false;
  return /test[-_ ]?sku|dummy|lorem|concurrency[-_ ]?test|^test[-_]|[-_]test$|\btest\b/i.test(
    skuOrSlug,
  );
}

export interface LintIssue {
  code: string;
  message: string;
}

export function lintVariant(v: {
  sku: string;
  name?: string;
  variantName?: string;
  availabilityStatus?: string;
  supplierId?: string | null;
  accessType?: string;
  authorizationStatus?: string;
  entitlement?: Record<string, unknown>;
  warrantyPolicyCode?: string;
  warrantyDays?: number;
  compareAtNpr?: number | null;
  sellPriceNpr?: number;
  sellPriceNprMinor?: number;
  costNprMinor?: number;
  supplierSnapshotPresent?: boolean;
  durationLabel?: string | null;
  unverifiedOfficialClaim?: boolean;
}): LintIssue[] {
  const issues: LintIssue[] = [];
  if (isInternalOrTestSku(v.sku) || (v.name && isInternalOrTestSku(v.name))) {
    issues.push({
      code: "INTERNAL_TEST_SKU",
      message: "Internal/test SKU must not be public",
    });
  }
  if (
    v.availabilityStatus === "available" &&
    !v.supplierId &&
    v.accessType !== "service" &&
    v.accessType !== "digital_asset"
  ) {
    issues.push({
      code: "MISSING_SUPPLIER_SNAPSHOT",
      message: "Available third-party SKU must have a verified supplier record",
    });
  }
  if (
    v.unverifiedOfficialClaim ||
    (v.authorizationStatus === "unverified" &&
      JSON.stringify(v.entitlement || {}).match(
        /official access|authorized reseller/i,
      ))
  ) {
    issues.push({
      code: "UNVERIFIED_AFFILIATION_CLAIM",
      message: "Unsupported affiliation claim in variant entitlement",
    });
  }
  if (
    v.warrantyPolicyCode === "LIMITED" &&
    (!v.warrantyDays || v.warrantyDays <= 0)
  ) {
    issues.push({
      code: "INVALID_WARRANTY_DAYS",
      message: "LIMITED warranty requires positive warrantyDays",
    });
  }
  if (
    v.compareAtNpr != null &&
    v.sellPriceNpr != null &&
    v.compareAtNpr <= v.sellPriceNpr
  ) {
    issues.push({
      code: "INVALID_COMPARE_AT",
      message: "compareAtNpr must exceed sellPriceNpr",
    });
  }
  return issues;
}

