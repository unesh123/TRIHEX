import type { Metadata } from "next";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Button } from "@/components/ui/button";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";

export const metadata: Metadata = {
  title: "Best AI Tools in Nepal | ChatGPT, Gemini, Grok",
  description:
    "Shop AI tools in Nepal with NPR pricing — ChatGPT Plus, Gemini, Grok and more. Website checkout, bank QR payment, WhatsApp support from TRIHEX DIGITAL.",
  alternates: { canonical: "/ai-tools-nepal" },
  keywords: [
    "AI tools Nepal",
    "ChatGPT Nepal",
    "Gemini Nepal",
    "best AI tools Nepal",
  ],
};

export default async function AiToolsNepalPage() {
  const products = await getLiveMerchandisingCatalogue({ categorySlug: "ai-tools" });

  return (
    <StorefrontPageShell
      title="AI tools for Nepal"
      description="AI assistant packages for Nepal. Under-review items stay visible without checkout until compliance approval."
    >
      <div className="mb-8 max-w-3xl space-y-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        <p>
          Compare package duration and availability. Only approved packages include
          Add to Cart. WhatsApp is for questions — the website remains the order
          system of record.
        </p>
      </div>
      <ProductGrid
        products={products}
        emptyMessage="No AI tool listings found."
      />
      <Button href="/products" variant="secondary" className="mt-8">
        All products
      </Button>
    </StorefrontPageShell>
  );
}
