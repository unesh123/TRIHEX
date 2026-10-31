import type { SeedProduct } from "./seed-data";

/** Owner confirmed token allowance and NPR pricing for Musi AI (Muse.ai). */
export const OWNER_PRODUCT_ADDITIONS: SeedProduct[] = [
  {
    name: "Musi AI (Muse.ai) Tokens",
    slug: "museai",
    brandSlug: "museai",
    categorySlug: "ai-tools",
    sourceListingText:
      "Official 3x Digital Musi AI (Muse.ai) token packages: 1 Billion Tokens (NPR 399), 4 Billion Tokens (NPR 899), 31 Billion Tokens (NPR 2,199).",
    shortDescription:
      "Musi AI (Muse.ai) Next-Gen AI Video & Audio platform. Next-gen AI video search, automatic speech-to-text transcriptions, 4K ad-free streaming, developer API access, and instant Nepal WhatsApp activation by 3x Digital.",
    productType: "DIGITAL_LICENSE",
    fulfillmentType: "MANUAL_CUSTOMER_EMAIL_ACTIVATION",
    productStatus: "PUBLIC",
    complianceStatus: "APPROVED",
    supplyAuthorizationType: "CUSTOMER_EMAIL_ACTIVATION",
    vendorProofStatus: "VERIFIED",
    needsDataVerification: false,
    featured: true,
    variants: [
      {
        sku: "MUSEAI-1B",
        variantName: "1 Billion Tokens",
        durationValue: null,
        durationUnit: null,
        supplierCostUsdMinor: 200,
        seedVisibleQuantity: 25,
        manualSellingPriceNprMinor: 39900,
        pricingMode: "MANUAL_ONLY",
        purchasable: true,
      },
      {
        sku: "MUSEAI-4B",
        variantName: "4 Billion Tokens",
        durationValue: null,
        durationUnit: null,
        supplierCostUsdMinor: 500,
        seedVisibleQuantity: 25,
        manualSellingPriceNprMinor: 89900,
        pricingMode: "MANUAL_ONLY",
        purchasable: true,
      },
      {
        sku: "MUSEAI-31B",
        variantName: "31 Billion Tokens",
        durationValue: null,
        durationUnit: null,
        supplierCostUsdMinor: 1200,
        seedVisibleQuantity: 25,
        manualSellingPriceNprMinor: 219900,
        pricingMode: "MANUAL_ONLY",
        purchasable: true,
      },
    ],
  },
];
