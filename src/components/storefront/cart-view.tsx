"use client";

import { EmptyState } from "@/components/storefront/empty-state";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";
import { formatNpr } from "@/lib/money";
import type { DemoCatalogItem } from "@/lib/catalog/demo-catalog";
import { buildWhatsAppUrl, getWhatsAppDisplay } from "@/lib/whatsapp";

const CART_KEY = "trihex_cart";

export interface CartLine {
  productSlug: string;
  variantSku: string;
  quantity: number;
  warranty?: string;
}

interface CartViewProps {
  catalog: DemoCatalogItem[];
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { items?: CartLine[] };
    return Array.isArray(parsed.items)
      ? parsed.items.map((i) => ({
          productSlug: i.productSlug,
          variantSku: i.variantSku,
          quantity: typeof i.quantity === "number" && i.quantity > 0 ? i.quantity : 1,
          warranty: i.warranty,
        }))
      : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify({ items }));
}

export function CartView({ catalog }: CartViewProps) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setLines(readCart());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const catalogMap = useMemo(
    () => new Map(catalog.map((p) => [p.slug, p])),
    [catalog],
  );

  const resolved = lines
    .map((line) => {
      const product = catalogMap.get(line.productSlug);
      if (!product) return null;
      const unitPrice = product.priceNprMinor;
      const warrantyLabel = product.warranty ?? "Standard warranty terms";
      return { line, product, unitPrice, warrantyLabel };
    })
    .filter(Boolean) as Array<{
    line: CartLine;
    product: DemoCatalogItem;
    unitPrice: number;
    warrantyLabel: string;
  }>;

  const subtotalMinor = resolved.reduce(
    (sum, { line, unitPrice }) => sum + unitPrice * line.quantity,
    0,
  );

  function updateQuantity(
    slug: string,
    variantSku: string,
    quantity: number,
  ) {
    const next = lines
      .map((l) =>
        l.productSlug === slug && l.variantSku === variantSku
          ? { ...l, quantity: Math.max(1, quantity) }
          : l,
      )
      .filter((l) => l.quantity > 0);
    setLines(next);
    writeCart(next);
  }

  function removeLine(slug: string, variantSku: string) {
    const next = lines.filter(
      (l) => !(l.productSlug === slug && l.variantSku === variantSku),
    );
    setLines(next);
    writeCart(next);
  }

  const waUrl = buildWhatsAppUrl(
    "Hello TRIHEX DIGITAL. I have a question about items in my cart before checkout.",
  );

  if (!ready) {
    return <p className="text-text-muted">Loading cart…</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div>
        {resolved.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            body="Browse packages, add what you need, then checkout with bank QR / eSewa / Khalti."
            primaryHref="/products"
            primaryLabel="Browse products"
            secondaryHref="/inquire"
            secondaryLabel="Inquire list"
          />
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-white shadow-sm">
            {resolved.map(({ line, product, unitPrice, warrantyLabel }) => (
              <li
                key={`${line.productSlug}:${line.variantSku}`}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-semibold text-text hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-text-muted">
                    {product.variantName} · {formatNpr(unitPrice)} each
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Warranty: {warrantyLabel}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-text-muted">
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={line.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          line.productSlug,
                          line.variantSku,
                          Number(e.target.value),
                        )
                      }
                      className="w-16 rounded-xl border border-border bg-surface px-2.5 py-1 text-text"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      removeLine(line.productSlug, line.variantSku)
                    }
                    className="text-sm font-medium text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 rounded-xl border border-border bg-surface-raised/50 px-4 py-3 text-xs text-text-muted">
          Price, availability and terms are verified again before payment.
          Checkout recalculates totals server-side using current catalogue rules.
        </p>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-text">Order Summary</h2>
        <p className="mt-2 text-xs text-text-muted">
          Estimated subtotal (indicative)
        </p>
        <p className="mt-1 font-[family-name:var(--font-sora)] text-2xl font-bold text-text">
          {formatNpr(subtotalMinor)}
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            href="/checkout"
            disabled={resolved.length === 0}
            className="w-full rounded-xl"
          >
            Continue to checkout
          </Button>
          <Button href={waUrl} external variant="whatsapp" className="w-full rounded-xl">
            WhatsApp {getWhatsAppDisplay()}
          </Button>
        </div>
        <p className="mt-3 text-center text-[11px] text-text-muted">
          Final totals and stock are verified at checkout.
        </p>
      </aside>

      <ComplianceDisclaimer className="lg:col-span-2" compact />
    </div>
  );
}

export { CART_KEY };
