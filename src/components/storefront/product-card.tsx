import Link from "next/link";
import { ArrowUpRight, Check, Clock3, MessageCircle, PackageCheck } from "lucide-react";
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
  const primaryActionLabel = product.isFamilyCard
    ? "View plans"
    : product.purchasable
      ? "Buy now"
      : "Check availability";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.45rem] border border-[var(--border)] bg-white shadow-[0_10px_28px_rgba(16,24,39,.055)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-[0_22px_48px_rgba(16,24,39,.13)] focus-within:border-[var(--primary)]/45",
        className,
      )}
    >
      <Link href={href} className="relative block overflow-hidden bg-[linear-gradient(145deg,#eef3f8,#f8fafc)] p-2.5 sm:p-3">
        <ProductCover
          slug={product.slug}
          family={product.brandFamily}
          title={`${product.title} product visual`}
          coverPublicPath={product.coverPublicPath}
          className="aspect-[1.24] rounded-[1.05rem] border-0 bg-[linear-gradient(145deg,#eaf0f7,#ffffff)] transition duration-500 group-hover:scale-[1.018]"
        />
        <div className="absolute left-5 top-5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-white/70 bg-white/92 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-secondary)] shadow-sm backdrop-blur">
            {product.durationLabel ?? product.packageLabel}
          </span>
          {product.discountPercent != null && product.discountPercent > 0 ? (
            <span className="rounded-full bg-[var(--danger)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white shadow-sm">−{product.discountPercent}%</span>
          ) : null}
        </div>
        <span className="absolute bottom-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/92 text-[var(--primary)] shadow-sm backdrop-blur transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">View {product.title}</span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--primary)]">{product.categoryLabel}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.09em]", statusTone)}>{status}</span>
          {product.stockLabel && !product.isFamilyCard ? (
            <span className="text-[10px] font-semibold text-[var(--text-muted)]">{product.stockLabel}</span>
          ) : null}
        </div>

        <div className="mt-3">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{product.brandName}</p>
          <Link href={href}>
            <h3 className="mt-1 font-[family-name:var(--font-sora)] text-[1.12rem] font-semibold leading-snug tracking-[-0.03em] text-[var(--text)] transition group-hover:text-[var(--primary)]">
              {product.title}
            </h3>
          </Link>
          {product.isFamilyCard && product.familyPlans && product.familyPlans.length > 1 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.familyPlans.slice(0, 4).map((plan) => (
                <Link
                  key={plan.slug}
                  href={`/products/${plan.slug}`}
                  className="rounded-md bg-[var(--page-soft)] px-2 py-1 text-[10px] font-bold text-[var(--text-secondary)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                >
                  {plan.label}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 line-clamp-1 text-sm text-[var(--text-secondary)]">{product.packageLabel}</p>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-[var(--page-soft)]/75 px-3 py-2.5">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--success)]" aria-hidden="true" />
            <span className="line-clamp-1">{product.features[0] ?? "Package details confirmed before fulfillment."}</span>
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
            <Clock3 className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />
            <span className="line-clamp-1">{product.fulfillmentEstimate}</span>
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-[var(--border)] pt-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--text-muted)]">
              {product.isFamilyCard ? "From" : product.showPrice ? "Price" : "On enquiry"}
            </p>
            {product.showPrice && product.priceNprMinor != null ? (
              <>
                <p className="mt-1 font-[family-name:var(--font-sora)] text-xl font-bold tracking-[-0.035em] text-[var(--text)]">{formatStorePrice(product.priceNprMinor)}</p>
                {product.compareAtPriceNprMinor != null ? (
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)] line-through">{formatStorePrice(product.compareAtPriceNprMinor)}</p>
                ) : null}
              </>
            ) : (
              <p className="mt-1 text-sm font-bold text-[var(--text-secondary)]">Ask TRIHEX</p>
            )}
          </div>
          {product.stockLabel ? <PackageCheck className="h-5 w-5 text-[var(--primary)]/55" aria-hidden="true" /> : null}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          {product.isFamilyCard ? (
            <Link href={href} className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--surface-ink)] px-3 text-sm font-bold text-white transition hover:bg-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
              {primaryActionLabel}
            </Link>
          ) : product.purchasable ? (
            <BuyNowButton productSlug={product.slug} variantSku={product.variantSku} />
          ) : (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--surface-ink)] px-3 text-sm font-bold text-white transition hover:bg-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
              {primaryActionLabel}
            </a>
          )}
          <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={`Ask about ${product.title} on WhatsApp`} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white text-[var(--text-secondary)] transition hover:border-[var(--success)] hover:bg-[var(--success-soft)] hover:text-[var(--success)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
