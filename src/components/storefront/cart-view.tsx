"use client";

import { EmptyState } from "@/components/storefront/empty-state";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";
import { formatNpr } from "@/lib/money";
import type { DemoCatalogItem } from "@/lib/catalog/demo-catalog";
import { buildWhatsAppUrl, getWhatsAppDisplay } from "@/lib/whatsapp";
import {
  applyWarrantyPrice,
  parsePlanDaysFromLabel,
  warrantyOptionsForPlan,
} from "@/lib/catalog/warranty";

import type { WarrantyTier } from "@/lib/catalog/warranty";

const CART_KEY = "trihex_cart";

export interface CartLine {
  productSlug: string;
  variantSku: string;
  quantity: number;
  /** none = current price; protected = +30% with guarantee */
  warranty?: WarrantyTier;
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
          ...i,
          warranty: i.warranty === "protected" ? "protected" : "none",
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
    // Defer to avoid sync setState-in-effect lint; localStorage is client-only.
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
      const warranty = line.warranty === "protected" ? "protected" : "none";
      const unitPrice = applyWarrantyPrice(product.priceNprMinor, warranty);
      const planDays = parsePlanDaysFromLabel(product.duration);
      const warrantyMeta = warrantyOptionsForPlan(planDays).find(
        (o) => o.tier === warranty,
      );
      return { line: { ...line, warranty }, product, unitPrice, warrantyMeta };
    })
    .filter(Boolean) as Array<{
    line: CartLine;
    product: DemoCatalogItem;
    unitPrice: number;
    warrantyMeta: ReturnType<typeof warrantyOptionsForPlan>[number] | undefined;
  }>;

  const subtotalMinor = resolved.reduce(
    (sum, { line, unitPrice }) => sum + unitPrice * line.quantity,
    0,
  );

  function updateQuantity(
    slug: string,
    warranty: string,
    quantity: number,
  ) {
    const next = lines
      .map((l) =>
        l.productSlug === slug && (l.warranty ?? "none") === warranty
          ? { ...l, quantity: Math.max(1, quantity) }
          : l,
      )
      .filter((l) => l.quantity > 0);
    setLines(next);
    writeCart(next);
  }

  function removeLine(slug: string, warranty: string) {
    const next = lines.filter(
      (l) =>
        !(l.productSlug === slug && (l.warranty ?? "none") === warranty),
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
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface/60">
            {resolved.map(({ line, product, unitPrice, warrantyMeta }) => (
              <li
                key={`${line.productSlug}:${line.warranty ?? "none"}`}
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
                    {warrantyMeta?.label ?? "No warranty"}
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
                          line.warranty ?? "none",
                          Number(e.target.value),
                        )
                      }
                      className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-text"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      removeLine(line.productSlug, line.warranty ?? "none")
                    }
                    className="text-sm text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 rounded-md border border-border bg-surface-raised/50 px-3 py-2 text-sm text-text-muted">
          Prices shown here are indicative. Checkout recalculates totals
          server-side using current catalog rules — never trust browser-stored
          amounts for payment.
        </p>
      </div>

      <aside className="h-fit rounded-lg border border-border bg-surface-raised/60 p-5">
        <h2 className="font-semibold text-text">Summary</h2>
        <p className="mt-2 text-sm text-text-muted">
          Estimated subtotal (client-side)
        </p>
        <p className="mt-1 font-[family-name:var(--font-sora)] text-2xl font-semibold text-text">
          {formatNpr(subtotalMinor)}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            href="/checkout"
            disabled={resolved.length === 0}
            className="w-full"
          >
            Proceed to checkout
          </Button>
          <Button href={waUrl} external variant="whatsapp" className="w-full">
            WhatsApp {getWhatsAppDisplay()}
          </Button>
        </div>
      </aside>

      <ComplianceDisclaimer className="lg:col-span-2" compact />
    </div>
  );
}

export { CART_KEY };
