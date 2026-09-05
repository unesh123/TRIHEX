import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductCover } from "@/components/storefront/product-cover";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { FeaturePosterLightbox } from "@/components/storefront/feature-poster-lightbox";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";
import {
  ProductPurchasePanel,
  type PurchasePlan,
} from "@/components/storefront/product-purchase-panel";
import {
  detailMetaForSlug,
  featuresForSlug,
} from "@/lib/catalog/package-features";
import {
  formatStorePrice,
  getLiveMerchCardBySlug,
  getLiveMerchandisingCatalogue,
  visibilityLabelForCard,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import {
  durationSortDays,
  familyDisplayTitle,
  findFamilyPlans,
  productFamilyKey,
} from "@/lib/catalog/product-families";
import { getGeneratedCover } from "@/lib/catalog/generated-covers";
import { getProductCover } from "@/lib/catalog/product-covers";
import { resolveProductGallery } from "@/lib/catalog/product-image-resolver";
import { productEnquiryUrl, getWhatsAppDisplay } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { TrustStrip } from "@/components/storefront/trust-strip";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { PDPFeatureGrid } from "@/components/storefront/pdp-feature-grid";
import { PDPTargetAudience } from "@/components/storefront/pdp-target-audience";
import { PDPFulfillmentTimeline } from "@/components/storefront/pdp-fulfillment-timeline";
import { PDPVerifiedClaims } from "@/components/storefront/pdp-verified-claims";
import {
  JsonLd,
  breadcrumbJsonLd,
  productJsonLd,
} from "@/components/seo/json-ld";
import { PDPIntelligenceHub } from "@/components/storefront/pdp-intelligence-hub";
import { getSiteUrl } from "@/lib/site";
import { isDatabaseConfigured } from "@/lib/env";
import { listApprovedReviewsForSlug } from "@/lib/reviews/store";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getLiveMerchCardBySlug(slug);
  if (!product) return { title: "Product not found" };

  const priceLabel =
    product.showPrice && product.priceNprMinor != null
      ? formatStorePrice(product.priceNprMinor)
      : "Price on enquiry";
  const description =
    product.shortDescription?.trim() ||
    `Buy ${product.title} in Nepal (${product.packageLabel}) — ${priceLabel}. Website checkout, NPR payment, WhatsApp support.`;

  return {
    title: `${product.title} — Buy in Nepal`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.title} | TRIHEX DIGITAL Nepal`,
      description,
      url: `${getSiteUrl()}/products/${product.slug}`,
      type: "website",
      images: product.coverPublicPath
        ? [{ url: product.coverPublicPath }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getLiveMerchCardBySlug(slug);
  if (!product) notFound();

  const catalogue = await getLiveMerchandisingCatalogue();
  const familyPlans = findFamilyPlans(catalogue, product.slug);
  const familyTitle = familyDisplayTitle(product);
  const familyCards = catalogue.filter(
    (c) => productFamilyKey(c.slug) === productFamilyKey(product.slug),
  );

  const purchasePlans: PurchasePlan[] = [];
  if (familyCards.length > 1) {
    const sortedFamilyCards = [...familyCards].sort(
      (a, b) => durationSortDays(a) - durationSortDays(b),
    );
    for (const card of sortedFamilyCards) {
      const priceNpr = Math.round((card.priceNprMinor ?? 0) / 100);
      const isPrivate =
        /private|own account/i.test(card.title) ||
        /private/i.test(card.packageLabel);
      const isShared =
        /shared/i.test(card.title) || /shared/i.test(card.packageLabel);
      const accessType = isPrivate
        ? "Private (Own Account)"
        : isShared
          ? "Shared Plan"
          : "Standard Plan";

      const warrantyLabel =
        card.warrantyLabel && card.warrantyLabel !== "No warranty"
          ? card.warrantyLabel
          : isPrivate
            ? "1-Year full replacement warranty"
            : isShared
              ? "Full term replacement warranty"
              : "Full term warranty";

      purchasePlans.push({
        id: card.variantSku || card.slug,
        slug: card.slug,
        durationLabel: card.durationLabel ?? card.packageLabel ?? "Standard plan",
        accessLabel: accessType,
        warrantyLabel,
        activationLabel: card.activationLabel ?? "Instant activation",
        availability: card.purchasable ? "available" : "under_review",
        priceNpr,
        compareAtPriceNpr: card.compareAtPriceNprMinor
          ? Math.round(card.compareAtPriceNprMinor / 100)
          : null,
        discountPercent: card.discountPercent ?? null,
      });
    }
  } else if (product.variants && product.variants.length > 1) {
    for (const v of product.variants) {
      const priceNpr = Math.round(
        (v.priceNprMinor ?? product.priceNprMinor ?? 0) / 100,
      );
      purchasePlans.push({
        id: v.sku,
        slug: product.slug,
        durationLabel: v.durationLabel ?? product.durationLabel ?? "Standard plan",
        accessLabel: v.variantName || "Standard Plan",
        warrantyLabel: v.warrantyLabel ?? product.warrantyLabel ?? "Full warranty",
        activationLabel:
          v.activationLabel ?? product.activationLabel ?? "Direct activation",
        availability:
          (v.availability as any) ??
          (v.purchasable ? "available" : "under_review"),
        priceNpr,
        compareAtPriceNpr: v.compareAtPriceNprMinor
          ? Math.round(v.compareAtPriceNprMinor / 100)
          : null,
        discountPercent: v.discountPercent ?? null,
      });
    }
  } else {
    const priceNpr = Math.round((product.priceNprMinor ?? 0) / 100);
    const isPrivate = /private|own account/i.test(product.title);
    const isShared = /shared/i.test(product.title);
    purchasePlans.push({
      id: product.variantSku || product.slug,
      slug: product.slug,
      durationLabel:
        product.durationLabel ?? product.packageLabel ?? "Standard plan",
      accessLabel: isPrivate
        ? "Private (Own Account)"
        : isShared
          ? "Shared Plan"
          : "Standard access",
      warrantyLabel: product.warrantyLabel ?? "Full replacement warranty",
      activationLabel: product.activationLabel ?? "Direct activation",
      availability: product.purchasable ? "available" : "under_review",
      priceNpr,
      compareAtPriceNpr: product.compareAtPriceNprMinor
        ? Math.round(product.compareAtPriceNprMinor / 100)
        : null,
      discountPercent: product.discountPercent ?? null,
    });
  }
  const related = withFamilyGrouping(catalogue
    .filter(
      (p) =>
        productFamilyKey(p.slug) !== productFamilyKey(product.slug) &&
        p.brandSlug === product.brandSlug &&
        p.slug !== product.slug,
    ))
    .slice(0, 3);
  if (related.length < 3) {
    const more = withFamilyGrouping(catalogue
      .filter(
        (p) =>
          p.categorySlug === product.categorySlug &&
          p.slug !== product.slug &&
          !related.some((r) => r.slug === p.slug) &&
          productFamilyKey(p.slug) !== productFamilyKey(product.slug),
      ))
      .slice(0, 3 - related.length);
    related.push(...more);
  }
  const features = product.features.length
    ? product.features
    : featuresForSlug(product.slug);
  const meta = detailMetaForSlug(product.slug);
  const coverPath =
    product.coverPublicPath ??
    getProductCover(product.slug)?.publicPath ??
    getGeneratedCover(product.slug, product.brandFamily);
  const waUrl = productEnquiryUrl({
    productName: product.title,
    variantName: product.packageLabel,
    slug: product.slug,
    priceLabel:
      product.showPrice && product.priceNprMinor != null
        ? formatStorePrice(product.priceNprMinor)
        : null,
    compareAtLabel:
      product.compareAtPriceNprMinor != null
        ? formatStorePrice(product.compareAtPriceNprMinor)
        : null,
    features,
  });
  const status = visibilityLabelForCard(product);
  const availability =
    product.stockQty === 0
      ? ("OutOfStock" as const)
      : product.purchasable
        ? ("InStock" as const)
        : ("PreOrder" as const);

  const reviews = isDatabaseConfigured()
    ? await listApprovedReviewsForSlug({
        slug: product.slug,
        categorySlug: product.categorySlug,
      })
    : [];

  return (
    <div className="min-h-[60vh] bg-[var(--page)] pb-24 md:pb-0">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.title, path: `/products/${product.slug}` },
          ]),
          productJsonLd({
            name: product.title,
            description:
              product.shortDescription ??
              `${product.title} — ${product.packageLabel} available in Nepal via TRIHEX DIGITAL.`,
            slug: product.slug,
            image: coverPath,
            priceNprMinor: product.showPrice ? product.priceNprMinor : null,
            availability,
          }),
        ]}
      />
      <div className="border-b border-[var(--border)] bg-white">
        <div className="store-container py-8 sm:py-10">
          <nav className="mb-4 text-xs font-semibold text-[var(--text-muted)] sm:text-sm">
            <Link href="/" className="hover:text-[var(--primary)]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-[var(--primary)]">
              Products
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/categories/${product.categorySlug}`}
              className="hover:text-[var(--primary)]"
            >
              {product.categoryLabel}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--text)]">{product.title}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {product.categoryLabel}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                product.purchasable
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : product.visibility === "BLOCKED"
                    ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                    : "bg-[var(--warning-soft)] text-[var(--warning)]",
              )}
            >
              {status}
            </span>
            {product.stockLabel ? (
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  product.stockQty === 0
                    ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                    : product.stockQty != null && product.stockQty <= 5
                      ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                      : "bg-[var(--surface-muted)] text-[var(--text-secondary)]",
                )}
              >
                {product.stockLabel}
              </span>
            ) : null}
            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200/60">
              <span className="text-amber-500">★★★★★</span>
              <span>4.8/5</span>
              <span className="font-normal text-amber-700/80">· Verified in Nepal</span>
            </div>
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-3xl font-semibold text-[var(--text)] sm:text-4xl">
            {familyTitle}
          </h1>
          <p className="mt-2 text-lg font-medium text-[var(--text-secondary)]">
            {(() => {
              const pkg = product.packageLabel?.trim() || "";
              const dur = product.durationLabel?.trim() || "";
              const showDur =
                dur &&
                pkg.toLowerCase() !== dur.toLowerCase() &&
                !pkg.toLowerCase().includes(dur.toLowerCase());
              return (
                <>
                  {pkg}
                  {showDur ? ` · ${dur}` : ""}
                  {familyPlans.length > 1
                    ? ` · ${familyPlans.length} plans available`
                    : ""}
                </>
              );
            })()}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
            {product.shortDescription}
          </p>
        </div>
      </div>

      <div className="store-container grid gap-8 py-8 lg:py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6 min-w-0">
          <ProductGallery
            slug={product.slug}
            title={product.title}
            images={resolveProductGallery(product)}
            priority
          />

          {/* Mobile-first Purchase Island: immediately visible below media on mobile (< lg) */}
          <div className="block lg:hidden">
            <ProductPurchasePanel
              productSlug={product.slug}
              productTitle={product.title}
              variantSku={product.variantSku}
              basePriceNprMinor={
                product.showPrice ? product.priceNprMinor : null
              }
              durationLabel={product.durationLabel ?? product.packageLabel}
              purchasable={product.purchasable}
              whatsappHref={waUrl}
              plans={purchasePlans}
              variants={product.variants}
            />
          </div>

          <TrustStrip compact />

          <PDPVerifiedClaims slug={product.slug} />

          <PDPFeatureGrid
            productTitle={product.title}
            slug={product.slug}
            features={features}
          />

          <PDPTargetAudience
            categorySlug={product.categorySlug}
            productTitle={product.title}
          />

          <PDPFulfillmentTimeline
            activationLabel={product.activationLabel}
            deliveryEstimate={meta.delivery}
            warrantyLabel={product.warrantyLabel ?? undefined}
          />

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)]">
            <h2 className="font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)]">
              Package details
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--page-soft)] px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Brand
                </dt>
                <dd className="mt-1 font-medium">{product.brandName}</dd>
              </div>
              <div className="rounded-xl bg-[var(--page-soft)] px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Package
                </dt>
                <dd className="mt-1 font-medium">{product.packageLabel}</dd>
              </div>
              {product.durationLabel ? (
                <div className="rounded-xl bg-[var(--page-soft)] px-3 py-2">
                  <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    Duration
                  </dt>
                  <dd className="mt-1 font-medium">{product.durationLabel}</dd>
                </div>
              ) : null}
              <div className="rounded-xl bg-[var(--page-soft)] px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Status
                </dt>
                <dd className="mt-1 font-medium">{status}</dd>
              </div>
              <div className="rounded-xl bg-[var(--page-soft)] px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Activation
                </dt>
                <dd className="mt-1 font-medium">{product.activationLabel}</dd>
              </div>
              <div className="rounded-xl bg-[var(--page-soft)] px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Delivery estimate
                </dt>
                <dd className="mt-1 font-medium">{meta.delivery}</dd>
              </div>
              <div className="rounded-xl bg-[var(--page-soft)] px-3 py-2 sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Warranty / support
                </dt>
                <dd className="mt-1 font-medium">
                  {product.warrantyLabel ?? "Standard warranty terms for selected plan apply."}
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--page-soft)] px-3 py-2 sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Fulfillment note
                </dt>
                <dd className="mt-1 font-medium">{product.fulfillmentEstimate}</dd>
              </div>
            </dl>
            {meta.notes && (
              <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
                {meta.notes}
              </p>
            )}
          </section>

          <details className="group rounded-2xl border border-[var(--border)] bg-white p-5 transition">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-[var(--text)]">
              <span>How delivery &amp; fulfillment works</span>
              <span className="text-xs text-[var(--text-muted)] transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm text-[var(--text-secondary)]">
              <li>Review the package details and select your preferred plan.</li>
              <li>
                {product.purchasable
                  ? "Click Add to cart or Instant Checkout. Pricing, stock and terms are revalidated before payment."
                  : "Click Confirm availability to check current supplier supply with TRIHEX before payment."}
              </li>
              <li>Complete payment via bank QR, eSewa, or Khalti and submit proof.</li>
              <li>TRIHEX verifies payment and delivers or activates your subscription.</li>
            </ol>
          </details>

          <ProductReviews reviews={reviews} />
        </div>

        {/* Desktop Sticky Aside (>= lg) */}
        <aside className="hidden lg:block h-fit space-y-4 lg:sticky lg:top-24">
          <ProductPurchasePanel
            productSlug={product.slug}
            productTitle={product.title}
            variantSku={product.variantSku}
            basePriceNprMinor={
              product.showPrice ? product.priceNprMinor : null
            }
            durationLabel={product.durationLabel ?? product.packageLabel}
            purchasable={product.purchasable}
            whatsappHref={waUrl}
            plans={purchasePlans}
            variants={product.variants}
          />
        </aside>
      </div>

      <div className="store-container pb-10">
        <PDPIntelligenceHub product={product} />
      </div>

      {related.length ? (
        <div className="store-container pb-10">
          <h2 className="mb-5 font-[family-name:var(--font-sora)] text-xl font-semibold">
            Related packages
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/products/${item.slug}`}
                className="rounded-xl border border-[var(--border)] bg-white p-4 hover:border-[var(--primary)]"
              >
                <ProductCover
                  slug={item.slug}
                  family={item.brandFamily}
                  title={item.title}
                  coverPublicPath={item.coverPublicPath}
                  className="mb-3"
                />
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {item.packageLabel}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="store-container pb-12">
        <ComplianceDisclaimer />
      </div>
    </div>
  );
}
