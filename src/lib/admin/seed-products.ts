import {
  ALL_SEED_PRODUCTS,
  type SeedProduct,
  type SeedVariant,
} from "@/db/seed-data";

export function findSeedProduct(idOrSlug: string): SeedProduct | undefined {
  const bySlug = ALL_SEED_PRODUCTS.find((p) => p.slug === idOrSlug);
  if (bySlug) return bySlug;

  const index = Number.parseInt(idOrSlug, 10);
  if (
    Number.isInteger(index) &&
    index >= 0 &&
    index < ALL_SEED_PRODUCTS.length
  ) {
    return ALL_SEED_PRODUCTS[index];
  }

  return undefined;
}

export function seedProductHref(product: SeedProduct): string {
  return `/admin/products/${product.slug}`;
}

export function primaryVariant(product: SeedProduct): SeedVariant | undefined {
  return product.variants[0];
}

export function productsNeedingVerification(): SeedProduct[] {
  return ALL_SEED_PRODUCTS.filter((p) => p.needsDataVerification);
}

export function countByStatus(status: SeedProduct["productStatus"]): number {
  return ALL_SEED_PRODUCTS.filter((p) => p.productStatus === status).length;
}
