/**
 * Live catalogue loader — Postgres when DATABASE_URL is set, else seed.
 * Admin price/status edits persist here and revalidate the storefront.
 */
import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import {
  ALL_SEED_PRODUCTS,
  type SeedProduct,
  type SeedVariant,
} from "@/db/seed-data";
import { getAllProductCovers } from "@/lib/catalog/product-covers";
import { isDatabaseConfigured } from "@/lib/env";
import { normalizeEnvAliases } from "@/lib/env/normalize-aliases";
import { isInternalOrTestSku } from "@/lib/commerce/catalogue-lint";

normalizeEnvAliases();

function brandSlugFromName(name: string | null | undefined): string {
  if (!name) return "trihex";
  const n = name.toLowerCase();
  if (n.includes("gemini") || n.includes("google")) return "gemini";
  if (n.includes("openai") || n.includes("chatgpt")) return "openai";
  if (n.includes("grok") || n.includes("xai")) return "grok";
  if (n.includes("claude") || n.includes("anthropic")) return "claude";
  if (n.includes("adobe")) return "adobe";
  if (n.includes("canva")) return "canva";
  if (n.includes("coursera")) return "coursera";
  if (n.includes("capcut")) return "capcut";
  if (n.includes("kling")) return "kling";
  if (n.includes("cursor")) return "cursor";
  if (n.includes("trihex")) return "trihex";
  return "trihex";
}

function categorySlugFromName(name: string | null | undefined): string {
  if (!name) return "ai-tools";
  const n = name.toLowerCase();
  if (n.includes("design")) return "design";
  if (n.includes("video")) return "video-editing";
  if (n.includes("developer")) return "developer-tools";
  if (n.includes("learn")) return "learning";
  if (n.includes("productiv")) return "productivity";
  if (n.includes("digital")) return "digital-assets";
  if (n.includes("service")) return "services";
  return "ai-tools";
}

/** Load catalogue products for storefront + admin. Prefers live DB. */
export async function loadCatalogueProducts(): Promise<SeedProduct[]> {
  if (!isDatabaseConfigured()) return ALL_SEED_PRODUCTS;
  return loadCatalogueProductsCached();
}

