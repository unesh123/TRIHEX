import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import type { DemoCatalogItem } from "@/lib/catalog/demo-catalog";
import { resolveStorefrontBankQrPath } from "@/lib/payments/resolve-bank-qr";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const qrSrc = await resolveStorefrontBankQrPath();
  const catalog: DemoCatalogItem[] = (
    await getLiveMerchandisingCatalogue({
      visibility: ["AVAILABLE"],
    })
  ).map((p) => ({
    slug: p.slug,
    name: p.title,
    shortDescription: p.shortDescription,
    brandName: p.brandName,
    categoryName: p.categoryName,
    duration: p.durationLabel ?? undefined,
    activationType: p.activationLabel,
    warranty: p.warrantyLabel ?? undefined,
    priceNprMinor: p.priceNprMinor ?? 0,
    stockStatus: "in_stock",
    fulfillmentEstimate: p.fulfillmentEstimate,
    authorizationVerified: true,
    featured: p.featured,
    variantSku: p.variantSku,
    variantName: p.packageLabel,
  }));

  return (
    <StorefrontPageShell
      title="Checkout"
      description="Place your order on the website. Payment is verified separately — WhatsApp does not mark orders paid."
    >
      <CheckoutForm catalog={catalog} qrSrc={qrSrc} />
    </StorefrontPageShell>
  );
}
