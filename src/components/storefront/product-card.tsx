import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ProductImage } from "@/components/storefront/product-image";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { MerchCard } from "@/lib/catalog/merchandising";
import { LimitedOfferBanner } from "./limited-offer-banner";

export type StockStatus =
  | "available"
  | "out_of_stock"
  | "under_review"
  | "in_stock"
  | "low_stock"
  | "made_to_order";

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

  const priceLabel =
    product.showPrice && product.priceNprMinor != null
      ? formatPrice(product.priceNprMinor)
      : null;

  const compareLabel =
    product.compareAtPriceNprMinor != null &&
    product.priceNprMinor != null &&
    product.compareAtPriceNprMinor > product.priceNprMinor
      ? formatPrice(product.compareAtPriceNprMinor)
      : null;

  const tierCount =
    product.variantCount ?? product.variants?.length ?? product.familyPlans?.length ?? 0;

  // Extract concise duration string suitable for mobile cards
  const durationText = (() => {
    const dur = product.durationLabel?.trim();
    if (dur && !dur.includes("·") && dur.length < 20) return dur;
    const pkg = product.packageLabel?.trim();
    if (pkg) {
      if (pkg.includes("·")) {
        const parts = pkg.split("·").map((p) => p.trim());
        const monthly = parts.find((p) => p.toLowerCase().includes("month"));
        return monthly || parts[0] || "Standard";
      }
      if (pkg.includes("plans available")) return "Standard";
      if (pkg.length < 20) return pkg;
    }
    return dur || "Standard";
  })();

  const warrantyText = (() => {
    if (product.warrantyLabel) {
      return product.warrantyLabel.toLowerCase().includes("warranty")
        ? product.warrantyLabel
        : `${product.warrantyLabel} Warranty`;
    }
    return "Activation warranty";
  })();

  let waHref = "#";
  try {
    waHref = buildWhatsAppUrl(
      `Hi TRIHEX! I want to order ${product.title} (${durationText}). Please confirm availability.`,
    );
  } catch {
    waHref = `https://wa.me/9779702910130?text=${encodeURIComponent(
      `Hi TRIHEX! I want to check availability for ${product.title}.`,
    )}`;
  }

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)]">
      {/* ── Top Media Section ── */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#f5f6fa] sm:aspect-[4/3]">
        <Link prefetch={false} href={href} className="absolute inset-0 z-0 flex items-center justify-center p-2.5 sm:p-3.5">
          <ProductImage
            product={product}
            alt={`${product.title} thumbnail`}
            containerClassName="aspect-auto w-full h-full border-0 bg-transparent"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 639px) 45vw, (max-width: 767px) 33vw, 220px"
          />
        </Link>

        {/* Floating In-stock / Availability Badge (Top-Left) */}
        <div className="pointer-events-none absolute left-2 top-2 z-10 sm:left-2.5 sm:top-2.5">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/60 bg-blue-50/95 px-2 py-0.5 text-[10px] font-bold text-blue-700 shadow-xs backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>In stock</span>
            </span>
          ) : isOutOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-rose-50/95 px-2 py-0.5 text-[10px] font-bold text-rose-700 shadow-xs backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
              <span>Out of stock</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50/95 px-2 py-0.5 text-[10px] font-bold text-amber-700 shadow-xs backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Under Review</span>
            </span>
          )}
        </div>

        {/* Floating Discount Badge (Top-Right) */}
        {product.discountPercent != null && product.discountPercent > 0 && (
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-2.5 sm:top-2.5">
            <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              −{product.discountPercent}%
            </span>
          </div>
        )}

        {/* Multi-tier plan count tag */}
        {tierCount > 1 && (
          <div className="pointer-events-none absolute bottom-2 right-2 z-10">
            <span className="rounded-full border border-slate-200/80 bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 shadow-xs backdrop-blur-xs">
              {tierCount} plans
            </span>
          </div>
        )}
      </div>

      {/* ── Card Content Body ── */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3.5">
        <LimitedOfferBanner slug={product.slug} />
        <div>
          {/* Category micro badge */}
          <div className="mb-1 flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
              {product.categoryLabel || product.brandName}
            </span>
          </div>

          {/* Product Title */}
          <Link prefetch={false} href={href} className="block group/title">
            <h3 className="line-clamp-2 text-xs font-bold leading-snug text-slate-900 group-hover/title:text-blue-600 sm:text-sm min-h-[2rem] sm:min-h-[2.4rem] transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Price & Duration */}
          <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            {priceLabel ? (
              <>
                <span className="font-[family-name:var(--font-sora)] text-sm font-black tracking-tight text-slate-900 sm:text-base">
                  {priceLabel}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  / {durationText}
                </span>
                {compareLabel && (
                  <span className="text-[10px] text-slate-400 line-through">
                    {compareLabel}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs font-semibold text-slate-500">
                Price on inquiry
              </span>
            )}
          </div>

          {/* Warranty / Trust Badge (Shield Check) */}
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-blue-600">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span className="truncate">{warrantyText}</span>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
          <Link
            prefetch={false}
            href={href}
            className="flex h-8 sm:h-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-xs transition hover:bg-blue-600 active:scale-[0.98]"
          >
            {isAvailable ? "Buy Now" : "View Details"}
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex h-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-50/80 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100/90 active:scale-[0.98]"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
