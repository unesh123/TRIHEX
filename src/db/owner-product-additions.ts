import type { SeedProduct } from "./seed-data";

/** Owner confirmed price and token allowance; fulfillment remains unverified. */
export const OWNER_PRODUCT_ADDITIONS: SeedProduct[] = [{
  name: "MuseAI — 1 Billion Tokens",
  slug: "museai",
  brandSlug: "museai",
  categorySlug: "ai-tools",
  sourceListingText: "Owner requested MuseAI at NPR 399 on 21 October 2026.",
  shortDescription: "MuseAI with 1 billion tokens for NPR 399. Token-based access with no time-based duration. Contact us to confirm availability and activation.",
  productType: "DIGITAL_LICENSE",
  fulfillmentType: "MANUAL_CUSTOMER_EMAIL_ACTIVATION",
  productStatus: "DRAFT",
  complianceStatus: "UNREVIEWED",
  supplyAuthorizationType: "UNKNOWN",
  vendorProofStatus: "NOT_UPLOADED",
  needsDataVerification: true,
  variants: [{
    sku: "MUSEAI-399", variantName: "1 Billion Tokens · No time-based duration",
    durationValue: null, durationUnit: null,
    supplierCostUsdMinor: 0, seedVisibleQuantity: null,
    manualSellingPriceNprMinor: 39900, pricingMode: "MANUAL_ONLY", purchasable: false,
  }],
}];
