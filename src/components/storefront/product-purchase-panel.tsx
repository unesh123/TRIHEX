"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, MessageCircle, ShieldCheck } from "lucide-react";
import { readCart, writeCart } from "@/components/storefront/cart-view";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface PurchasePlan {
  id: string; // SKU
  slug?: string;
  durationLabel: string;
  accessLabel: string;
  warrantyLabel: string;
  activationLabel: string;
  availability: "available" | "under_review" | "out_of_stock";
  priceNpr: number;
  compareAtPriceNpr?: number | null;
  discountPercent?: number | null;
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
    if (propPlans && propPlans.length > 0) return propPlans;

    if (variants && variants.length > 0) {
      return variants.map((v) => {
        const priceNpr = Math.round((v.priceNprMinor ?? basePriceNprMinor ?? 0) / 100);
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

        return {
          id: v.sku,
          durationLabel: v.durationLabel ?? durationLabel ?? "Standard plan",
          accessLabel: v.variantName || "Standard",
          warrantyLabel: v.warrantyLabel ?? "No warranty",
          activationLabel: v.activationLabel ?? "Direct activation",
          availability: isAvail,
          priceNpr,
          compareAtPriceNpr,
          discountPercent: v.discountPercent ?? null,
        };
      });
    }

    const priceNpr = Math.round((basePriceNprMinor ?? 0) / 100);
    return [
      {
        id: variantSku ?? productSlug,
        durationLabel: durationLabel ?? "Standard plan",
        accessLabel: "Standard access",
        warrantyLabel: "No warranty",
        activationLabel: "Direct activation",
        availability: purchasable ? "available" : "under_review",
        priceNpr,
        compareAtPriceNpr: null,
        discountPercent: null,
      },
    ];
  }, [propPlans, variants, basePriceNprMinor, variantSku, productSlug, durationLabel, purchasable]);

  const first =
    plans.find((p) => p.slug === productSlug || p.id === variantSku || p.id === productSlug) ??
    plans.find((p) => p.availability === "available") ??
    plans[0];
  const [selectedId, setSelectedId] = useState<string>(first?.id ?? "");
  const [added, setAdded] = useState(false);

  const plan = useMemo(
    () => plans.find((p) => p.id === selectedId) ?? first,
    [plans, selectedId, first],
  );

  if (!plan) return null;

  const canBuy = plan.availability === "available";

  function handleSelect(newId: string) {
    setSelectedId(newId);
    setAdded(false);
  }

  function handleAddToCart() {
    if (!plan || !canBuy) return;
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
      : [...items, { productSlug: targetSlug, variantSku: targetSku, quantity: 1 }];
    writeCart(next);
    setAdded(true);
  }

  function handleInstantBuy() {
    handleAddToCart();
    router.push("/checkout");
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-white p-5 text-[var(--text)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
      {/* Plan selection header */}
      {plans.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Select Plan / Tier
            </span>
            <span className="text-[11px] font-medium text-[var(--primary)]">
              {plans.length} options available
            </span>
          </div>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {plans.map((p) => {
              const isSelected = p.id === plan.id;
              const isAvail = p.availability === "available";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p.id)}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border p-3 text-left transition-all duration-150",
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]/40 shadow-sm"
                      : "border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:bg-[var(--page-soft)]/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-[var(--text)]">
                        {p.durationLabel} · {p.accessLabel}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                        {p.warrantyLabel}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="font-[family-name:var(--font-sora)] text-sm font-bold text-[var(--text)]">
                      Rs. {p.priceNpr.toLocaleString()}
                    </span>
                    {!isAvail && (
                      <span className="rounded-full bg-[var(--warning-soft)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--warning)]">
                        {p.availability === "out_of_stock"
                          ? "Out of stock"
                          : "Review"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected price and status banner */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--page-soft)]/70 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              {plans.length > 1 ? `${plan.durationLabel} · ${plan.accessLabel}` : "Package Price"}
            </div>
            <div className="mt-1 flex items-baseline gap-2.5">
              <span className="font-[family-name:var(--font-sora)] text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                Rs. {plan.priceNpr.toLocaleString()}
              </span>
              {plan.compareAtPriceNpr != null &&
                plan.compareAtPriceNpr > plan.priceNpr && (
                  <span className="text-sm font-medium text-[var(--text-muted)] line-through">
                    Rs. {plan.compareAtPriceNpr.toLocaleString()}
                  </span>
                )}
              {plan.discountPercent != null && plan.discountPercent > 0 && (
                <span className="rounded-full bg-[var(--danger)] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm">
                  −{plan.discountPercent}%
                </span>
              )}
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize",
              canBuy
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : plan.availability === "out_of_stock"
                  ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                  : "bg-[var(--warning-soft)] text-[var(--warning)]",
            )}
          >
            {plan.availability.replaceAll("_", " ")}
          </span>
        </div>

        {/* Compact policy row */}
        <dl className="mt-3.5 grid grid-cols-2 gap-2 border-t border-[var(--border)]/60 pt-3 text-xs">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Warranty Term
            </dt>
            <dd className="mt-0.5 font-semibold text-[var(--text)]">
              {plan.warrantyLabel}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Activation Method
            </dt>
            <dd className="mt-0.5 font-semibold capitalize text-[var(--text)]">
              {plan.activationLabel}
            </dd>
          </div>
        </dl>
      </div>

      {/* Single authoritative primary CTA per state */}
      <div className="mt-5 space-y-2.5">
        {canBuy ? (
          <>
            {added ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  className="flex h-12 items-center justify-center rounded-2xl bg-[var(--surface-ink)] text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary)]"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  className="flex h-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-sm font-bold text-[var(--text)] transition hover:bg-[var(--page-soft)]"
                >
                  Checkout
                </Link>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex h-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-sm font-bold text-[var(--text)] shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={handleInstantBuy}
                  className="flex h-12 items-center justify-center rounded-2xl bg-[var(--surface-ink)] text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary)]"
                >
                  Instant Checkout
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            href={`/inquire?q=${encodeURIComponent(productSlug)}`}
            className="flex h-12 w-full items-center justify-center rounded-2xl border border-[var(--warning)] bg-[var(--warning-soft)]/50 text-sm font-bold text-[var(--warning)] transition hover:bg-[var(--warning-soft)]"
          >
            Confirm availability
          </Link>
        )}

        {/* Optional WhatsApp support action */}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--page-soft)] hover:text-[var(--text)]"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
            Questions? Ask on WhatsApp
          </a>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)]/60 pt-3 text-[11px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
          TRIHEX-verified delivery
        </span>
        <span>Revalidated at checkout</span>
      </div>
    </section>
  );
}

