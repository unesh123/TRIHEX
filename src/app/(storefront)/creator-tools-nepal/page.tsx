import type { Metadata } from "next";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getDemoProductsByCategory } from "@/lib/catalog/demo-catalog";

export const metadata: Metadata = {
  title: "Creator tools Nepal | TRIHEX DIGITAL",
  description:
    "Design, video, and prompt resources for Nepali creators from TRIHEX DIGITAL.",
};

export default function CreatorToolsNepalPage() {
  const design = getDemoProductsByCategory("design");
  const video = getDemoProductsByCategory("video-editing");
  const assets = getDemoProductsByCategory("digital-assets");
  const products = [...design, ...video, ...assets];

  return (
    <StorefrontPageShell
      title="Creator tools for Nepal"
      description="Design, video, and digital assets with transparent fulfillment."
    >
      <div className="mb-8 max-w-3xl space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          Creators in Nepal need reliable access to editing software, templates, and
          AI-assisted workflows without surprise activation methods. TRIHEX product
          cards state duration, activation type, and estimated delivery time upfront.
        </p>
        <p>
          Our owned AI Prompt Starter Pack is built for Nepali creators who want
          production-ready prompts without hunting unreliable free lists online.
        </p>
      </div>
      <ProductGrid products={products} />
    </StorefrontPageShell>
  );
}
