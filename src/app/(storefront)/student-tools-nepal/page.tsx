import type { Metadata } from "next";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoProductsByCategory } from "@/lib/catalog/demo-catalog";

export const metadata: Metadata = {
  title: "Student tools Nepal | TRIHEX DIGITAL",
  description:
    "Learning and productivity digital tools for Nepali students.",
};

export default function StudentToolsNepalPage() {
  const learning = getDemoProductsByCategory("learning");
  const assets = getDemoProductsByCategory("digital-assets");
  const products = [...learning, ...assets];

  return (
    <StorefrontPageShell
      title="Student tools for Nepal"
      description="Learning resources and affordable TRIHEX-owned assets for students."
    >
      <div className="mb-8 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Students across Nepal use online courses, note apps, and AI assistants for
          coursework and projects. TRIHEX focuses on listings we can support after
          payment — including owned digital packs priced for local budgets.
        </p>
        <p>
          Always verify that a subscription matches your institution&apos;s acceptable-use
          rules. We state supply authorization on each public product page.
        </p>
      </div>
      <ProductGrid products={products} />
    </StorefrontPageShell>
  );
}
