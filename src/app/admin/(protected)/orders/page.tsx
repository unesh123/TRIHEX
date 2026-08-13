import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatusPill } from "@/components/admin/admin-section-page";
import { getRepositories } from "@/lib/repositories";
import { formatNpr } from "@/lib/money";
import Link from "next/link";
import { getPersistenceMode } from "@/lib/repositories";
import { fulfillmentStatusLabel } from "@/lib/orders/fulfillment-checklist";

function priorityForOrder(order: { paymentStatus: string; fulfillmentWhatsappDelivered?: boolean; createdAt: string }) {
  if (["SUBMITTED", "UNDER_REVIEW"].includes(order.paymentStatus)) return 0;
  if (order.paymentStatus === "PAID" && !order.fulfillmentWhatsappDelivered) return 1;
  if (order.paymentStatus !== "PAID") return 2;
  return 3;
}

function humanizeStatus(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminOrdersPage() {
  const mode = getPersistenceMode();
  const orders = await getRepositories().orders.listRecent(50);
  const prioritizedOrders = [...orders].sort((a, b) => {
    const priority = priorityForOrder(a) - priorityForOrder(b);
    if (priority !== 0) return priority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const pendingPayment = orders.filter((order) => order.paymentStatus !== "PAID").length;
  const readyToDeliver = orders.filter(
    (order) => order.paymentStatus === "PAID" && !order.fulfillmentWhatsappDelivered,
  ).length;

  return (
    <AdminSectionPage
      title="Orders"
      description={
        mode === "postgres"
          ? "Live orders from PostgreSQL."
          : "Orders from the active persistence adapter (demo/test until DATABASE_URL is set)."
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--warning)]/20 bg-[var(--warning-soft)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--warning)]">Awaiting payment action</p>
          <p className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold text-[var(--text)]">{pendingPayment}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Review proof or follow up from the order detail.</p>
        </div>
        <div className="rounded-2xl border border-[var(--primary)]/15 bg-[var(--primary-soft)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">Ready to fulfill</p>
          <p className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold text-[var(--text)]">{readyToDeliver}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Paid orders still waiting for a delivery action.</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Recent order records</p>
          <p className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold text-[var(--text)]">{orders.length}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Showing the latest 50 records from the active store.</p>
        </div>
      </div>
      <DataTableShell title="Work queue and recent orders">
        {prioritizedOrders.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-text-muted">
            No orders yet. Place a storefront checkout to create the first order.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-raised/50 text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {prioritizedOrders.map((o) => {
                const fulfillLabel = fulfillmentStatusLabel(
                  {
                    activated: Boolean(o.fulfillmentActivated),
                    emailSent: Boolean(o.fulfillmentEmailSent),
                    whatsappDelivered: Boolean(o.fulfillmentWhatsappDelivered),
                    notes: o.fulfillmentNotes ?? null,
                    deliveredAt: o.fulfillmentDeliveredAt ?? null,
                  },
                  o.paymentStatus,
                  o.status,
                );
                return (
                  <tr key={o.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>{o.customerName}</div>
                      <div className="text-xs text-text-muted">{o.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3">{formatNpr(o.totalNprMinor)}</td>
                    <td className="px-4 py-3">
                      <StatusPill
                        label={humanizeStatus(o.paymentStatus)}
                        variant={
                          o.paymentStatus === "PAID"
                            ? "success"
                            : o.paymentStatus === "UNDER_REVIEW"
                              ? "warning"
                              : "default"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        label={fulfillLabel}
                        variant={
                          o.fulfillmentWhatsappDelivered ? "success" : "warning"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {humanizeStatus(o.status)} →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </AdminSectionPage>
  );
}
