"use client";

import { useMemo, useState } from "react";
import { BuyNowButton } from "@/components/storefront/buy-now-button";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { formatNpr } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  applyWarrantyPrice,
  parsePlanDaysFromLabel,
  warrantyOptionsForPlan,
  type WarrantyTier,
} from "@/lib/catalog/warranty";

export function ProductPurchasePanel({
  productSlug,
  variantSku,
  basePriceNprMinor,
  durationLabel,
  purchasable,
  whatsappHref,
}: {
  productSlug: string;
  variantSku: string;
  basePriceNprMinor: number | null;
  durationLabel: string | null;
  purchasable: boolean;
  whatsappHref: string;
}) {
  const planDays = parsePlanDaysFromLabel(durationLabel);
  const options = useMemo(() => warrantyOptionsForPlan(planDays), [planDays]);
  const [tier, setTier] = useState<WarrantyTier>("none");
  const selected = options.find((o) => o.tier === tier) ?? options[0]!;

  const displayPrice =
    basePriceNprMinor != null
      ? applyWarrantyPrice(basePriceNprMinor, selected.tier)
      : null;

  if (!purchasable) {
    return (
      <div className="flex flex-col gap-2">
        <Button href={whatsappHref} external variant="primary" className="w-full">
          Check Availability
        </Button>
        <Button href={whatsappHref} external variant="whatsapp" className="w-full">
          WhatsApp +977 9702910130
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Warranty options
        </p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Every plan has 2 choices — no warranty (current price) or with
          guarantee (+30%).
        </p>
        <div className="mt-2 grid gap-2">
          {options.map((opt) => {
            const price =
              basePriceNprMinor != null
                ? applyWarrantyPrice(basePriceNprMinor, opt.tier)
                : null;
            const active = opt.tier === tier;
            return (
              <button
                key={opt.tier}
                type="button"
                onClick={() => setTier(opt.tier)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-1 ring-[var(--primary)]"
                    : "border-[var(--border)] bg-white hover:border-[var(--primary)]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--text)]">
                    {opt.label}
                  </span>
                  {price != null ? (
                    <span className="shrink-0 text-sm font-semibold text-[var(--text)]">
                      {formatNpr(price)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">
                  {opt.description}
                </p>
                {opt.tier === "protected" && basePriceNprMinor != null ? (
                  <p className="mt-1 text-[10px] font-medium text-[var(--success)]">
                    Includes +30% vs {formatNpr(basePriceNprMinor)} no-warranty
                    price
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {displayPrice != null ? (
        <p className="font-[family-name:var(--font-sora)] text-2xl font-semibold text-[var(--text)]">
          {formatNpr(displayPrice)}
          <span className="ml-2 text-xs font-medium text-[var(--text-muted)]">
            {selected.shortLabel}
          </span>
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <BuyNowButton
          productSlug={productSlug}
          variantSku={variantSku}
          warranty={tier}
        />
        <AddToCartButton
          productSlug={productSlug}
          variantSku={variantSku}
          warranty={tier}
        />
        <Button href={whatsappHref} external variant="whatsapp" className="w-full">
          WhatsApp +977 9702910130
        </Button>
        <Button href="/cart" variant="secondary">
          View cart
        </Button>
      </div>
    </div>
  );
}
