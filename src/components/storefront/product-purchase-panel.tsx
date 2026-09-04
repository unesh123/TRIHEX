"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BuyNowButton } from "@/components/storefront/buy-now-button";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { formatNpr } from "@/lib/money";
import { cn } from "@/lib/utils";
import { productEnquiryUrl } from "@/lib/whatsapp";
import { Check, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

export interface PurchaseVariant {
  sku: string;
  variantName: string;
  priceNprMinor: number | null;
  compareAtPriceNprMinor?: number | null;
  discountPercent?: number | null;
  durationLabel?: string | null;
  purchasable?: boolean;
  stockQty?: number | null;
  stockLabel?: string | null;
}

export interface ProductPurchasePanelProps {
  productSlug: string;
  productTitle?: string;
  variantSku: string;
  basePriceNprMinor: number | null;
  durationLabel: string | null;
  purchasable: boolean;
  whatsappHref: string;
  variants?: PurchaseVariant[];
}

export function ProductPurchasePanel({
  productSlug,
  productTitle,
  variantSku,
  basePriceNprMinor,
  durationLabel,
  purchasable,
  whatsappHref,
  variants,
}: ProductPurchasePanelProps) {
  // If multiple variants exist, allow user to pick their specific tier
  const hasMultipleTiers = Boolean(variants && variants.length > 1);
  const [selectedSku, setSelectedSku] = useState<string>(variantSku);

  const activeVariant = useMemo(() => {
    if (variants && variants.length > 0) {
      return variants.find((v) => v.sku === selectedSku) ?? variants[0]!;
    }
    return null;
  }, [variants, selectedSku]);

  const activePrice = activeVariant?.priceNprMinor ?? basePriceNprMinor;
  const activeCompareAt = activeVariant?.compareAtPriceNprMinor ?? null;
  const activeDiscount = activeVariant?.discountPercent ?? null;
  const isSelectedPurchasable = activeVariant ? Boolean(activeVariant.purchasable) : purchasable;
  const currentVariantSku = activeVariant?.sku ?? variantSku;

  const dynamicWaUrl = useMemo(() => {
    if (activePrice == null && !activeVariant && whatsappHref) return whatsappHref;
    return productEnquiryUrl({
      productName: productTitle ?? productSlug,
      variantName: activeVariant?.variantName ?? durationLabel ?? "Plan",
      slug: productSlug,
      priceLabel: activePrice != null ? formatNpr(activePrice) : null,
      compareAtLabel: activeCompareAt != null ? formatNpr(activeCompareAt) : null,
    });
  }, [productTitle, productSlug, activeVariant, durationLabel, activePrice, activeCompareAt, whatsappHref]);

  return (
    <div className="space-y-4">
      {hasMultipleTiers && variants && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Choose Plan / Warranty Tier
            </p>
            <span className="text-[10px] font-semibold text-[var(--primary)]">
              {variants.length} options available
            </span>
          </div>

          <div className="grid gap-2">
            {variants.map((tier) => {
              const isSelected = tier.sku === currentVariantSku;
              return (
                <button
                  key={tier.sku}
                  type="button"
                  onClick={() => setSelectedSku(tier.sku)}
                  className={cn(
                    "group relative flex flex-col rounded-xl border p-3 text-left transition duration-200",
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]/50 ring-2 ring-[var(--primary)] shadow-sm"
                      : "border-[var(--border)] bg-white hover:border-[var(--primary)]/40 hover:bg-[var(--page-soft)]/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition",
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--border-strong)] bg-white group-hover:border-[var(--primary)]",
                        )}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </span>
                      <div>
                        <p className={cn("text-xs font-bold leading-snug", isSelected ? "text-[var(--primary)]" : "text-[var(--text)]")}>
                          {tier.variantName}
                        </p>
                        {tier.durationLabel && (
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {tier.durationLabel}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {tier.priceNprMinor != null ? (
                        <p className="font-[family-name:var(--font-sora)] text-sm font-bold text-[var(--text)]">
                          {formatNpr(tier.priceNprMinor)}
                        </p>
                      ) : (
                        <p className="text-xs font-semibold text-[var(--text-muted)]">
                          On inquiry
                        </p>
                      )}
                      {tier.compareAtPriceNprMinor != null && tier.compareAtPriceNprMinor > (tier.priceNprMinor ?? 0) && (
                        <p className="text-[10px] text-[var(--text-muted)] line-through">
                          {formatNpr(tier.compareAtPriceNprMinor)}
                        </p>
                      )}
                    </div>
                  </div>

                  {tier.discountPercent != null && tier.discountPercent > 0 && (
                    <div className="mt-1.5 flex items-center justify-between border-t border-[var(--border)]/60 pt-1.5 text-[10px]">
                      <span className="font-semibold text-[var(--success)]">
                        Save {tier.discountPercent}% vs global price
                      </span>
                      {tier.stockLabel && (
                        <span className="text-[var(--text-muted)] font-medium">
                          {tier.stockLabel}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Prominent Price Display */}
      {activePrice != null ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--page-soft)]/80 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Selected Price (NPR)
          </p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="font-[family-name:var(--font-sora)] text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
              {formatNpr(activePrice)}
            </span>
            {activeCompareAt != null && activeCompareAt > activePrice && (
              <span className="text-sm font-medium text-[var(--text-muted)] line-through">
                {formatNpr(activeCompareAt)}
              </span>
            )}
            {activeDiscount != null && activeDiscount > 0 && (
              <span className="rounded-full bg-[var(--danger)] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm">
                −{activeDiscount}%
              </span>
            )}
          </div>
          {activeDiscount != null && activeDiscount > 0 && (
            <p className="mt-1 text-xs font-semibold text-[var(--success)]">
              Discounted pricing active for Nepal buyers
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--page-soft)]/80 p-3.5 text-sm font-semibold text-[var(--text-secondary)]">
          Price available upon quick WhatsApp confirmation
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        {isSelectedPurchasable ? (
          <>
            <BuyNowButton
              productSlug={productSlug}
              variantSku={currentVariantSku}
              className="h-12 w-full rounded-xl bg-[var(--surface-ink)] text-sm font-bold text-white shadow-md transition hover:bg-[var(--primary)] hover:shadow-lg"
              label="Instant Checkout"
            />
            <AddToCartButton
              productSlug={productSlug}
              variantSku={currentVariantSku}
            />
            <Button
              href={dynamicWaUrl}
              external
              variant="whatsapp"
              className="h-11 w-full gap-2 rounded-xl text-xs font-bold"
            >
              <MessageCircle className="h-4 w-4" />
              Order on WhatsApp (Instant Reply)
            </Button>
            <Button href="/cart" variant="secondary" className="h-10 text-xs font-semibold">
              View Cart
            </Button>
          </>
        ) : (
          <>
            <a
              href={dynamicWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-md transition hover:bg-[var(--primary)]/90 focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <Sparkles className="h-4 w-4" />
              Check Availability & Price
            </a>
            <Button
              href={dynamicWaUrl}
              external
              variant="whatsapp"
              className="h-11 w-full gap-2 rounded-xl text-xs font-bold"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp +977 9702910130
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] font-medium text-[var(--text-muted)]">
        <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
        Official Access · 100% Nepali Support Layer
      </div>
    </div>
  );
}
