"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Check, MessageCircle, ShieldCheck, ShoppingCart, ArrowRight, Zap } from "lucide-react";
import { readCart, writeCart } from "@/components/storefront/cart-view";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { canPurchasePlan } from "@/lib/commerce/plan-eligibility";

export interface PurchasePlan {
  id: string; // SKU
  slug?: string;
  durationLabel: string;
  accessLabel: string;
  warrantyLabel: string;
  activationLabel: string;
  availability: "available" | "under_review" | "out_of_stock" | string;
  priceNpr: number;
  compareAtPriceNpr?: number | null;
  discountPercent?: number | null;
  isPrivate?: boolean;
}

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
  warrantyLabel?: string | null;
  activationLabel?: string | null;
  availability?: "available" | "under_review" | "out_of_stock";
}

export interface ProductPurchasePanelProps {
  productSlug: string;
  productTitle?: string;
  variantSku?: string;
  basePriceNprMinor?: number | null;
  durationLabel?: string | null;
  purchasable?: boolean;
  whatsappHref?: string;
  plans?: PurchasePlan[];
  variants?: PurchaseVariant[];
}

export function ProductPurchasePanel({
  productSlug,
  productTitle,
  variantSku,
  basePriceNprMinor,
  durationLabel,
  purchasable = true,
  whatsappHref,
  plans: propPlans,
  variants,
}: ProductPurchasePanelProps) {
  const router = useRouter();

  // Normalize plans from either propPlans or variants
  const plans: PurchasePlan[] = useMemo(() => {
    if (propPlans && propPlans.length > 0) {
      return propPlans.map((p) => ({
        ...p,
        isPrivate:
          p.isPrivate ??
          (/private|own account/i.test(p.accessLabel) ||
            /private/i.test(p.durationLabel)),
      }));
    }

    if (variants && variants.length > 0) {
      return variants.map((v) => {
        const priceNpr = Math.round(
          (v.priceNprMinor ?? basePriceNprMinor ?? 0) / 100,
        );
        const compareAtPriceNpr =
          v.compareAtPriceNprMinor != null
            ? Math.round(v.compareAtPriceNprMinor / 100)
            : null;
        const isAvail =
          v.availability ??
          (v.stockQty === 0
            ? "out_of_stock"
            : v.purchasable ?? purchasable
              ? "available"
              : "under_review");

        const isPrivate =
          /private|own account/i.test(v.variantName) ||
          /private/i.test(v.durationLabel ?? "");

        return {
          id: v.sku,
          durationLabel: v.durationLabel ?? durationLabel ?? "Standard plan",
          accessLabel: v.variantName || (isPrivate ? "Private (Own Account)" : "Shared Plan"),
          warrantyLabel: v.warrantyLabel ?? "Full term warranty",
          activationLabel: v.activationLabel ?? "Direct activation",
          availability: isAvail,
          priceNpr,
          compareAtPriceNpr,
          discountPercent: v.discountPercent ?? null,
          isPrivate,
        };
      });
    }

    const priceNpr = Math.round((basePriceNprMinor ?? 0) / 100);
    const isPrivate = /private|own account/i.test(productTitle ?? "");
    return [
      {
        id: variantSku ?? productSlug,
        slug: productSlug,
        durationLabel: durationLabel ?? "Standard plan",
        accessLabel: isPrivate ? "Private (Own Account)" : "Standard access",
        warrantyLabel: "Full replacement warranty",
        activationLabel: "Direct activation",
        availability: purchasable ? "available" : "under_review",
        priceNpr,
        compareAtPriceNpr: null,
        discountPercent: null,
        isPrivate,
      },
    ];
  }, [
    propPlans,
    variants,
    basePriceNprMinor,
    variantSku,
    productSlug,
    durationLabel,
    purchasable,
    productTitle,
  ]);

  // Initial plan selection resolution:
  // 1. Matching URL ?plan=... parameter if available
  // 2. Exact matching productSlug or variantSku
  // 3. First available plan
  // 4. First plan
  const initialPlan = useMemo(() => {
    return (
      plans.find(
        (p) => p.slug === productSlug || p.id === variantSku || p.id === productSlug,
      ) ??
      plans.find((p) => p.availability === "available") ??
      plans[0]
    );
  }, [plans, productSlug, variantSku]);

  const [selectedId, setSelectedId] = useState<string>(initialPlan?.id ?? "");
  const [added, setAdded] = useState(false);

  // Sync with URL query ?plan= on mount without triggering page reload
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const planQuery = params.get("plan");
      if (planQuery) {
        const found = plans.find(
          (p) => p.slug === planQuery || p.id === planQuery,
        );
        if (found) {
          setSelectedId(found.id);
        }
      }
    } catch {
      /* ignore URL read error */
    }
  }, [plans]);

  // Active plan memo
  const plan = useMemo(
    () => plans.find((p) => p.id === selectedId) ?? initialPlan,
    [plans, selectedId, initialPlan],
  );

  // Record custom performance marker for interaction INP audit
  useEffect(() => {
    if (typeof window !== "undefined" && window.performance?.mark) {
      try {
        window.performance.mark("plan_switch_painted");
        window.performance.measure(
          "plan_switch_latency",
          "plan_switch_start",
          "plan_switch_painted",
        );
      } catch {
        /* Ignore missing marks */
      }
    }
  }, [selectedId]);

  const eligibility = useMemo(() => {
    if (!plan) {
      return {
        allowed: false,
        status: "under_review" as const,
        primaryAction: "CHECK_AVAILABILITY" as const,
        ctaLabel: "Confirm Availability",
      };
    }
    return canPurchasePlan({
      purchasable: plan.availability === "available",
      availability: plan.availability,
    });
  }, [plan]);

  const handleSelect = useCallback(
    (newId: string) => {
      if (typeof window !== "undefined" && window.performance?.mark) {
        window.performance.mark("plan_switch_start");
      }
      setSelectedId(newId);
      setAdded(false);

      // Lightweight URL state update with replaceState (no router refresh, no scroll jump)
      if (typeof window !== "undefined") {
        try {
          const selected = plans.find((p) => p.id === newId);
          if (selected) {
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.set("plan", selected.slug || selected.id);
            window.history.replaceState(null, "", nextUrl.toString());
          }
        } catch {
          /* ignore history update error */
        }
      }
    },
    [plans],
  );

  function handleAddToCart() {
    if (!plan || !eligibility.allowed) return;
    const targetSlug = plan.slug || productSlug;
    const targetSku = plan.id;
    const items = readCart();
    const existing = items.find(
      (i) => i.productSlug === targetSlug && i.variantSku === targetSku,
    );
    const next = existing
      ? items.map((i) =>
          i.productSlug === targetSlug && i.variantSku === targetSku
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      : [
          ...items,
          {
            productSlug: targetSlug,
            variantSku: targetSku,
            quantity: 1,
            warranty: plan.warrantyLabel,
          },
        ];
    writeCart(next);
    setAdded(true);
  }

  function handleInstantBuy() {
    handleAddToCart();
    router.push("/checkout");
  }

  if (!plan) return null;

  return (
    <section
      aria-label="Purchase and plan options"
      className="rounded-3xl border border-[var(--border)] bg-white p-5 text-[var(--text)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6"
    >
      {/* Screen reader live announcement */}
      <div aria-live="polite" className="sr-only">
        Selected plan: {plan.durationLabel}, {plan.accessLabel}, Price: Rs.{" "}
        {plan.priceNpr.toLocaleString()}
      </div>

      {/* Plan selection header */}
      {plans.length > 1 && (
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Select Your Plan
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
              {plans.length} options available
            </span>
          </div>

          {/* Thumb-friendly stacked plan options on mobile, responsive grid on desktop */}
          <div
            role="radiogroup"
            aria-label="Select package duration and access type"
            className="mt-3 flex flex-col gap-2.5"
          >
            {plans.map((p) => {
              const isSelected = p.id === plan.id;
              const isAvail = p.availability === "available";
              const isPrivate = p.isPrivate;

              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(p.id)}
                  className={cn(
                    "group relative flex min-h-[54px] w-full items-center justify-between rounded-2xl border px-3.5 py-3 text-left transition-all duration-150 active:scale-[0.99]",
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/30"
                      : "border-[var(--border)] bg-white hover:border-slate-300 hover:bg-slate-50/70",
                  )}
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Check Indicator */}
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-transparent",
                      )}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text)]">
                          {p.durationLabel}
                        </span>

                        {isPrivate ? (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-500/20">
                            ★ Private Account
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            Shared
                          </span>
                        )}

                        {!isAvail && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800">
                            {p.availability === "out_of_stock"
                              ? "Out of stock"
                              : "Under review"}
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 text-[11px] text-[var(--text-muted)] truncate">
                        {p.warrantyLabel && p.warrantyLabel !== "No warranty"
                          ? p.warrantyLabel
                          : "Full replacement warranty"}
                      </div>
                    </div>
                  </div>

                  {/* Right price */}
                  <div className="shrink-0 text-right pl-3">
                    <div className="font-[family-name:var(--font-sora)] text-sm sm:text-base font-black tracking-tight text-[var(--text)]">
                      Rs. {p.priceNpr.toLocaleString()}
                    </div>
                    {p.compareAtPriceNpr != null &&
                      p.compareAtPriceNpr > p.priceNpr && (
                        <div className="text-[11px] text-[var(--text-muted)] line-through">
                          Rs. {p.compareAtPriceNpr.toLocaleString()}
                        </div>
                      )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Price, Status & Summary Panel */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--page-soft)]/80 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Selected: {plan.durationLabel} · {plan.accessLabel}
            </div>
            <div className="mt-1 flex items-baseline gap-2.5">
              <span className="font-[family-name:var(--font-sora)] text-2xl sm:text-3xl font-black tracking-tight text-[var(--text)] transition-opacity duration-150">
                Rs. {plan.priceNpr.toLocaleString()}
              </span>
              {plan.compareAtPriceNpr != null &&
                plan.compareAtPriceNpr > plan.priceNpr && (
                  <span className="text-sm font-medium text-[var(--text-muted)] line-through">
                    Rs. {plan.compareAtPriceNpr.toLocaleString()}
                  </span>
                )}
              {plan.discountPercent != null && plan.discountPercent > 0 && (
                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm">
                  −{plan.discountPercent}%
                </span>
              )}
            </div>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize",
              eligibility.allowed
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : plan.availability === "out_of_stock"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200",
            )}
          >
            {eligibility.allowed ? "Available" : eligibility.ctaLabel}
          </span>
        </div>

        {/* Compact Warranty & Fulfillment SLA Rows */}
        <dl className="mt-3.5 grid grid-cols-2 gap-2 border-t border-[var(--border)]/70 pt-3 text-xs">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Warranty Coverage
            </dt>
            <dd className="mt-0.5 font-semibold text-[var(--text)]">
              {plan.warrantyLabel && plan.warrantyLabel !== "No warranty"
                ? plan.warrantyLabel
                : "Full term replacement"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Fulfillment Target
            </dt>
            <dd className="mt-0.5 font-semibold text-[var(--text)]">
              Usually 2 to 6 hours
            </dd>
          </div>
        </dl>
      </div>

      {/* Primary Commercial CTAs */}
      <div className="mt-5 space-y-2.5">
        {eligibility.allowed ? (
          <>
            {added ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-[var(--surface-ink)] text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-white text-sm font-bold text-[var(--text)] shadow-sm transition hover:border-blue-600 hover:text-blue-600 active:scale-[0.98]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={handleInstantBuy}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <Zap className="h-4 w-4" />
                  Instant Checkout
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            href={`/inquire?q=${encodeURIComponent(productSlug)}`}
            className="flex h-12 w-full items-center justify-center rounded-2xl border border-amber-300 bg-amber-50 text-sm font-bold text-amber-900 transition hover:bg-amber-100 active:scale-[0.98]"
          >
            {eligibility.ctaLabel}
          </Link>
        )}

        {/* Secondary WhatsApp Action */}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
            Questions? Ask on WhatsApp
          </a>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)]/70 pt-3 text-[11px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          TRIHEX-verified fulfillment
        </span>
        <span>Revalidated at checkout</span>
      </div>

      {/* Integrated Sticky Mobile Purchase Bar (bottom: 0, respects iOS safe areas) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900">
              {plan.durationLabel} {plan.isPrivate ? "· Private" : "· Shared"}
            </p>
            <p className="font-[family-name:var(--font-sora)] text-base font-black text-slate-950">
              Rs. {plan.priceNpr.toLocaleString()}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {eligibility.allowed ? (
              added ? (
                <Link
                  href="/cart"
                  className="flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm active:scale-[0.98]"
                >
                  View Cart
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleInstantBuy}
                  className="flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Buy Now
                </button>
              )
            ) : (
              <a
                href={whatsappHref || `/inquire?q=${encodeURIComponent(productSlug)}`}
                className="flex h-10 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 text-xs font-bold text-amber-900 active:scale-[0.98]"
              >
                Inquire
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
