import type { ProductCardProps } from "@/components/storefront/product-card";
import {
  getDemoCatalogProducts,
  getDemoProductsByBrand,
  getDemoProductsByCategory,
} from "@/lib/catalog/demo-catalog";

const COLLECTION_META: Record<
  string,
  { title: string; description: string; filter: (products: ProductCardProps[]) => ProductCardProps[] }
> = {
  "trihex-owned": {
    title: "TRIHEX owned products",
    description:
      "Digital assets and services created or delivered directly by TRIHEX DIGITAL.",
    filter: () => getDemoProductsByBrand("trihex"),
  },
  featured: {
    title: "Featured collection",
    description: "Highlighted TRIHEX products currently available on the storefront.",
    filter: (products) => products.filter((p) => p.featured),
  },
  services: {
    title: "Services collection",
    description: "Consultations and managed setup services for Nepali teams.",
    filter: () => getDemoProductsByCategory("services"),
  },
  "digital-assets": {
    title: "Digital assets",
    description: "Downloadable TRIHEX-owned resources.",
    filter: () => getDemoProductsByCategory("digital-assets"),
  },
};

export function getDemoCollection(slug: string) {
  const meta = COLLECTION_META[slug];
  if (!meta) return null;
  const products = meta.filter(getDemoCatalogProducts());
  return {
    slug,
    title: meta.title,
    description: meta.description,
    products,
  };
}

export function getDemoCollectionSlugs(): string[] {
  return Object.keys(COLLECTION_META);
}
