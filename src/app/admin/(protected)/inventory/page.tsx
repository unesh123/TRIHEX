import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatusPill } from "@/components/admin/admin-section-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateVariantPriceAction } from "@/app/admin/(protected)/products/actions";
import { formatNpr } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = requireDb();
  const rows = await db
    .select({
      productId: schema.products.id,
      variantId: schema.productVariants.id,
      name: schema.products.name,
      slug: schema.products.slug,
      status: schema.products.productStatus,
      sku: schema.productVariants.sku,
      qty: schema.productVariants.seedVisibleQuantity,
      purchasable: schema.productVariants.purchasable,
      price: schema.productVariants.manualSellingPriceNprMinor,
    })
    .from(schema.productVariants)
    .innerJoin(
      schema.products,
      eq(schema.productVariants.productId, schema.products.id),
    )
    .orderBy(schema.products.name);

  const low = rows.filter((r) => r.qty != null && r.qty > 0 && r.qty <= 5).length;
  const out = rows.filter((r) => r.qty === 0).length;

  return (
    <>
      <AdminHeader
        title="Inventory"
        description="Manual stock quantities shown on the storefront. Set 0 = unavailable and route customers to WhatsApp. Leave empty = unlimited."
        actions={
          <Button href="/admin/pricing" size="sm" variant="secondary">
            Pricing desk
          </Button>
        }
      />

      {params.saved ? (
        <p className="mb-4 text-sm text-[var(--success)]">
          Stock saved — storefront revalidated.
        </p>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
          <p className="text-[var(--text-muted)]">Variants</p>
          <p className="text-2xl font-semibold">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-soft)] px-4 py-3 text-sm">
          <p className="text-[var(--text-muted)]">Low stock (≤5)</p>
          <p className="text-2xl font-semibold text-[var(--warning)]">{low}</p>
        </div>
        <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-3 text-sm">
          <p className="text-[var(--text-muted)]">Out of stock</p>
          <p className="text-2xl font-semibold text-[var(--danger)]">{out}</p>
        </div>
      </div>

      <DataTableShell
        title="Stock by product"
        description="Edit qty and save. Customers see “Only X left” or “Out of stock”."
      >
        <div className="divide-y divide-[var(--border)]">
          {rows.map((row) => (
            <form
              key={row.variantId}
              action={updateVariantPriceAction}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <input type="hidden" name="variantId" value={row.variantId} />
              <input type="hidden" name="productId" value={row.productId} />
              <input
                type="hidden"
                name="priceNpr"
                value={row.price != null ? Math.round(row.price / 100) : 0}
              />
              {row.purchasable ? (
                <input type="hidden" name="purchasable" value="on" />
              ) : null}
              <div>
                <p className="font-medium text-[var(--text)]">{row.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {row.sku}
                  {row.price != null ? ` · ${formatNpr(row.price)}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <StatusPill label={String(row.status)} variant="default" />
                  {row.qty === 0 ? (
                    <StatusPill label="Out of stock" variant="danger" />
                  ) : row.qty != null && row.qty <= 5 ? (
                    <StatusPill label={`Only ${row.qty} left`} variant="warning" />
                  ) : row.qty != null ? (
                    <StatusPill label={`${row.qty} in stock`} variant="success" />
                  ) : (
                    <StatusPill label="Unlimited" variant="default" />
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-xs text-[var(--text-muted)]">
                  Stock qty
                  <Input
                    name="seedVisibleQuantity"
                    type="number"
                    min={0}
                    defaultValue={row.qty ?? ""}
                    placeholder="∞"
                    className="mt-1 w-28"
                  />
                </label>
                <Button type="submit" size="sm">
                  Save stock
                </Button>
                <Link
                  href={`/admin/products/${row.productId}`}
                  className="text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  Edit product →
                </Link>
              </div>
            </form>
          ))}
        </div>
      </DataTableShell>
    </>
  );
}
