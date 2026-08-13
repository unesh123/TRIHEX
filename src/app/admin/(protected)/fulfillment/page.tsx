import Link from "next/link";
import { and, desc, eq, ne, or } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatusPill } from "@/components/admin/admin-section-page";
import { DbUnavailable } from "@/components/admin/db-unavailable";
import { getAdminDbOrMessage } from "@/lib/admin/safe-db";
import * as schema from "@/db/schema";
import { formatNpr } from "@/lib/money";
import { fulfillmentStatusLabel } from "@/lib/orders/fulfillment-checklist";

export const dynamic = "force-dynamic";

export default async function FulfillmentQueuePage() {
  const readyDb = getAdminDbOrMessage();
  if (!readyDb.ok) {
    return <DbUnavailable title="Fulfillment queue" message={readyDb.message} />;
  }
  const db = readyDb.db;

  let rows: Array<{
    id: string;
    orderNumber: string;
    customerName: string | null;
    customerEmail: string;
    customerPhone: string | null;
    grandTotalMinor: number;
    paymentStatus: string;
    orderStatus: string;
    fulfillmentActivated: boolean;
    fulfillmentEmailSent: boolean;
    fulfillmentWhatsappDelivered: boolean;
    fulfillmentNotes: string | null;
    fulfillmentDeliveredAt: Date | null;
    placedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  try {
    rows = await db
      .select({
        id: schema.orders.id,
        orderNumber: schema.orders.humanReadableOrderNumber,
        customerName: schema.orders.customerName,
        customerEmail: schema.orders.customerEmail,
        customerPhone: schema.orders.customerPhone,
        grandTotalMinor: schema.orders.grandTotalMinor,
        paymentStatus: schema.orders.paymentStatus,
        orderStatus: schema.orders.orderStatus,
        fulfillmentActivated: schema.orders.fulfillmentActivated,
        fulfillmentEmailSent: schema.orders.fulfillmentEmailSent,
        fulfillmentWhatsappDelivered: schema.orders.fulfillmentWhatsappDelivered,
        fulfillmentNotes: schema.orders.fulfillmentNotes,
        fulfillmentDeliveredAt: schema.orders.fulfillmentDeliveredAt,
        placedAt: schema.orders.placedAt,
        createdAt: schema.orders.createdAt,
        updatedAt: schema.orders.updatedAt,
      })
      .from(schema.orders)
      .where(
        and(
          or(
            eq(schema.orders.paymentStatus, "PAID"),
            eq(schema.orders.orderStatus, "PAID"),
            eq(schema.orders.orderStatus, "PROCESSING"),
            eq(schema.orders.orderStatus, "COMPLETED"),
            eq(schema.orders.orderStatus, "FULFILLED"),
          ),
          ne(schema.orders.orderStatus, "CANCELLED"),
        ),
      )
      .orderBy(desc(schema.orders.updatedAt))
      .limit(200);
  } catch (e) {
    return (
      <DbUnavailable
        title="Fulfillment queue"
        message={e instanceof Error ? e.message : "Query failed"}
      />
    );
  }

  const ready = rows.filter(
    (o) =>
      (o.paymentStatus === "PAID" ||
        o.orderStatus === "PAID" ||
        o.orderStatus === "PROCESSING") &&
      !o.fulfillmentWhatsappDelivered,
  );
  const inProgress = ready.filter(
    (o) => o.fulfillmentActivated || o.fulfillmentEmailSent,
  );
  const waiting = ready.filter(
    (o) => !o.fulfillmentActivated && !o.fulfillmentEmailSent,
  );
  const delivered = rows.filter((o) => o.fulfillmentWhatsappDelivered);

  return (
    <>
      <AdminHeader
        title="Fulfillment queue"
        description="Paid orders waiting for activation and WhatsApp delivery. Open an order to tick the checklist."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Ready / waiting", value: waiting.length },
          { label: "In progress", value: inProgress.length },
          { label: "To deliver (open)", value: ready.length },
          { label: "Delivered (recent)", value: delivered.length },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-surface/60 px-4 py-3"
          >
            <p className="text-xs text-text-muted">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-text">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <DataTableShell title="Open fulfillment">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface-raised/50 text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Checklist</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {ready.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-text-muted"
                  >
                    No paid orders waiting. When you Approve a payment, it shows
                    here until WhatsApp delivery is marked done.
                  </td>
                </tr>
              ) : (
                ready.map((o) => {
                  const label = fulfillmentStatusLabel(
                    {
                      activated: o.fulfillmentActivated,
                      emailSent: o.fulfillmentEmailSent,
                      whatsappDelivered: o.fulfillmentWhatsappDelivered,
                      notes: o.fulfillmentNotes,
                      deliveredAt:
                        o.fulfillmentDeliveredAt?.toISOString() ?? null,
                    },
                    o.paymentStatus,
                    o.orderStatus,
                  );
                  return (
                    <tr key={o.id} className="border-b border-border/60">
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.orderNumber}</div>
                        <div className="text-xs text-text-muted">
                          {(o.placedAt ?? o.createdAt).toLocaleString("en-NP")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{o.customerName}</div>
                        <div className="text-xs text-text-muted">
                          {o.customerPhone || o.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatNpr(o.grandTotalMinor)}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted">
                        {[
                          o.fulfillmentActivated ? "Activated" : null,
                          o.fulfillmentEmailSent ? "Email" : null,
                          o.fulfillmentWhatsappDelivered ? "WhatsApp" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Not started"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill label={label} variant="warning" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Open checklist →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </DataTableShell>

      {delivered.length > 0 ? (
        <div className="mt-8">
          <DataTableShell title="Recently delivered">
            <ul className="divide-y divide-border text-sm">
              {delivered.slice(0, 20).map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                  <div>
                    <span className="font-medium">{o.orderNumber}</span>
                    <span className="ml-2 text-text-muted">
                      {o.customerName}
                    </span>
                  </div>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          </DataTableShell>
        </div>
      ) : null}
    </>
  );
}
