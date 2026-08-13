import Link from "next/link";
import { ProductCover } from "@/components/storefront/product-cover";
import { BuyNowButton } from "@/components/storefront/buy-now-button";
import {
  formatStorePrice,
  visibilityLabelForCard,
  type MerchCard,
} from "@/lib/catalog/merchandising";
import { productEnquiryUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Legacy card shape used by demo catalog helpers. */
export type StockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "made_to_order";

export interface ProductCardProps {
  slug: string;
  name: string;
  shortDescription?: string;
  brandName?: string;
  categoryName?: string;
  duration?: string;
  activationType: string;
  warranty?: string;
  priceNprMinor: number;
  stockStatus: StockStatus;
  fulfillmentEstimate: string;
  authorizationVerified?: boolean;
  featured?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  className,
}: {
  product: MerchCard;
  className?: string;
}) {
  const status = visibilityLabelForCard(product);
  const statusTone =
    product.visibility === "AVAILABLE"
      ? "bg-[var(--success-soft)] text-[var(--success)]"
      : product.visibility === "BLOCKED" || product.visibility === "OUT_OF_STOCK"
        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
        : "bg-[var(--warning-soft)] text-[var(--warning)]";

  const wa = productEnquiryUrl({
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
    features: product.features,
  });
  const href = `/products/${product.slug}`;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_6px_18px_var(--shadow)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_var(--shadow)] sm:rounded-2xl",
        className,
      )}
    >
      <Link href={href} className="relative block p-2 pb-0 sm:p-3 sm:pb-0">
        <ProductCover
          slug={product.slug}
          family={product.brandFamily}
          title={`${product.title} product visual`}
          coverPublicPath={product.coverPublicPath}
        />
        {product.discountPercent != null && product.discountPercent > 0 ? (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[var(--danger)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm sm:left-5 sm:top-5 sm:px-2.5 sm:py-1 sm:text-[11px]">
            −{product.discountPercent}%
          </span>
        ) : product.isFamilyCard && product.familyPlans && product.familyPlans.length > 1 ? (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)] shadow-sm sm:left-5 sm:top-5 sm:px-2.5 sm:py-1 sm:text-[11px]">
            {product.familyPlans.length} plans
          </span>
        ) : (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)] shadow-sm sm:left-5 sm:top-5 sm:px-2.5 sm:py-1 sm:text-[11px]">
            {product.durationLabel ?? product.packageLabel}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-2.5 pt-2 sm:gap-3 sm:p-4 sm:pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--text-secondary)] sm:px-2.5 sm:py-1 sm:text-[11px]">
            {product.categoryLabel}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide sm:px-2.5 sm:py-1 sm:text-[11px]",
              statusTone,
            )}
          >
            {status}
          </span>
          {product.stockLabel && !product.isFamilyCard ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-semibold sm:px-2.5 sm:py-1 sm:text-[11px]",
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

        <div>
          <p className="hidden text-xs font-medium text-[var(--text-muted)] sm:block">
            {product.brandName}
          </p>
          <Link href={href}>
            <h3 className="font-[family-name:var(--font-sora)] text-[13px] font-semibold leading-snug text-[var(--text)] transition group-hover:text-[var(--primary)] sm:mt-1 sm:text-base sm:text-[17px]">
              {product.title}
            </h3>
          </Link>
          {product.isFamilyCard && product.familyPlans && product.familyPlans.length > 1 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {product.familyPlans.slice(0, 4).map((plan) => (
                <Link
                  key={plan.slug}
                  href={`/products/${plan.slug}`}
                  className="rounded-md bg-[var(--page-soft)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-secondary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] sm:text-[10px]"
                >
                  {plan.label}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--text-secondary)] sm:text-sm">
              {product.packageLabel}
            </p>
          )}
        </div>

        <ul className="space-y-1">
          {product.features.slice(0, 2).map((f) => (
            <li
              key={f}
              className="line-clamp-1 text-[10px] leading-snug text-[var(--text-muted)] sm:text-[11px]"
            >
              ✓ {f}
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-[var(--border)] pt-2 sm:pt-3">
          {product.showPrice && product.priceNprMinor != null ? (
            <div>
              {product.compareAtPriceNprMinor != null ? (
                <p className="text-[10px] text-[var(--text-muted)] line-through sm:text-[11px]">
                  {formatStorePrice(product.compareAtPriceNprMinor)}
                </p>
              ) : (
                <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] sm:text-[11px]">
                  {product.isFamilyCard ? "From" : "Price"}
                </p>
              )}
              <p className="font-[family-name:var(--font-sora)] text-base font-semibold text-[var(--text)] sm:text-xl">
                {formatStorePrice(product.priceNprMinor)}
              </p>
              {product.isFamilyCard ? (
                <p className="text-[10px] text-[var(--text-muted)] sm:text-xs">
                  Open details to switch 1 / 3 / 6 / 12 month plans
                </p>
              ) : product.discountPercent != null && product.discountPercent > 0 ? (
                <p className="text-[10px] font-medium text-[var(--success)] sm:text-xs">
                  You save {product.discountPercent}%
                </p>
              ) : null}
              <p className="mt-1 hidden text-[10px] leading-snug text-[var(--text-muted)] sm:block">
                Price may change — please inquire before buying.
              </p>
            </div>
          ) : (
            <p className="text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
              Price on enquiry
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
          {product.isFamilyCard ? (
            <Link
              href={href}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--primary)] px-2 text-xs font-semibold text-white hover:bg-[var(--primary-hover)] sm:h-11 sm:rounded-xl sm:px-3 sm:text-sm"
            >
              View plans
            </Link>
          ) : product.purchasable ? (
            <BuyNowButton
              productSlug={product.slug}
              variantSku={product.variantSku}
            />
          ) : (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--primary)] px-2 text-xs font-semibold text-white hover:bg-[var(--primary-hover)] sm:h-11 sm:rounded-xl sm:px-3 sm:text-sm"
            >
              Check Availability
            </a>
          )}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <Link
              href={href}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white px-2 text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--page-soft)] sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
            >
              Details
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white px-2 text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--page-soft)] sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
