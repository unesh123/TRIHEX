import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatusPill } from "@/components/admin/admin-section-page";
import { Button } from "@/components/ui/button";
import { loadAdminProducts, type AdminProductRow } from "@/lib/catalog/live-catalogue";
import { formatNpr } from "@/lib/money";
import { productFamilyKey } from "@/lib/catalog/product-families";

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

function stockLabel(stock: number | null): string {
  if (stock == null) return "∞";
  if (stock <= 0) return "Out";
  if (stock <= 5) return `Low · ${stock}`;
  return String(stock);
}

function groupProducts(rows: AdminProductRow[]) {
  const groups = new Map<string, AdminProductRow[]>();
  for (const row of rows) {
    const key = productFamilyKey(row.slug);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  return Array.from(groups, ([key, group]) => {
    const sorted = [...group].sort(
      (a, b) => (a.priceMinor ?? Number.MAX_SAFE_INTEGER) - (b.priceMinor ?? Number.MAX_SAFE_INTEGER),
    );
    return { key, rows: sorted, representative: sorted[0]! };
  });
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string; error?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const rows = await loadAdminProducts();
  const visible = rows.filter((r) => r.productStatus !== "ARCHIVED");
  const query = (params.q ?? "").trim().toLowerCase();
  const statusFilter = params.status ?? "ALL";
  const filtered = visible.filter((row) => {
    const matchesQuery = !query || [row.name, row.slug, row.sku, row.brandSlug ?? ""].some((value) => value.toLowerCase().includes(query));
    const matchesStatus = statusFilter === "ALL" || row.productStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const families = groupProducts(filtered);

  return (
    <>
      <AdminHeader
        title="Products"
        description="One control row per product family. Open a plan only when you need to edit its price, stock, image, or live status."
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

      <form action="/admin/products" className="mb-4 flex flex-col gap-2 rounded-xl border border-border bg-white p-3 shadow-sm sm:flex-row">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search product, SKU, or brand…"
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
          aria-label="Search products"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
          aria-label="Filter product status"
        >
          <option value="ALL">All statuses</option>
          <option value="PUBLIC">Available</option>
          <option value="DRAFT">Check Availability</option>
          <option value="BLOCKED">Unavailable</option>
        </select>
        <Button type="submit" size="sm">Filter</Button>
        {(query || statusFilter !== "ALL") ? <Button href="/admin/products" size="sm" variant="ghost">Clear</Button> : null}
      </form>

      <DataTableShell
        title="Product families"
        description={`${families.length} families shown · ${filtered.length} active plans matched · ${rows.length} records including archived`}
      >
        <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border bg-surface-raised/50 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Product family</th>
                <th className="px-4 py-3 font-medium">Plans</th>
                <th className="px-4 py-3 font-medium">Price range</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {families.map(({ key, rows: plans, representative }) => {
                const prices = plans
                  .map((plan) => plan.priceMinor)
                  .filter((price): price is number => price != null);
                const minPrice = prices.length ? Math.min(...prices) : null;
                const maxPrice = prices.length ? Math.max(...prices) : null;
                const statuses = new Set(plans.map((plan) => plan.productStatus));
                const status = statuses.size === 1 ? representative.productStatus : "MIXED";
                const totalStock = plans.every((plan) => plan.seedVisibleQuantity == null)
                  ? null
                  : plans.reduce((sum, plan) => sum + Math.max(0, plan.seedVisibleQuantity ?? 0), 0);

                return (
                  <tr key={key} className="border-b border-border/70 align-top hover:bg-surface-raised/30">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        {representative.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={representative.coverUrl}
                            alt=""
                            loading="lazy"
                            className="h-11 w-11 shrink-0 rounded-xl border border-[var(--border)] object-contain bg-[var(--page-soft)]"
                          />
                        ) : (
                          <div className="h-11 w-11 shrink-0 rounded-xl border border-dashed border-[var(--border)] bg-[var(--page-soft)]" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-text">{representative.name}</div>
                          <div className="mt-0.5 text-xs text-text-muted">{representative.brandSlug ?? "TRIHEX"}</div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {plans.map((plan) => (
                              <Link
                                key={plan.id}
                                href={`/admin/products/${plan.id}`}
                                className="rounded-full border border-border bg-white px-2 py-1 text-[10px] font-semibold text-text-secondary transition hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
                              >
                                {plan.sku}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
                        {plans.length} {plans.length === 1 ? "plan" : "plans"}
                      </span>
                      <p className="mt-2 max-w-[210px] text-xs leading-relaxed text-text-muted">
                        Plans stay on one product family in the shop.
                      </p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-text">
                      {minPrice == null
                        ? "On enquiry"
                        : minPrice === maxPrice
                          ? formatNpr(minPrice)
                          : `${formatNpr(minPrice)} – ${formatNpr(maxPrice!)}`}
                    </td>
                    <td className="px-4 py-4">
                      <span className={totalStock != null && totalStock <= 5 ? "font-semibold text-[var(--warning)]" : "text-text"}>
                        {totalStock == null ? "∞" : totalStock === 0 ? "Out" : totalStock}
                      </span>
                      <div className="mt-1 text-[10px] text-text-muted">
                        {plans.map((plan) => `${plan.sku}: ${stockLabel(plan.seedVisibleQuantity)}`).join(" · ")}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill label={status} variant={status === "MIXED" ? "warning" : statusVariant(status)} />
                      {plans.some((plan) => !plan.purchasable) ? (
                        <div className="mt-1 text-[10px] text-text-muted">WhatsApp check required</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/products/${representative.id}`}
                        className="inline-flex rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-primary-soft hover:underline"
                      >
                        Manage family →
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
