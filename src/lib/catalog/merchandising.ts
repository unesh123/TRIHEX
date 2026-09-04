/**
 * Customer-facing merchandising catalogue.
 * Shows full product families professionally; only approved items are purchasable.
 */
import {
  ALL_SEED_PRODUCTS,
  SEED_BRANDS,
  SEED_CATEGORIES,
  type SeedProduct,
} from "@/db/seed-data";
import { featuresForSlug } from "@/lib/catalog/package-features";
import {
  resolveBrandFamily,
  type BrandFamily,
} from "@/components/storefront/family-artwork";

export type CatalogueVisibility =
  | "AVAILABLE"
  | "OUT_OF_STOCK"
  | "COMING_SOON"
  | "AVAILABILITY_UNDER_REVIEW"
  | "HIDDEN"
  | "BLOCKED";

export interface MerchCardVariant {
  sku: string;
  variantName: string;
  durationLabel: string | null;
  durationValue: number | null;
  durationUnit: string | null;
  priceNprMinor: number | null;
  compareAtPriceNprMinor: number | null;
  discountPercent: number | null;
  purchasable: boolean;
  stockQty: number | null;
  stockLabel: string | null;
}

export interface MerchCard {
  slug: string;
  brandSlug: string;
  brandName: string;
  brandFamily: BrandFamily;
  categorySlug: string;
  categoryName: string;
  categoryLabel: string;
  /** Customer-facing product title (brand + product) */
  title: string;
  /** Package / duration line */
  packageLabel: string;
  shortDescription: string;
  durationLabel: string | null;
  activationLabel: string;
  fulfillmentEstimate: string;
  warrantyLabel: string | null;
  priceNprMinor: number | null;
  /** Original package / list price — show struck if higher than sell. */
  compareAtPriceNprMinor: number | null;
  /** Savings percent when compare-at is set. */
  discountPercent: number | null;
  showPrice: boolean;
  visibility: CatalogueVisibility;
  purchasable: boolean;
  variantSku: string;
  featured: boolean;
  sourceListingText: string;
  /** Plan features for cards / WhatsApp */
  features: string[];
  /** Visible stock qty from admin (null = unlimited / made-to-order). */
  stockQty: number | null;
  stockLabel: string | null;
  /** All variants associated with this product (for tiers & warranty) */
  variants?: MerchCardVariant[];
  /** Optional live DB / admin-uploaded cover override */
  coverPublicPath?: string | null;
  /** Same product line, other duration plans (for chips / switcher) */
  familyPlans?: Array<{
    slug: string;
    label: string;
    priceNprMinor: number | null;
    purchasable: boolean;
  }>;
  /** True when this card represents multiple duration SKUs */
  isFamilyCard?: boolean;
  familyKey?: string;
}

function brandName(slug: string): string {
  return SEED_BRANDS.find((b) => b.slug === slug)?.name ?? slug;
}

