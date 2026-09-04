"use client";

import Link from "next/link";
import { formatNpr } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { PlanOption } from "@/lib/catalog/product-families";

export function PlanSwitcher({
  plans,
  currentSlug,
  className,
}: {
  plans: PlanOption[];
  currentSlug: string;
  className?: string;
}) {
  if (plans.length <= 1) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_8px_24px_var(--shadow)] sm:p-5",
        className,
      )}
      aria-label="Choose plan duration"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        Available plans
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-sora)] text-base font-semibold text-[var(--text)] sm:text-lg">
        Switch duration
      </h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Same product — pick the months plan that fits you. Price updates when
        you switch.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {plans.map((plan) => {
          const active = plan.slug === currentSlug;
          const unavailable =
            plan.visibility === "BLOCKED" || plan.visibility === "OUT_OF_STOCK";
          return (
            <Link
              key={plan.slug}
              href={`/products/${plan.slug}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col rounded-xl border px-3 py-2.5 text-left transition",
                active
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-1 ring-[var(--primary)]"
                  : unavailable
                    ? "border-[var(--border)] bg-[var(--page-soft)] opacity-60"
                    : "border-[var(--border)] bg-white hover:border-[var(--primary)]",
              )}
            >
              <span className="text-sm font-semibold text-[var(--text)]">
                {plan.label}
              </span>
              <span className="mt-0.5 text-xs text-[var(--text-muted)]">
                {plan.showPrice && plan.priceNprMinor != null
                  ? formatNpr(plan.priceNprMinor)
                  : "Price on enquiry"}
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                {active
                  ? "Selected"
                  : unavailable
                    ? "Unavailable"
                    : "Check availability"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
