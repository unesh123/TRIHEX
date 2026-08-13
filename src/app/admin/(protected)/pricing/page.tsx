import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateVariantPriceAction } from "@/app/admin/(protected)/products/actions";
import { formatNpr } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = requireDb();
  const rows = await db
    .select({
      variantId: schema.productVariants.id,
      sku: schema.productVariants.sku,
      variantName: schema.productVariants.variantName,
      price: schema.productVariants.manualSellingPriceNprMinor,
      purchasable: schema.productVariants.purchasable,
      qty: schema.productVariants.seedVisibleQuantity,
      productName: schema.products.name,
      slug: schema.products.slug,
      status: schema.products.productStatus,
      compliance: schema.products.complianceStatus,
    })
    .from(schema.productVariants)
    .innerJoin(
      schema.products,
      eq(schema.productVariants.productId, schema.products.id),
    )
    .orderBy(schema.products.name);

  return (
    <>
      <AdminHeader
        title="Pricing & stock"
        description="Edit NPR selling prices and stock qty. Set stock 0 = Out of stock on storefront."
      />
      {params.saved ? (
        <p className="mb-4 text-sm text-[var(--success)]">Price saved and storefront revalidated.</p>
      ) : null}
      {params.error ? (
        <p className="mb-4 text-sm text-[var(--danger)]">Could not save. Check values.</p>
      ) : null}

      <div className="space-y-4">
        {rows.map((row) => (
          <form
            key={row.variantId}
            action={updateVariantPriceAction}
            className="rounded-xl border border-[var(--border)] bg-white p-4"
          >
            <input type="hidden" name="variantId" value={row.variantId} />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--text)]">{row.productName}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {row.sku} · {row.status} / {row.compliance}
                  {row.price != null ? ` · current ${formatNpr(row.price)}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-xs">
                  Sell NPR
                  <Input
                    name="priceNpr"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={
                      row.price != null ? Math.round(row.price / 100) : ""
                    }
                    className="mt-1 w-28"
                    required
                  />
                </label>
                <label className="text-xs">
                  Stock qty
                  <Input
                    name="seedVisibleQuantity"
                    type="number"
                    defaultValue={row.qty ?? ""}
                    className="mt-1 w-24"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    name="purchasable"
                    defaultChecked={Boolean(row.purchasable)}
                  />
                  Purchasable
                </label>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </div>
            </div>
          </form>
        ))}
      </div>
    </>
  );
}
