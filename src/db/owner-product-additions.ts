import type { SeedProduct } from "./seed-data";

/** Owner confirmed price and token allowance; fulfillment remains unverified. */
export const OWNER_PRODUCT_ADDITIONS: SeedProduct[] = [
  {
    name: "Musi AI (Muse.ai) Pro Subscription — 3x Digital",
    slug: "musi-ai-pro-subscription",
    brandSlug: "museai",
    categorySlug: "ai-tools",
    sourceListingText:
      "Official 3x Digital Musi AI (Muse.ai) video & audio intelligence subscription for Nepal with NPR pricing, fast hosting, and AI search.",
    shortDescription:
      "Musi AI (Muse.ai) Next-Gen AI Video & Audio platform. Next-gen AI video search, automatic transcription, 4K ad-free streaming, developer API access, and instant Nepal WhatsApp activation by 3x Digital.",
    productType: "DIGITAL_LICENSE",
    fulfillmentType: "MANUAL_CUSTOMER_EMAIL_ACTIVATION",
    productStatus: "PUBLIC",
    complianceStatus: "APPROVED",
    supplyAuthorizationType: "INDEPENDENT_RESELLER",
    vendorProofStatus: "VERIFIED",
    needsDataVerification: false,
    featured: true,
    variants: [
      {
        sku: "MUSI-AI-1M",
        variantName: "1 Month Pro Plan",
        durationValue: 1,
        durationUnit: "MONTH",
        supplierCostUsdMinor: 900,
        seedVisibleQuantity: 15,
        manualSellingPriceNprMinor: 149900,
        compareAtPriceNprMinor: 199900,
        pricingMode: "MANUAL_ONLY",
        purchasable: true,
      },
      {
        sku: "MUSI-AI-1Y",
        variantName: "1 Year Studio Plan",
        durationValue: 1,
        durationUnit: "YEAR",
        supplierCostUsdMinor: 8900,
        seedVisibleQuantity: 8,
        manualSellingPriceNprMinor: 1299900,
        compareAtPriceNprMinor: 1699900,
        pricingMode: "MANUAL_ONLY",
        purchasable: true,
      },
    ],
  },
  {
    name: "MuseAI — 1 Billion Tokens",
    slug: "museai",
    brandSlug: "museai",
    categorySlug: "ai-tools",
    sourceListingText: "Owner requested MuseAI at NPR 399 on 21 October 2026.",
    shortDescription:
      "MuseAI with 1 billion tokens for NPR 399. Token-based access with no time-based duration. Contact us to confirm availability and activation.",
    productType: "DIGITAL_LICENSE",
    fulfillmentType: "MANUAL_CUSTOMER_EMAIL_ACTIVATION",
    productStatus: "DRAFT",
    complianceStatus: "UNREVIEWED",
    supplyAuthorizationType: "UNKNOWN",
    vendorProofStatus: "NOT_UPLOADED",
    needsDataVerification: true,
    variants: [
      {
        sku: "MUSEAI-399",
        variantName: "1 Billion Tokens · No time-based duration",
        durationValue: null,
        durationUnit: null,
        supplierCostUsdMinor: 0,
        seedVisibleQuantity: null,
        manualSellingPriceNprMinor: 39900,
        pricingMode: "MANUAL_ONLY",
        purchasable: false,
      },
    ],
  },
];
