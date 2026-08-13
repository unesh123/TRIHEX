import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { DbUnavailable } from "@/components/admin/db-unavailable";
import { getAdminDbOrMessage } from "@/lib/admin/safe-db";
import * as schema from "@/db/schema";
import { formatNpr } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const readyDb = getAdminDbOrMessage();
  if (!readyDb.ok) {
    return <DbUnavailable title="Customers" message={readyDb.message} />;
  }
  const db = readyDb.db;

  let rows: Array<{
    email: string;
    name: string | null;
    phone: string | null;
    orderCount: number;
    paidCount: number;
    revenueMinor: number;
    lastOrderAt: Date | null;
    lastOrderId: string | null;
  }> = [];

  try {
    rows = await db
      .select({
        email: schema.orders.customerEmail,
        name: sql<string>`max(${schema.orders.customerName})`,
        phone: sql<string>`max(${schema.orders.customerPhone})`,
        orderCount: sql<number>`count(*)::int`,
        paidCount: sql<number>`count(*) filter (where ${schema.orders.paymentStatus} = 'PAID' or ${schema.orders.orderStatus} in ('PAID','COMPLETED','FULFILLED'))::int`,
        revenueMinor: sql<number>`coalesce(sum(${schema.orders.grandTotalMinor}) filter (where ${schema.orders.paymentStatus} = 'PAID' or ${schema.orders.orderStatus} in ('PAID','COMPLETED','FULFILLED')), 0)::int`,
        lastOrderAt: sql<Date>`max(coalesce(${schema.orders.placedAt}, ${schema.orders.createdAt}))`,
        lastOrderId: sql<string>`(array_agg(${schema.orders.id} order by coalesce(${schema.orders.placedAt}, ${schema.orders.createdAt}) desc))[1]`,
      })
      .from(schema.orders)
      .groupBy(schema.orders.customerEmail)
      .orderBy(
        desc(
          sql`max(coalesce(${schema.orders.placedAt}, ${schema.orders.createdAt}))`,
        ),
      )
      .limit(200);
  } catch (e) {
    return (
      <DbUnavailable
        title="Customers"
        message={e instanceof Error ? e.message : "Query failed"}
      />
    );
  }

  return (
    <>
      <AdminHeader
        title="Customers"
        description="From live orders only. Verified revenue counts PAID / completed orders."
      />
      <DataTableShell title={`Customers (${rows.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface-raised/50 text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Verified revenue</th>
                <th className="px-4 py-3">Last order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-text-muted"
                  >
                    No customers yet — they appear when orders are placed.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.email} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.name || "—"}</div>
                      <div className="text-xs text-text-muted">{r.email}</div>
                      {r.phone ? (
                        <div className="text-xs text-text-muted">{r.phone}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{r.orderCount}</td>
                    <td className="px-4 py-3 tabular-nums">{r.paidCount}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatNpr(r.revenueMinor)}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {r.lastOrderAt
                        ? new Date(r.lastOrderAt).toLocaleString("en-NP")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.lastOrderId ? (
                        <Link
                          href={`/admin/orders/${r.lastOrderId}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Latest order →
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DataTableShell>
    </>
  );
}
