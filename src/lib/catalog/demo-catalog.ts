import {
  ALL_SEED_PRODUCTS,
  SEED_BRANDS,
  SEED_CATEGORIES,
  type SeedProduct,
} from "@/db/seed-data";
import type { ProductCardProps } from "@/components/storefront/product-card";
import { getMerchandisingCatalogue } from "@/lib/catalog/merchandising";

/** Demo NPR prices (minor units) for the three owned PUBLIC products. */
const OWNED_DEMO_PRICES_NPR_MINOR: Record<string, number> = {
  "ai-prompt-starter-pack": 499 * 100,
  "small-business-ai-setup-consultation": 2499 * 100,
  "custom-workflow-automation-discovery": 3999 * 100,
};

const FULFILLMENT_LABELS: Record<string, string> = {
  DOWNLOADABLE_OWNED_ASSET: "Instant download",
  CONSULTATION: "Scheduled session",
  MANAGED_SETUP_SERVICE: "Managed setup",
  MANUAL_CUSTOMER_EMAIL_ACTIVATION: "Email activation",
  MANUAL_ACCOUNT_INVITE: "Account invite",
  VOUCHER_CODE_DELIVERY: "Code delivery",
};

const ACTIVATION_LABELS: Record<string, string> = {
  DOWNLOADABLE_OWNED_ASSET: "Digital download",
  CONSULTATION: "Live consultation",
  MANAGED_SETUP_SERVICE: "Guided setup",
  MANUAL_CUSTOMER_EMAIL_ACTIVATION: "Customer email activation",
  MANUAL_ACCOUNT_INVITE: "Account invite",
  VOUCHER_CODE_DELIVERY: "Voucher / code",
};

function formatDuration(
  value: number | null | undefined,
  unit: string | null | undefined,
): string | undefined {
  if (value == null || !unit) return undefined;
  if (unit === "ONE_TIME") return "One-time";
  if (unit === "SESSION") return value === 1 ? "1 session" : `${value} sessions`;
  if (unit === "CREDITS") return `${value} credits`;
  const label = unit.toLowerCase();
  return value === 1 ? `1 ${label}` : `${value} ${label}s`;
}

function stockStatus(
  qty: number | null | undefined,
): ProductCardProps["stockStatus"] {
  if (qty == null) return "made_to_order";
  if (qty <= 0) return "out_of_stock";
  if (qty <= 5) return "low_stock";
  return "in_stock";
}

function fulfillmentEstimate(fulfillmentType: string): string {
  switch (fulfillmentType) {
    case "DOWNLOADABLE_OWNED_ASSET":
      return "Usually within minutes";
    case "CONSULTATION":
    case "MANAGED_SETUP_SERVICE":
      return "Scheduling within 1–2 business days";
    default:
      return "Typically within a few hours";
  }
}

function brandName(slug: string): string {
  return SEED_BRANDS.find((b) => b.slug === slug)?.name ?? slug;
}

function categoryName(slug: string): string {
  return SEED_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

function isAuthorizationVerified(product: SeedProduct): boolean {
  return (
    product.vendorProofStatus === "VERIFIED" &&
    product.complianceStatus === "APPROVED" &&
    (product.supplyAuthorizationType === "OWN_DIGITAL_PRODUCT" ||
      product.supplyAuthorizationType === "AUTHORIZED_RESELLER" ||
      product.supplyAuthorizationType === "MANAGED_IMPLEMENTATION_SERVICE")
  );
}

export function mapSeedToCardProps(product: SeedProduct): ProductCardProps {
  const variant = product.variants[0];
  const priceNprMinor =
    OWNED_DEMO_PRICES_NPR_MINOR[product.slug] ??
    variant?.minimumProfitNprMinor ??
    999 * 100;

  return {
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    brandName: brandName(product.brandSlug),
    categoryName: categoryName(product.categorySlug),
    duration: formatDuration(variant?.durationValue, variant?.durationUnit),
    activationType:
      ACTIVATION_LABELS[product.fulfillmentType] ??
      FULFILLMENT_LABELS[product.fulfillmentType] ??
      product.fulfillmentType.replaceAll("_", " ").toLowerCase(),
    warranty: undefined,
    priceNprMinor,
    stockStatus: stockStatus(variant?.seedVisibleQuantity),
    fulfillmentEstimate: fulfillmentEstimate(product.fulfillmentType),
    authorizationVerified: isAuthorizationVerified(product),
    featured: Boolean(product.featured),
  };
}

/** PUBLIC products only — storefront-safe demo catalogue. */
export function getDemoCatalogProducts(): ProductCardProps[] {
  return getMerchandisingCatalogue({ visibility: ["AVAILABLE"] }).map(merchToLegacyCard);
}

export function getDemoFeaturedProducts(): ProductCardProps[] {
  return getMerchandisingCatalogue({ visibility: ["AVAILABLE"] })
    .filter((p) => p.featured)
    .map(merchToLegacyCard);
}

export function getDemoProductBySlug(slug: string): ProductCardProps | undefined {
  return getDemoCatalogProducts().find((p) => p.slug === slug);
}

export function getDemoProductsByCategory(categorySlug: string): ProductCardProps[] {
  return getMerchandisingCatalogue({ categorySlug }).map(merchToLegacyCard);
}

export function getDemoProductsByBrand(brandSlug: string): ProductCardProps[] {
  return getMerchandisingCatalogue()
    .filter((p) => p.brandSlug === brandSlug)
    .map(merchToLegacyCard);
}

export function searchDemoProducts(query: string): ProductCardProps[] {
  return getMerchandisingCatalogue({ query }).map(merchToLegacyCard);
}

function merchToLegacyCard(p: import("./merchandising").MerchCard): ProductCardProps {
  return {
    slug: p.slug,
    name: p.title,
    shortDescription: p.shortDescription,
    brandName: p.brandName,
    categoryName: p.categoryName,
    duration: p.durationLabel ?? undefined,
    activationType: p.activationLabel,
    warranty: p.warrantyLabel ?? undefined,
    priceNprMinor: p.priceNprMinor ?? 0,
    stockStatus:
      p.visibility === "AVAILABLE"
        ? "in_stock"
        : p.visibility === "OUT_OF_STOCK"
          ? "out_of_stock"
          : "made_to_order",
    fulfillmentEstimate: p.fulfillmentEstimate,
    authorizationVerified: p.purchasable,
    featured: p.featured,
  };
}

export function getDemoCategories() {
  return SEED_CATEGORIES.map((c) => ({
    ...c,
    productCount: getMerchandisingCatalogue({ categorySlug: c.slug }).length,
  }));
}

export function getDemoBrands() {
  return SEED_BRANDS.map((b) => ({
    ...b,
    productCount: getMerchandisingCatalogue().filter((p) => p.brandSlug === b.slug)
      .length,
  }));
}

export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL;
}

export interface DemoCatalogItem extends ProductCardProps {
  variantSku: string;
  variantName: string;
}

/** PUBLIC catalogue with variant SKUs for cart/checkout. */
export function getDemoCatalogWithVariants(): DemoCatalogItem[] {
  return ALL_SEED_PRODUCTS.filter((p) => p.productStatus === "PUBLIC").map(
    (p) => ({
      ...mapSeedToCardProps(p),
      variantSku: p.variants[0]!.sku,
      variantName: p.variants[0]!.variantName,
    }),
  );
}

export function getDemoSeedProductBySlug(slug: string): SeedProduct | undefined {
  return ALL_SEED_PRODUCTS.find(
    (p) => p.slug === slug && p.productStatus === "PUBLIC",
  );
}
