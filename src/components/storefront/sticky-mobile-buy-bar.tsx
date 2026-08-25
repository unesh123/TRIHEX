"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNpr } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  applyWarrantyPrice,
  parsePlanDaysFromLabel,
  warrantyOptionsForPlan,
  type WarrantyTier,
} from "@/lib/catalog/warranty";

export function StickyMobileBuyBar({
  title,
  priceNprMinor,
  durationLabel,
  purchasable,
  whatsappHref,
}: {
  title: string;
  priceNprMinor: number | null;
  durationLabel?: string | null;
  purchasable: boolean;
  whatsappHref: string;
}) {
  const planDays = parsePlanDaysFromLabel(durationLabel);
  const options = useMemo(() => warrantyOptionsForPlan(planDays), [planDays]);
  const [tier, setTier] = useState<WarrantyTier>("none");
  const selected = options.find((o) => o.tier === tier) ?? options[0]!;
  const displayPrice =
    priceNprMinor != null
      ? applyWarrantyPrice(priceNprMinor, selected.tier)
      : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_var(--shadow)] backdrop-blur md:hidden">
      <div className="mx-auto max-w-lg space-y-2">
        {purchasable && priceNprMinor != null ? (
          <div className="grid grid-cols-2 gap-1.5">
            {options.map((opt) => {
              const active = opt.tier === tier;
              const price = applyWarrantyPrice(priceNprMinor, opt.tier);
              return (
                <button
                  key={opt.tier}
                  type="button"
                  onClick={() => setTier(opt.tier)}
                  className={cn(
                    "rounded-lg border px-2 py-1.5 text-left transition",
                    active
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-white",
                  )}
                >
                  <p className="text-[10px] font-semibold leading-tight text-[var(--text)]">
                    {opt.tier === "none" ? "No warranty" : "With warranty"}
                  </p>
                  <p className="text-[11px] font-semibold text-[var(--text)]">
                    {formatNpr(price)}
                  </p>
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[var(--text)]">
              {title}
            </p>
            <p className="text-sm font-semibold text-[var(--text)]">
              {displayPrice != null
                ? formatNpr(displayPrice)
                : "Price on enquiry"}
              {purchasable && selected.tier === "protected" ? (
                <span className="ml-1 text-[10px] font-medium text-[var(--text-muted)]">
                  · {selected.shortLabel}
                </span>
              ) : null}
            </p>
          </div>
          <Button href={whatsappHref} external variant="whatsapp" size="sm" className="shrink-0">
            Check Availability
          </Button>
        </div>
      </div>
    </div>
  );
}
