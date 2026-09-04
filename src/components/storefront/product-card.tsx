import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { MerchCard } from "@/lib/catalog/merchandising";

export type StockStatus =
  | "available"
  | "out_of_stock"
  | "under_review"
  | "in_stock"
  | "low_stock"
  | "made_to_order";

// Legacy interface for backwards compatibility
export interface ProductCardProps {
  slug: string;
  name: string;
  brandName?: string;
  categoryName?: string;
  priceNprMinor: number | null;
  compareAtPriceNprMinor?: number | null;
  discountPercent?: number | null;
  duration?: string | null;
  stockStatus?: StockStatus;
  features?: string[];
  coverPublicPath?: string | null;
  shortDescription?: string;
  warranty?: string | null;
  activationType: string;
  fulfillmentEstimate: string;
  featured?: boolean;
  authorizationVerified?: boolean;
}

function formatPrice(minor: number | null | undefined): string {
  if (minor == null) return "";
  const major = Math.round(minor / 100);
  return `Rs. ${major.toLocaleString("en-IN")}`;
}

export function ProductCard({ product }: { product: MerchCard }) {
  const href = `/products/${product.slug}`;
  const isAvailable = product.purchasable;
  const isOutOfStock = product.visibility === "OUT_OF_STOCK";

  const statusLabel = isAvailable
    ? "Available"
    : isOutOfStock
      ? "Out of Stock"
      : "Check Availability";

  const statusColor = isAvailable
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
    : isOutOfStock
      ? "bg-red-500/15 text-red-400 border-red-500/20"
      : "bg-amber-500/15 text-amber-400 border-amber-500/20";

  const priceLabel = product.showPrice && product.priceNprMinor != null
    ? formatPrice(product.priceNprMinor)
    : null;

  const compareLabel =
    product.compareAtPriceNprMinor != null &&
    product.priceNprMinor != null &&
    product.compareAtPriceNprMinor > product.priceNprMinor
      ? formatPrice(product.compareAtPriceNprMinor)
      : null;

  const features = (product.features ?? []).slice(0, 3);
  const tierCount = product.variants?.length ?? 0;

  const waHref = buildWhatsAppUrl(
    `Hi TRIHEX! I want to order ${product.title} (${product.packageLabel}). Please confirm availability.`,
  );

  const imageSrc = product.thumbnailPublicPath ?? product.coverPublicPath;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_4px_20px_rgba(13,28,43,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_16px_36px_rgba(37,99,235,0.09)]">
      {/* Product image: 4:5 vertical ecommerce ratio with clean pearl-white background */}
      <Link
        href={href}
        className="relative block aspect-[4/5] w-full overflow-hidden border-b border-slate-100 bg-[linear-gradient(160deg,#ffffff_0%,#f8fafc_60%,#eff6ff_100%)] p-2"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`${product.title} product thumbnail`}
            fill
            className="object-contain p-1 transition-transform duration-500 group-hover:scale-[1.025]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20">
            <span className="text-4xl font-black text-white/30">
              {product.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute left-2.5 top-2.5">
          <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white shadow-sm backdrop-blur-md">
            {product.categoryLabel}
          </span>
        </div>

        {/* Discount badge */}
        {product.discountPercent != null && product.discountPercent > 0 && (
          <div className="absolute right-2.5 top-2.5">
            <span className="rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
              −{product.discountPercent}%
            </span>
          </div>
        )}

        {/* Multi-plan chip */}
        {tierCount > 1 && (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="rounded-full border border-slate-200/80 bg-white/90 px-2 py-0.5 text-[9px] font-bold text-slate-700 shadow-sm backdrop-blur-sm">
              {tierCount} plans
            </span>
          </div>
        )}
      </Link>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        {/* Status */}
        <div className="mb-1.5 flex items-center justify-between gap-1">
          <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide", statusColor)}>
            {statusLabel}
          </span>
          {product.stockLabel && (
            <span className="text-[9px] font-medium text-[var(--text-muted)]">{product.stockLabel}</span>
          )}
        </div>

        {/* Title */}
        <Link href={href}>
          <h3 className="line-clamp-2 text-xs font-extrabold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--primary)] sm:text-sm">
            {product.title}
          </h3>
        </Link>

        {/* Package label */}
        <p className="mt-0.5 text-[10px] font-medium text-[var(--text-muted)]">
          {product.packageLabel}
          {product.durationLabel ? ` · ${product.durationLabel}` : ""}
        </p>

        {/* Features */}
        {features.length > 0 && (
          <ul className="mt-2 space-y-1">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-[10px] text-[var(--text-secondary)]">
                <span className="mt-px h-3 w-3 shrink-0 rounded-full bg-[var(--success-soft)] text-center text-[8px] font-black leading-3 text-[var(--success)]">✓</span>
                <span className="line-clamp-1">{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-1.5">
          {priceLabel ? (
            <>
              <span className="font-[family-name:var(--font-sora)] text-sm font-black tracking-tight text-[var(--text)] sm:text-base">
                {priceLabel}
              </span>
              {compareLabel && (
                <span className="text-[10px] text-[var(--text-muted)] line-through">{compareLabel}</span>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold text-[var(--text-muted)]">Price on inquiry</span>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Link
            href={href}
            className="flex h-8 items-center justify-center rounded-xl bg-[var(--surface-ink)] text-[10px] font-bold text-white transition hover:bg-[var(--primary)] sm:text-xs"
          >
            {isAvailable ? "Buy Now" : "View"}
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 items-center justify-center rounded-xl border border-[#25d366]/30 bg-[#25d366]/8 text-[10px] font-bold text-[#1a8c4e] transition hover:bg-[#25d366]/15 sm:text-xs"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
