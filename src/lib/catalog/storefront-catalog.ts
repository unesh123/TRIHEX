/**
 * Storefront catalogue — PostgreSQL when DATABASE_URL is configured, else demo seed.
 */
import { and, eq } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/env";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import type { ProductCardProps } from "@/components/storefront/product-card";
import {
  getDemoCatalogProducts,
  getDemoCatalogWithVariants,
  getDemoFeaturedProducts,
} from "@/lib/catalog/demo-catalog";
import { normalizeEnvAliases } from "@/lib/env/normalize-aliases";

normalizeEnvAliases();

function formatDuration(
  value: number | null | undefined,
  unit: string | null | undefined,
): string | undefined {
  if (value == null || !unit) return undefined;
  if (unit === "ONE_TIME") return "One-time";
  if (unit === "SESSION") return value === 1 ? "1 session" : `${value} sessions`;
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

export async function listPublicProducts(): Promise<ProductCardProps[]> {
  if (!isDatabaseConfigured()) return getDemoCatalogProducts();
  const db = getDb();
  if (!db) return getDemoCatalogProducts();

  const rows = await db
    .select({
      slug: schema.products.slug,
      name: schema.products.name,
      shortDescription: schema.products.shortDescription,
      featured: schema.products.featured,
      fulfillmentType: schema.products.fulfillmentType,
      complianceStatus: schema.products.complianceStatus,
      supplyAuthorizationType: schema.products.supplyAuthorizationType,
      vendorProofStatus: schema.products.vendorProofStatus,
      brandName: schema.brands.name,
      categoryName: schema.categories.name,
      durationValue: schema.productVariants.durationValue,
      durationUnit: schema.productVariants.durationUnit,
      price: schema.productVariants.manualSellingPriceNprMinor,
      seedQty: schema.productVariants.seedVisibleQuantity,
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
    .where(
      and(
        eq(schema.products.productStatus, "PUBLIC"),
        eq(schema.products.complianceStatus, "APPROVED"),
        eq(schema.productVariants.active, true),
      ),
    );

  // One card per product (first variant)
  const seen = new Set<string>();
  const cards: ProductCardProps[] = [];
  for (const row of rows) {
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);
    cards.push({
      slug: row.slug,
      name: row.name,
      shortDescription: row.shortDescription ?? "",
      brandName: row.brandName ?? "TRIHEX",
      categoryName: row.categoryName ?? "General",
      duration: formatDuration(row.durationValue, row.durationUnit),
      activationType: String(row.fulfillmentType).replaceAll("_", " ").toLowerCase(),
      warranty: undefined,
      priceNprMinor: row.price ?? 0,
      stockStatus: stockStatus(row.seedQty),
      fulfillmentEstimate: "Typically within a few hours",
      authorizationVerified:
        row.vendorProofStatus === "VERIFIED" &&
        row.complianceStatus === "APPROVED",
      featured: Boolean(row.featured),
    });
  }
  return cards;
}

export async function listFeaturedProducts(): Promise<ProductCardProps[]> {
  const all = await listPublicProducts();
  const featured = all.filter((p) => p.featured);
  return featured.length ? featured : all.slice(0, 3);
}

export async function getPublicProductCardBySlug(
  slug: string,
): Promise<ProductCardProps | null> {
  const all = await listPublicProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function listCatalogWithVariants(): Promise<
  Array<ProductCardProps & { variantSku: string; variantName: string }>
> {
  if (!isDatabaseConfigured()) return getDemoCatalogWithVariants();
  const db = getDb();
  if (!db) return getDemoCatalogWithVariants();

  const rows = await db
    .select({
      slug: schema.products.slug,
      name: schema.products.name,
      shortDescription: schema.products.shortDescription,
      featured: schema.products.featured,
      fulfillmentType: schema.products.fulfillmentType,
      complianceStatus: schema.products.complianceStatus,
      vendorProofStatus: schema.products.vendorProofStatus,
      brandName: schema.brands.name,
      categoryName: schema.categories.name,
      durationValue: schema.productVariants.durationValue,
      durationUnit: schema.productVariants.durationUnit,
      price: schema.productVariants.manualSellingPriceNprMinor,
      seedQty: schema.productVariants.seedVisibleQuantity,
      sku: schema.productVariants.sku,
      variantName: schema.productVariants.variantName,
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
    .where(
      and(
        eq(schema.products.productStatus, "PUBLIC"),
        eq(schema.products.complianceStatus, "APPROVED"),
        eq(schema.productVariants.active, true),
        eq(schema.productVariants.purchasable, true),
      ),
    );

  const seen = new Set<string>();
  const items: Array<
    ProductCardProps & { variantSku: string; variantName: string }
  > = [];
  for (const row of rows) {
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);
    items.push({
      slug: row.slug,
      name: row.name,
      shortDescription: row.shortDescription ?? "",
      brandName: row.brandName ?? "TRIHEX",
      categoryName: row.categoryName ?? "General",
      duration: formatDuration(row.durationValue, row.durationUnit),
      activationType: String(row.fulfillmentType)
        .replaceAll("_", " ")
        .toLowerCase(),
      warranty: undefined,
      priceNprMinor: row.price ?? 0,
      stockStatus: stockStatus(row.seedQty),
      fulfillmentEstimate: "Typically within a few hours",
      authorizationVerified:
        row.vendorProofStatus === "VERIFIED" &&
        row.complianceStatus === "APPROVED",
      featured: Boolean(row.featured),
      variantSku: row.sku,
      variantName: row.variantName,
    });
  }
  return items.length ? items : getDemoCatalogWithVariants();
}
