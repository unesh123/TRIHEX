import { notFound } from "next/navigation";
import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoCategories } from "@/lib/catalog/demo-catalog";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getDemoCategories().find((c) => c.slug === slug);
  if (!category) notFound();

  const products = await getLiveMerchandisingCatalogue({ categorySlug: slug });

  return (
    <StorefrontPageShell
      title={category.name}
      description={`Packages in ${category.name}. Under-review items are visible without checkout until approved.`}
    >
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
