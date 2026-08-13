import { notFound } from "next/navigation";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoCollection } from "@/lib/catalog/collections";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getDemoCollection(slug);
  if (!collection) notFound();

  return (
    <StorefrontPageShell
      title={collection.title}
      description={collection.description}
    >
      <ProductGrid products={collection.products} />
    </StorefrontPageShell>
  );
}