function categoryName(slug: string): string {
  return SEED_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

function categoryLabel(slug: string): string {
  const map: Record<string, string> = {
    "ai-tools": "AI Assistants",
    design: "Design & Creative",
    "video-editing": "Video & Editing",
    "developer-tools": "Developer Tools",
    learning: "Learning",
    productivity: "Productivity",
    "digital-assets": "Digital Assets",
    services: "Services",
  };
  return map[slug] ?? categoryName(slug);
}

function durationLabel(
  value: number | null,
  unit: string | null,
): string | null {
  if (value == null || !unit) return null;
  if (unit === "ONE_TIME") return "One-time";
  if (unit === "SESSION") return value === 1 ? "1 session" : `${value} sessions`;
  if (unit === "CREDITS") return `${value} credits`;
  if (unit === "DAY") return value === 1 ? "1 day" : `${value} days`;
  if (unit === "WEEK") return value === 1 ? "1 week" : `${value} weeks`;
  if (unit === "MONTH") return value === 1 ? "1 month" : `${value} months`;
  if (unit === "YEAR") return value === 1 ? "1 year" : `${value} years`;
  return `${value} ${unit.toLowerCase()}`;
}

function cleanCustomerTitle(product: SeedProduct): {
  title: string;
  packageLabel: string;
} {
  const brand = brandName(product.brandSlug)
    .replace("Google ", "")
    .replace("xAI ", "")
    .replace("Anthropic ", "")
    .replace("TRIHEX DIGITAL", "TRIHEX");

  const variant = product.variants[0];

  const packageLabel =
    durationLabel(variant?.durationValue ?? null, variant?.durationUnit ?? null) ??
    variant?.variantName ??
    "Standard package";

  // Prefer admin-edited DB name so renames in /admin/products stick on the shop.
  // Light cleanup only — do not hardcode titles per slug.
  let title = (product.name ?? "").trim();
  if (!title) {
    title = brand || "Product";
  } else {
    title = title
      .replace(/\b(NW|FW|FWW|W15D|W3D|CDK)\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  return { title, packageLabel };
}

function activationLabel(fulfillmentType: string): string {
  const map: Record<string, string> = {
    DOWNLOADABLE_OWNED_ASSET: "Digital download",
    CONSULTATION: "Scheduled consultation",
    MANAGED_SETUP_SERVICE: "Managed setup",
    MANUAL_CUSTOMER_EMAIL_ACTIVATION: "Customer email activation",
    OFFICIAL_TEAM_INVITATION: "Team invitation",
    OFFICIAL_REDEEM_CODE: "Code activation",
    API_POWERED_ACCESS: "API access",
    LICENSE_KEY_FROM_AUTHORIZED_DISTRIBUTOR: "License key",
  };
  return map[fulfillmentType] ?? "Activation details on product page";
}

function fulfillmentEstimate(fulfillmentType: string): string {
  switch (fulfillmentType) {
    case "DOWNLOADABLE_OWNED_ASSET":
      return "Usually within minutes after payment verification";
    case "CONSULTATION":
    case "MANAGED_SETUP_SERVICE":
      return "Scheduling within 1–2 business days";
    default:
      return "Typically within a few hours after payment verification";
  }
}

function resolveVisibility(product: SeedProduct): CatalogueVisibility {
  const qty = product.variants[0]?.seedVisibleQuantity;
  if (qty === 0) return "OUT_OF_STOCK";

  // Explicit under review / draft → Check Availability (never Buy Now)
  if (
    product.needsDataVerification ||
    product.productStatus === "DRAFT"
  ) {
    return "AVAILABILITY_UNDER_REVIEW";
  }

  if (product.complianceStatus === "REJECTED") return "BLOCKED";
  if (product.productStatus === "BLOCKED") return "BLOCKED";

  if (product.productStatus === "PUBLIC" && product.complianceStatus === "APPROVED") {
    const purchasable = product.variants[0]?.purchasable ?? false;
    // Live listing but Buy Now off → treat as under review / enquire first
    if (!purchasable) return "AVAILABILITY_UNDER_REVIEW";
    return "AVAILABLE";
  }

  return "COMING_SOON";
}

import {
  discountPercentFromList,
  honestCompareAtNprMinor,
} from "@/lib/pricing/honest-discounts";
import { groupIntoFamilies } from "@/lib/catalog/product-families";

function resolvePrice(product: SeedProduct): number | null {
  const v = product.variants[0];
  if (!v) return null;
  if (v.manualSellingPriceNprMinor != null) return v.manualSellingPriceNprMinor;
  // Owned products may use minimumProfit as sell proxy in seed history
  if (product.brandSlug === "trihex" && v.minimumProfitNprMinor) {
    return v.minimumProfitNprMinor;
  }
  return null;
}

export function buildMerchCard(product: SeedProduct): MerchCard {
  const { title, packageLabel } = cleanCustomerTitle(product);
  const visibility = resolveVisibility(product);
  const purchasable = visibility === "AVAILABLE";
  const price = resolvePrice(product);
  const variant = product.variants[0]!;
  const costNprMinor =
    variant.supplierCostUsdMinor != null
      ? Math.round((variant.supplierCostUsdMinor / 100) * 160 * 100)
      : null;
  const compareAt =
    price != null
      ? honestCompareAtNprMinor({
          sellNprMinor: price,
          listNprMinor: variant.compareAtPriceNprMinor,
          costNprMinor,
        })
      : null;
  const discountPercent =
    compareAt != null && price != null
      ? discountPercentFromList(price, compareAt)
      : null;

  const featured =
    Boolean(product.featured) &&
    product.brandSlug !== "trihex" &&
    product.categorySlug !== "services" &&
    product.categorySlug !== "digital-assets";

  const stockQty =
    variant.seedVisibleQuantity === undefined
      ? null
      : variant.seedVisibleQuantity;
  let stockLabel: string | null = null;
  if (stockQty === 0) stockLabel = "Out of stock";
  else if (stockQty != null && stockQty > 0 && stockQty <= 5)
    stockLabel = `Only ${stockQty} left`;
  else if (stockQty != null && stockQty > 5)
    stockLabel = `${stockQty} in stock`;

  const variants: MerchCardVariant[] = (product.variants ?? []).map((v) => {
    const vPrice =
      v.manualSellingPriceNprMinor ??
      (product.brandSlug === "trihex" ? v.minimumProfitNprMinor ?? null : null);
    const vCostNprMinor =
      v.supplierCostUsdMinor != null
        ? Math.round((v.supplierCostUsdMinor / 100) * 160 * 100)
        : null;
    const vCompareAt =
      vPrice != null
        ? honestCompareAtNprMinor({
            sellNprMinor: vPrice,
            listNprMinor: v.compareAtPriceNprMinor,
            costNprMinor: vCostNprMinor,
          })
        : null;
    const vDiscount =
      vCompareAt != null && vPrice != null
        ? discountPercentFromList(vPrice, vCompareAt)
        : null;
    const vStockQty =
      v.seedVisibleQuantity === undefined ? null : v.seedVisibleQuantity;
    let vStockLabel: string | null = null;
    if (vStockQty === 0) vStockLabel = "Out of stock";
    else if (vStockQty != null && vStockQty > 0 && vStockQty <= 5)
      vStockLabel = `Only ${vStockQty} left`;
    else if (vStockQty != null && vStockQty > 5)
      vStockLabel = `${vStockQty} in stock`;

    return {
      sku: v.sku,
      variantName: v.variantName,
      durationLabel: durationLabel(v.durationValue, v.durationUnit),
      durationValue: v.durationValue,
      durationUnit: v.durationUnit,
      priceNprMinor: vPrice,
      compareAtPriceNprMinor: vCompareAt,
      discountPercent: vDiscount,
      purchasable: v.purchasable ?? false,
      stockQty: vStockQty,
      stockLabel: vStockLabel,
    };
  }).sort((a, b) => (a.priceNprMinor ?? 0) - (b.priceNprMinor ?? 0));

  return {
    slug: product.slug,
    brandSlug: product.brandSlug,
    brandName: brandName(product.brandSlug),
    brandFamily: resolveBrandFamily(product.brandSlug, product.slug),
    categorySlug: product.categorySlug,
    categoryName: categoryName(product.categorySlug),
    categoryLabel: categoryLabel(product.categorySlug),
    title,
    packageLabel,
    shortDescription: product.shortDescription,
    durationLabel: durationLabel(
      variant.durationValue,
      variant.durationUnit,
    ),
    activationLabel: activationLabel(product.fulfillmentType),
    fulfillmentEstimate: fulfillmentEstimate(product.fulfillmentType),
    warrantyLabel: null,
    priceNprMinor: price,
    compareAtPriceNprMinor: compareAt,
    discountPercent,
    showPrice: price != null && (purchasable || visibility === "AVAILABILITY_UNDER_REVIEW"),
    visibility,
    purchasable,
    variantSku: variant.sku,
    featured,
    sourceListingText: product.sourceListingText,
    features: featuresForSlug(product.slug, product.longDescription),
    stockQty,
    stockLabel,
    variants,
  };
}

type CatalogueOptions = {
  includeBlocked?: boolean;
  categorySlug?: string;
  brandSlug?: string;
  query?: string;
  visibility?: CatalogueVisibility[];
  /** NPR major units (rupees), inclusive */
  minPriceNpr?: number;
  maxPriceNpr?: number;
  /** Match duration label substring, e.g. "12 Months", "1 Month" */
  duration?: string;
};

function filterCatalogue(
  products: SeedProduct[],
  options?: CatalogueOptions,
): MerchCard[] {
  const includeBlocked = options?.includeBlocked ?? true;
  let cards = products
    .map(buildMerchCard)
    .filter((c) => c.visibility !== "HIDDEN");

  if (!includeBlocked) {
    cards = cards.filter((c) => c.visibility !== "BLOCKED");
  }

  if (options?.categorySlug) {
    cards = cards.filter((c) => c.categorySlug === options.categorySlug);
  }

  if (options?.brandSlug) {
    cards = cards.filter((c) => c.brandSlug === options.brandSlug);
  }

  if (options?.duration?.trim()) {
    const d = options.duration.trim().toLowerCase();
    cards = cards.filter((c) =>
      (c.durationLabel ?? c.packageLabel).toLowerCase().includes(d),
    );
  }

  if (options?.minPriceNpr != null && Number.isFinite(options.minPriceNpr)) {
    const minMinor = Math.round(options.minPriceNpr * 100);
    cards = cards.filter(
      (c) => c.priceNprMinor != null && c.priceNprMinor >= minMinor,
    );
  }

  if (options?.maxPriceNpr != null && Number.isFinite(options.maxPriceNpr)) {
    const maxMinor = Math.round(options.maxPriceNpr * 100);
    cards = cards.filter(
      (c) => c.priceNprMinor != null && c.priceNprMinor <= maxMinor,
    );
  }

  if (options?.visibility?.length) {
    cards = cards.filter((c) => options.visibility!.includes(c.visibility));
  }

  if (options?.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    cards = cards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.brandName.toLowerCase().includes(q) ||
        c.packageLabel.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q),
    );
  }

  return cards;
}

/** Sync seed catalogue — used by unit tests. Prefer getLiveMerchandisingCatalogue in app routes. */
export function getMerchandisingCatalogue(
  options?: CatalogueOptions,
): MerchCard[] {
  return filterCatalogue(ALL_SEED_PRODUCTS, options);
}

/** Live catalogue — Postgres prices/status when DATABASE_URL is set. */
export async function getLiveMerchandisingCatalogue(
  options?: CatalogueOptions,
): Promise<MerchCard[]> {
  const { loadCatalogueProducts, loadPrimaryCoverPathsBySlug } = await import(
    "@/lib/catalog/live-catalogue"
  );
  const products = await loadCatalogueProducts();
  const cards = filterCatalogue(products, options).filter((c) => {
    const t = c.title.toLowerCase();
    if (t.includes("moths")) return false;
    if (/\(plan\)/.test(t) && t.includes("grok")) return false;
    return true;
  });
  const covers = await loadPrimaryCoverPathsBySlug();
  return cards.map((c) => ({
    ...c,
    coverPublicPath: covers.get(c.slug) ?? c.coverPublicPath ?? null,
  }));
}

export function getMerchCardBySlug(slug: string): MerchCard | null {
  const product = ALL_SEED_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;
  return buildMerchCard(product);
}

export async function getLiveMerchCardBySlug(
  slug: string,
): Promise<MerchCard | null> {
  const { loadCatalogueProductBySlug, loadPrimaryCoverPathsBySlug } =
    await import("@/lib/catalog/live-catalogue");
  const product = await loadCatalogueProductBySlug(slug);
  if (!product) return null;
  const card = buildMerchCard(product);
  const covers = await loadPrimaryCoverPathsBySlug();
  return {
    ...card,
    coverPublicPath: covers.get(slug) ?? null,
  };
}

/** Collapse duration duplicates into one card per product line. */
export function withFamilyGrouping(cards: MerchCard[]): MerchCard[] {
  return groupIntoFamilies(cards).map((f) => ({
    ...f.card,
    title: f.familyTitle,
    packageLabel:
      f.planCount > 1 ? `${f.planCount} plans available` : f.card.packageLabel,
    durationLabel:
      f.planCount > 1
        ? f.plans.map((p) => p.label).join(" · ")
        : f.card.durationLabel,
    priceNprMinor:
      f.planCount > 1 && f.fromPriceNprMinor != null
        ? f.fromPriceNprMinor
        : f.card.priceNprMinor,
    isFamilyCard: f.planCount > 1,
    familyKey: f.familyKey,
    familyPlans: f.plans.map((p) => ({
      slug: p.slug,
      label: p.label,
      priceNprMinor: p.priceNprMinor,
      purchasable: p.purchasable,
    })),
    slug: f.card.slug,
  }));
}

export function formatStorePrice(nprMinor: number): string {
  const rupees = Math.round(nprMinor / 100);
  return `Rs. ${rupees.toLocaleString("en-NP")}`;
}

export const VISIBILITY_LABEL: Record<CatalogueVisibility, string> = {
  AVAILABLE: "Available",
  OUT_OF_STOCK: "Out of Stock",
  COMING_SOON: "Coming Soon",
  AVAILABILITY_UNDER_REVIEW: "Under Review",
  HIDDEN: "Hidden",
  BLOCKED: "Unavailable",
};

export function visibilityLabelForCard(card: MerchCard): string {
  if (
    card.visibility === "AVAILABLE" &&
    (card.categorySlug === "services" ||
      card.activationLabel.toLowerCase().includes("consultation"))
  ) {
    return "Bookable";
  }
  return VISIBILITY_LABEL[card.visibility];
}
