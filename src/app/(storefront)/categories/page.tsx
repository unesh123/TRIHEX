import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { getDemoCategories } from "@/lib/catalog/demo-catalog";

export const dynamic = "force-dynamic";

export default function CategoriesPage() {
  const categories = getDemoCategories();

  return (
    <StorefrontPageShell
      title="Categories"
      description="Browse verified public products by category."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/categories/${c.slug}`}
              className="block rounded-lg border border-border bg-surface/60 p-5 transition hover:border-primary/40"
            >
              <h2 className="font-semibold text-text">{c.name}</h2>
              <p className="mt-2 text-sm text-text-muted">
                {c.productCount} public product{c.productCount === 1 ? "" : "s"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </StorefrontPageShell>
  );
}