const loadCatalogueProductsCached = unstable_cache(
  async (): Promise<SeedProduct[]> => {
    const db = getDb();
  if (!db) return ALL_SEED_PRODUCTS;

  try {
    const rows = await db
      .select({
        id: schema.products.id,
        slug: schema.products.slug,
        name: schema.products.name,
        shortDescription: schema.products.shortDescription,
        sourceListingText: schema.products.sourceListingText,
        longDescription: schema.products.longDescription,
        productType: schema.products.productType,
        fulfillmentType: schema.products.fulfillmentType,
        productStatus: schema.products.productStatus,
        complianceStatus: schema.products.complianceStatus,
        supplyAuthorizationType: schema.products.supplyAuthorizationType,
        vendorProofStatus: schema.products.vendorProofStatus,
        blockedReason: schema.products.blockedReason,
        needsDataVerification: schema.products.needsDataVerification,
        featured: schema.products.featured,
        brandSlug: schema.brands.slug,
        brandName: schema.brands.name,
        categorySlug: schema.categories.slug,
        categoryName: schema.categories.name,
        sku: schema.productVariants.sku,
        variantName: schema.productVariants.variantName,
        durationValue: schema.productVariants.durationValue,
        durationUnit: schema.productVariants.durationUnit,
        warrantyValue: schema.productVariants.warrantyValue,
        warrantyUnit: schema.productVariants.warrantyUnit,
        warrantyCoverage: schema.productVariants.warrantyCoverage,
        activationMethod: schema.productVariants.activationMethod,
        supplierCostUsdMinor: schema.productVariants.supplierCostUsdMinor,
        supplierCostMinor: schema.productVariants.supplierCostMinor,
        manualSellingPriceNprMinor:
          schema.productVariants.manualSellingPriceNprMinor,
        compareAtPriceNprMinor: schema.productVariants.compareAtPriceNprMinor,
        minimumProfitNprMinor: schema.productVariants.minimumProfitNprMinor,
        purchasable: schema.productVariants.purchasable,
        seedVisibleQuantity: schema.productVariants.seedVisibleQuantity,
        pricingMode: schema.productVariants.pricingMode,
        active: schema.productVariants.active,
      })
      .from(schema.products)
      .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
      .leftJoin(
        schema.categories,
        eq(schema.products.categoryId, schema.categories.id),
      )
      .innerJoin(
        schema.productVariants,
        eq(schema.productVariants.productId, schema.products.id),
      );

    if (!rows.length) return ALL_SEED_PRODUCTS.filter(p => !isInternalOrTestSku(p.slug));

    const bySlug = new Map<string, SeedProduct>();
    for (const row of rows) {
      if (row.productStatus === "ARCHIVED") continue;
      if (!row.active) continue;
      if (
        isInternalOrTestSku(row.slug) ||
        isInternalOrTestSku(row.sku) ||
        isInternalOrTestSku(row.name) ||
        isInternalOrTestSku(row.variantName)
      ) {
        continue;
      }

      const variant: SeedVariant = {
        sku: row.sku,
        variantName: row.variantName,
        durationValue: row.durationValue,
        durationUnit: row.durationUnit as SeedVariant["durationUnit"],
        warrantyValue: row.warrantyValue ?? undefined,
        warrantyUnit: row.warrantyUnit as SeedVariant["durationUnit"] ?? undefined,
        warrantyCoverage: row.warrantyCoverage ?? undefined,
        activationMethod: row.activationMethod ?? undefined,
        supplierCostUsdMinor:
          row.supplierCostUsdMinor ?? row.supplierCostMinor ?? 0,
        seedVisibleQuantity: row.seedVisibleQuantity,
        manualSellingPriceNprMinor:
          row.manualSellingPriceNprMinor ?? undefined,
        compareAtPriceNprMinor: row.compareAtPriceNprMinor ?? undefined,
        minimumProfitNprMinor: row.minimumProfitNprMinor ?? undefined,
        pricingMode: row.pricingMode as SeedVariant["pricingMode"],
        purchasable: row.purchasable,
      } as SeedVariant;

      const existing = bySlug.get(row.slug);
      if (existing) {
        existing.variants.push(variant);
        continue;
      }

      bySlug.set(row.slug, {
        name: row.name,
        slug: row.slug,
        brandSlug:
          row.brandSlug ?? brandSlugFromName(row.brandName),
        categorySlug:
          row.categorySlug ?? categorySlugFromName(row.categoryName),
        sourceListingText: row.sourceListingText ?? row.name,
        shortDescription: row.shortDescription ?? "",
        longDescription: row.longDescription ?? undefined,
        productType: row.productType,
        fulfillmentType: row.fulfillmentType,
        productStatus: row.productStatus as SeedProduct["productStatus"],
        complianceStatus:
          row.complianceStatus as SeedProduct["complianceStatus"],
        supplyAuthorizationType: row.supplyAuthorizationType,
        vendorProofStatus: row.vendorProofStatus,
        blockedReason: row.blockedReason ?? undefined,
        needsDataVerification: row.needsDataVerification,
        featured: row.featured,
        variants: [variant],
      });
    }

    const products = Array.from(bySlug.values());
      return products.length ? products : ALL_SEED_PRODUCTS;
    } catch (err) {
      console.error("[catalogue] DB load failed, falling back to seed", err);
      return ALL_SEED_PRODUCTS;
    }
  },
  ["trihex-live-catalogue-v2"],
  { revalidate: 15, tags: ["trihex-live-catalogue"] },
);

function normalizeSlugCandidate(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function loadCatalogueProductBySlug(
  slug: string,
): Promise<SeedProduct | null> {
  if (isInternalOrTestSku(slug)) return null;
  const all = await loadCatalogueProducts();
  const decoded = decodeURIComponent(slug).trim();
  const exact = all.find((p) => p.slug === decoded);
  if (exact) return exact;
  const normalized = normalizeSlugCandidate(decoded);
  return (
    all.find((p) => p.slug === normalized) ??
    all.find((p) => normalizeSlugCandidate(p.slug) === normalized) ??
    null
  );
}

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  productStatus: string;
  complianceStatus: string;
  featured: boolean;
  needsDataVerification: boolean;
  brandSlug: string | null;
  categorySlug: string | null;
  variantId: string;
  sku: string;
  priceMinor: number | null;
  compareAtMinor: number | null;
  costUsdMinor: number | null;
  purchasable: boolean;
  seedVisibleQuantity: number | null;
  coverUrl: string | null;
  coverAlt: string | null;
  longDescription: string | null;
};

