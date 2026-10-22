import type { Metadata } from "next";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoCategories } from "@/lib/catalog/demo-catalog";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/live-merchandising";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getDemoCategories().find((c) => c.slug === slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} AI Subscriptions in Nepal — 3x Digital`,
    description: `Buy ${category.name} software and AI subscriptions in Nepal with transparent NPR prices, bank QR pay, and WhatsApp activation.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getDemoCategories().find((c) => c.slug === slug);
  if (!category) notFound();

  const products = await getLiveMerchandisingCatalogue({ categorySlug: slug });

  return (
    <StorefrontPageShell
      title={category.name}
      description={`Packages in ${category.name}. Transparent NPR pricing, bank QR checkout, and verified WhatsApp delivery.`}
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
            { name: category.name, path: `/categories/${slug}` },
          ]),
        ]}
      />
      <nav className="mb-6 text-sm text-[var(--text-muted)]">
        <Link href="/categories" className="hover:text-[var(--primary)]">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span>{category.name}</span>
      </nav>
      <ProductGrid
        products={products}
        emptyMessage="No packages in this category yet."
      />
    </StorefrontPageShell>
  );
}
