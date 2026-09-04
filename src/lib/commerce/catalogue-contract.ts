export type AvailabilityStatus = "available" | "under_review" | "out_of_stock" | "disabled";
export type AccessType = "shared" | "team_seat" | "dedicated" | "upgrade" | "license_key" | "service" | "digital_asset";
export type ActivationMethod = "invite" | "customer_email" | "supplied_account" | "license_key" | "scheduled_service" | "download";
export type AuthorizationStatus = "unverified" | "supplier_confirmed" | "authorized_reseller";

export interface ProductVariantContract {
  id: string;
  productId: string;
  sku: string;
  durationDays: number | null;
  durationLabel: string;
  accessType: AccessType;
  activationMethod: ActivationMethod;
  availabilityStatus: AvailabilityStatus;
  warrantyPolicyCode: string;
  warrantyDays: number | null;
  supplierId: string | null;
  supplierCostNpr: number | null;
  supplierCostVersion: number;
  sellPriceNpr: number;
  compareAtNpr: number | null;
  priceVersion: number;
  stock: number | null;
  entitlement: Record<string, string | number | boolean>;
  authorizationStatus: AuthorizationStatus;
  publishable: boolean;
  mediaManifestId: string | null;
  variantId?: string;
  variantName?: string;
  slug?: string;
  name?: string;
  brandSlug?: string;
  categorySlug?: string;
  sellPriceNprMinor?: number;
  stockOnHand?: number;
  supplierCostUsdMinor?: number;
}

export function isPayableVariant(v: ProductVariantContract): boolean {
  return v.publishable && v.availabilityStatus === "available" && v.sellPriceNpr > 0;
}