export async function loadAdminProducts(): Promise<AdminProductRow[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
    .select({
      id: schema.products.id,
      slug: schema.products.slug,
      name: schema.products.name,
      shortDescription: schema.products.shortDescription,
      longDescription: schema.products.longDescription,
      productStatus: schema.products.productStatus,
      complianceStatus: schema.products.complianceStatus,
      featured: schema.products.featured,
      needsDataVerification: schema.products.needsDataVerification,
      brandSlug: schema.brands.slug,
      categorySlug: schema.categories.slug,
      variantId: schema.productVariants.id,
      sku: schema.productVariants.sku,
      priceMinor: schema.productVariants.manualSellingPriceNprMinor,
      compareAtMinor: schema.productVariants.compareAtPriceNprMinor,
      costUsdMinor: schema.productVariants.supplierCostUsdMinor,
      purchasable: schema.productVariants.purchasable,
      seedVisibleQuantity: schema.productVariants.seedVisibleQuantity,
    })
    .from(schema.products)
    .leftJoin(schema.brands, eq(schema.products.brandId, schema.brands.id))
    .leftJoin(
      schema.categories,
      eq(schema.products.categoryId, schema.categories.id),
    )
    .innerJoin(
      schema.productVariants,
      eq(schema.productVariants.productId, schema.products.id),
    )
    .orderBy(schema.products.name);

  const covers = await loadPrimaryCoverPathsBySlug();
  const mediaAlt = new Map<string, string>();
  try {
    const mediaRows = await db
      .select({
        slug: schema.products.slug,
        alt: schema.productMedia.altText,
        isPrimary: schema.productMedia.isPrimary,
      })
      .from(schema.productMedia)
      .innerJoin(
        schema.products,
        eq(schema.productMedia.productId, schema.products.id),
      );
    for (const m of mediaRows) {
      if (m.isPrimary && m.alt) mediaAlt.set(m.slug, m.alt);
      else if (m.alt && !mediaAlt.has(m.slug)) mediaAlt.set(m.slug, m.alt);
    }
  } catch {
    /* ignore */
  }

    return rows.map((r) => ({
      ...r,
      productStatus: String(r.productStatus),
      complianceStatus: String(r.complianceStatus),
      coverUrl: covers.get(r.slug) ?? null,
      coverAlt: mediaAlt.get(r.slug) ?? null,
    }));
  } catch (error) {
    console.error("[Admin catalogue] failed to load products", error);
    return [];
  }
}

export async function loadAdminProductByIdOrSlug(
  idOrSlug: string,
): Promise<AdminProductRow | null> {
  const all = await loadAdminProducts();
  return (
    all.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null
  );
}

/** Primary cover URLs — manifest first, then product_media overrides. */
export async function loadPrimaryCoverPathsBySlug(): Promise<Map<string, string>> {
  const manifest = Object.fromEntries(
    getAllProductCovers()
      .filter((entry) => Boolean(entry.publicPath))
      .map((entry) => [entry.slug, entry.publicPath as string]),
  );
  if (!isDatabaseConfigured()) return new Map(Object.entries(manifest));
  const cached = await loadPrimaryCoverPathsCached(manifest);
  return new Map(Object.entries(cached));
}

const loadPrimaryCoverPathsCached = unstable_cache(
  async (manifest: Record<string, string>): Promise<Record<string, string>> => {
    const map = new Map(Object.entries(manifest));
    const db = getDb();
    if (!db) return Object.fromEntries(map);

    try {
      const rows = await db
        .select({
          slug: schema.products.slug,
          url: schema.productMedia.url,
          isPrimary: schema.productMedia.isPrimary,
          sortOrder: schema.productMedia.sortOrder,
        })
        .from(schema.productMedia)
        .innerJoin(
          schema.products,
          eq(schema.productMedia.productId, schema.products.id),
        );

      const best = new Map<string, { url: string; score: number }>();
      for (const row of rows) {
        if (!row.url.startsWith("/media/") && !row.url.startsWith("http")) continue;
        const score = (row.isPrimary ? 1000 : 0) - row.sortOrder;
        const prev = best.get(row.slug);
        if (!prev || score > prev.score) {
          best.set(row.slug, { url: row.url, score });
        }
      }
      for (const [slug, value] of best) map.set(slug, value.url);
    } catch (err) {
      console.error("[catalogue] cover load failed", err);
    }
    return Object.fromEntries(map);
  },
  ["trihex-primary-covers-v2"],
  { revalidate: 30, tags: ["trihex-primary-covers"] },
);
