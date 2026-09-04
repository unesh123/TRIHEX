"use client";

import { Button } from "@/components/ui/button";
import { formatNpr } from "@/lib/money";

export function StickyMobileBuyBar({
  title,
  priceNprMinor,
  purchasable,
  whatsappHref,
}: {
  title: string;
  priceNprMinor: number | null;
  durationLabel?: string | null;
  purchasable: boolean;
  whatsappHref: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_var(--shadow)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-[var(--text)]">
            {title}
          </p>
          <p className="font-[family-name:var(--font-sora)] text-sm font-bold text-[var(--text)]">
            {priceNprMinor != null ? formatNpr(priceNprMinor) : "On enquiry"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {purchasable ? (
            <Button
              type="button"
              size="sm"
              className="rounded-xl px-4 text-xs font-bold"
              onClick={() => {
                window.scrollTo({
                  top: document.querySelector("section")?.offsetTop ?? 400,
                  behavior: "smooth",
                });
              }}
            >
              Select Plan
            </Button>
          ) : (
            <Button
              href={whatsappHref}
              external
              variant="whatsapp"
              size="sm"
              className="rounded-xl px-3 text-xs font-bold"
            >
              Inquire
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

