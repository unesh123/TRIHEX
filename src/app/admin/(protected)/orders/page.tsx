import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatusPill } from "@/components/admin/admin-section-page";
import { getRepositories } from "@/lib/repositories";
import { formatNpr } from "@/lib/money";
import Link from "next/link";
import { getPersistenceMode } from "@/lib/repositories";
import { fulfillmentStatusLabel } from "@/lib/orders/fulfillment-checklist";

export default async function AdminOrdersPage() {
  const mode = getPersistenceMode();
  const orders = await getRepositories().orders.listRecent(50);

  return (
    <AdminSectionPage
      title="Orders"
      description={
        mode === "postgres"
          ? "Live orders from PostgreSQL."
          : "Orders from the active persistence adapter (demo/test until DATABASE_URL is set)."
      }
    >
      <DataTableShell title="Recent orders">
        {orders.length === 0 ? (
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
              {orders.map((o) => {
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
                        label={o.paymentStatus}
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
                        {o.status} →
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
