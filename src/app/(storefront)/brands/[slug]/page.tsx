import { notFound } from "next/navigation";
import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import {
  getDemoBrands,
  getDemoProductsByBrand,
} from "@/lib/catalog/demo-catalog";

export const dynamic = "force-dynamic";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = getDemoBrands().find((b) => b.slug === slug);
  if (!brand) notFound();

  const products = getDemoProductsByBrand(slug);

  return (
    <StorefrontPageShell
      title={brand.name}
      description={
        brand.isOwnBrand
          ? "TRIHEX-owned digital products and services."
          : `Public products associated with ${brand.name}. Affiliation stated only where verified.`
      }
    >
      <ProductGrid
        products={products}
        emptyMessage="No public products for this brand on the storefront."
      />
      <p className="mt-8 text-sm text-text-muted">
        <Link href="/products" className="text-primary hover:underline">
          View all products
        </Link>
      </p>
    </StorefrontPageShell>
  );
}
