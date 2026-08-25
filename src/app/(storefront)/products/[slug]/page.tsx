import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductCover } from "@/components/storefront/product-cover";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { Button } from "@/components/ui/button";
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
  familyDisplayTitle,
  findFamilyPlans,
  productFamilyKey,
} from "@/lib/catalog/product-families";
import { getGeneratedCover } from "@/lib/catalog/generated-covers";
import { PlanSwitcher } from "@/components/storefront/plan-switcher";
import { productEnquiryUrl, getWhatsAppDisplay } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { PriceInquiryNotice } from "@/components/storefront/price-inquiry-notice";
import { TrustStrip } from "@/components/storefront/trust-strip";
import { StickyMobileBuyBar } from "@/components/storefront/sticky-mobile-buy-bar";
import { ProductReviews } from "@/components/storefront/product-reviews";
import {
  JsonLd,
  breadcrumbJsonLd,
  productJsonLd,
} from "@/components/seo/json-ld";
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
    getGeneratedCover(product.slug, product.brandFamily) ?? product.coverPublicPath;
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
          <nav className="mb-4 text-sm text-[var(--text-muted)]">
            <Link href="/products" className="hover:text-[var(--primary)]">
              Products
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--text)]">{product.title}</span>
          </nav>
          <div className="flex flex-wrap gap-2">
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
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-3xl font-semibold text-[var(--text)] sm:text-4xl">
            {familyTitle}
          </h1>
          <p className="mt-2 text-lg font-medium text-[var(--text-secondary)]">
            {product.packageLabel}
            {product.durationLabel ? ` · ${product.durationLabel}` : ""}
            {familyPlans.length > 1
              ? ` · ${familyPlans.length} durations available`
              : ""}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
            {product.shortDescription}
          </p>
        </div>
      </div>

      <div className="store-container grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <TrustStrip compact />
          <PlanSwitcher plans={familyPlans} currentSlug={product.slug} />
          <ProductCover
            slug={product.slug}
            family={product.brandFamily}
            className="max-w-xl"
            title={`${product.title} artwork`}
            coverPublicPath={product.coverPublicPath}
            priority
          />

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Plan features
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)] sm:text-xl">
              What this plan includes
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Everything below is what you get with this package after payment is
              verified.
            </p>
            <ul className="mt-5 space-y-3">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex gap-3 rounded-xl bg-[var(--page-soft)] px-3 py-2.5 text-sm text-[var(--text-secondary)]"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--success-soft)] text-[11px] font-bold text-[var(--success)]"
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className="leading-snug">{f}</span>
                </li>
              ))}
            </ul>
          </section>

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
                  Choose at purchase: No warranty (current price) or With
                  warranty (+30%, guarantee length matches this plan).{" "}
                  {meta.warranty}
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--page-soft)] px-3 py-2 sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Fulfillment note
                </dt>
                <dd className="mt-1 font-medium">{product.fulfillmentEstimate}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
              {meta.notes}
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <h2 className="font-semibold">How fulfillment works</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
              <li>Open this product page and confirm price + package details.</li>
              <li>
                {product.purchasable
                  ? "Pick No warranty or With warranty (+30%), then use Check Availability / WhatsApp so TRIHEX can confirm the package before activation."
                  : "Use Check Availability / WhatsApp — online cart stays off until approved."}
              </li>
              <li>Pay with bank QR / eSewa / Khalti and upload payment proof.</li>
              <li>TRIHEX verifies payment, then activates or delivers the package.</li>
            </ol>
          </section>

          <ProductReviews reviews={reviews} />
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)] lg:sticky lg:top-24">
          {product.showPrice && product.priceNprMinor != null ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                Price (NPR)
              </p>
              {product.compareAtPriceNprMinor != null ? (
                <p className="mt-1 text-base text-[var(--text-muted)] line-through">
                  {formatStorePrice(product.compareAtPriceNprMinor)}
                </p>
              ) : null}
              <p className="font-[family-name:var(--font-sora)] text-3xl font-semibold">
                {formatStorePrice(product.priceNprMinor)}
              </p>
              {product.discountPercent != null && product.discountPercent > 0 ? (
                <p className="mt-1 text-sm font-semibold text-[var(--success)]">
                  Save {product.discountPercent}% vs list package price
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              Price shared after availability confirmation
            </p>
          )}
          <p className="text-sm text-[var(--text-muted)]">
            Support: {getWhatsAppDisplay()} · Final total recalculated at checkout.
          </p>
          {familyPlans.length > 1 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--page-soft)] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Other durations
              </p>
              <ul className="mt-2 space-y-1.5">
                {familyPlans.map((plan) => (
                  <li key={plan.slug}>
                    <Link
                      href={`/products/${plan.slug}`}
                      className={
                        plan.slug === product.slug
                          ? "text-xs font-semibold text-[var(--primary)]"
                          : "text-xs text-[var(--text-secondary)] hover:text-[var(--primary)]"
                      }
                    >
                      {plan.label}
                      {plan.showPrice && plan.priceNprMinor != null
                        ? ` · ${formatStorePrice(plan.priceNprMinor)}`
                        : ""}
                      {plan.slug === product.slug ? " ← selected" : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <PriceInquiryNotice />
          {features.length ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--page-soft)] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Plan highlights
              </p>
              <ul className="mt-2 space-y-1.5">
                {features.slice(0, 4).map((f) => (
                  <li
                    key={f}
                    className="flex gap-2 text-xs leading-snug text-[var(--text-secondary)]"
                  >
                    <span className="text-[var(--success)]" aria-hidden>
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            {product.purchasable ? (
              <ProductPurchasePanel
                basePriceNprMinor={
                  product.showPrice ? product.priceNprMinor : null
                }
                durationLabel={product.durationLabel ?? product.packageLabel}
                purchasable={product.purchasable}
                whatsappHref={waUrl}
              />
            ) : (
              <>
                <Button href={waUrl} external variant="primary" className="w-full">
                  Check Availability
                </Button>
                <Button href={waUrl} external variant="whatsapp" className="w-full">
                  WhatsApp +977 9702910130
                </Button>
                <Button href="/cart" variant="secondary">
                  View cart
                </Button>
              </>
            )}
          </div>
        </aside>
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

      <StickyMobileBuyBar
        title={product.title}
        priceNprMinor={product.showPrice ? product.priceNprMinor : null}
        durationLabel={product.durationLabel ?? product.packageLabel}
        purchasable={product.purchasable}
        whatsappHref={waUrl}
      />
    </div>
  );
}
