import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatusPill } from "@/components/admin/admin-section-page";
import { Button } from "@/components/ui/button";
import { loadAdminProducts } from "@/lib/catalog/live-catalogue";
import { formatNpr } from "@/lib/money";

export const dynamic = "force-dynamic";

function statusVariant(
  status: string,
): "default" | "success" | "warning" | "danger" | "primary" {
  switch (status) {
    case "PUBLIC":
    case "APPROVED":
      return "success";
    case "DRAFT":
    case "UNREVIEWED":
      return "default";
    case "BLOCKED":
    case "REJECTED":
    case "SUSPENDED":
    case "ARCHIVED":
      return "danger";
    case "DOCUMENTS_REQUIRED":
      return "warning";
    default:
      return "default";
  }
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await loadAdminProducts();
  const visible = rows.filter((r) => r.productStatus !== "ARCHIVED");

  return (
    <>
      <AdminHeader
        title="Products"
        description="Live catalogue from Supabase. Buy cost, sell price, profit and stock show in the list — no need to open Edit."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/admin/products/new" size="sm">
              Add product
            </Button>
            <Button href="/admin/products/import" size="sm" variant="secondary">
              Import cost → NPR
            </Button>
            <Button href="/admin/pricing" size="sm" variant="secondary">
              Pricing desk
            </Button>
          </div>
        }
      />

      {params.archived ? (
        <p className="mb-4 text-sm text-[var(--success)]">
          Product archived (soft-deleted). It no longer appears on the storefront.
        </p>
      ) : null}
      {params.error ? (
        <p className="mb-4 text-sm text-[var(--danger)]">Could not complete that action.</p>
      ) : null}

      <DataTableShell
        title="All products"
        description={`${visible.length} active records · ${rows.length} including archived`}
      >
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-border bg-surface-raised/50 text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Buy (cost)</th>
              <th className="px-4 py-3 font-medium">Sell</th>
              <th className="px-4 py-3 font-medium">Profit</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => {
              const sellMinor = product.priceMinor;
              const costUsd = product.costUsdMinor != null
                ? product.costUsdMinor / 100
                : null;
              const costNprMinor =
                product.costUsdMinor != null
                  ? Math.round((product.costUsdMinor / 100) * 160 * 100)
                  : null;
              const profitMinor =
                sellMinor != null && costNprMinor != null
                  ? sellMinor - costNprMinor
                  : null;
              const marginPct =
                profitMinor != null && costNprMinor != null && costNprMinor > 0
                  ? Math.round((profitMinor / costNprMinor) * 100)
                  : null;
              const stock = product.seedVisibleQuantity;
              const stockLabel =
                stock == null
                  ? "∞"
                  : stock <= 0
                    ? "Out"
                    : stock <= 5
                      ? `Low · ${stock}`
                      : String(stock);

              return (
              <tr
                key={`${product.id}-${product.variantId}`}
                className="border-b border-border/70 hover:bg-surface-raised/30"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.coverUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg border border-[var(--border)] object-contain bg-[var(--page-soft)]"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg border border-dashed border-[var(--border)] bg-[var(--page-soft)]" />
                    )}
                    <div>
                      <div className="font-medium text-text">{product.name}</div>
                      <div className="text-xs text-text-muted">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {product.brandSlug ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {costUsd != null ? (
                    <div>
                      <div className="font-medium text-text">
                        ${costUsd.toFixed(2)}
                      </div>
                      <div className="text-xs text-text-muted">
                        ≈ {costNprMinor != null ? formatNpr(costNprMinor) : "—"}
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-text">
                  {sellMinor != null ? formatNpr(sellMinor) : "—"}
                </td>
                <td className="px-4 py-3">
                  {profitMinor != null ? (
                    <div>
                      <div
                        className={
                          profitMinor >= 0
                            ? "font-medium text-[var(--success)]"
                            : "font-medium text-[var(--danger)]"
                        }
                      >
                        {formatNpr(profitMinor)}
                      </div>
                      {marginPct != null ? (
                        <div className="text-xs text-text-muted">
                          {marginPct}% margin
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      stock != null && stock <= 0
                        ? "text-[var(--danger)]"
                        : stock != null && stock <= 5
                          ? "text-[var(--warning)]"
                          : "text-text"
                    }
                  >
                    {stockLabel}
                  </span>
                  {!product.purchasable ? (
                    <div className="text-[10px] text-text-muted">No Buy Now</div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={product.productStatus}
                    variant={statusVariant(product.productStatus)}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>
    </>
  );
}
