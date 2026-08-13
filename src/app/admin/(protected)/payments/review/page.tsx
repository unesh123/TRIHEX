import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatusPill } from "@/components/admin/admin-section-page";
import { PaymentReviewActions } from "@/components/admin/payment-review-actions";
import { listManualPayments } from "@/lib/payments/store";
import { formatNpr } from "@/lib/money";
import { resolveProofViewUrl } from "@/lib/storage/proof-url";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsReviewPage() {
  const all = await listManualPayments();
  const queue = all.filter((p) =>
    ["SUBMITTED", "UNDER_REVIEW"].includes(p.status),
  );
  const recentDone = all
    .filter((p) => ["VERIFIED", "REJECTED"].includes(p.status))
    .slice(0, 15);

  const orderIds = [...new Set(all.map((p) => p.orderId))];
  const orderMap = new Map<string, { number: string; name: string }>();
  if (orderIds.length) {
    const db = requireDb();
    const rows = await db
      .select({
        id: schema.orders.id,
        number: schema.orders.humanReadableOrderNumber,
        name: schema.orders.customerName,
      })
      .from(schema.orders)
      .where(inArray(schema.orders.id, orderIds));
    for (const r of rows) {
      orderMap.set(r.id, { number: r.number, name: r.name ?? "—" });
    }
  }

  async function withProof(p: (typeof all)[0]) {
    return {
      ...p,
      viewUrl: await resolveProofViewUrl(p.proofUrl),
      order: orderMap.get(p.orderId),
    };
  }

  const pending = await Promise.all(queue.map(withProof));
  const done = await Promise.all(recentDone.map(withProof));

  return (
    <>
      <AdminHeader
        title="Payment review"
        description="See payment screenshots, approve or reject. Approving marks the order as PAID."
        actions={
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            All orders →
          </Link>
        }
      />

      <DataTableShell
        title={`Pending proofs (${pending.length})`}
        description="Customer uploaded screenshots waiting for manual verification."
      >
        {pending.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[var(--text-muted)]">
            No pending payment proofs. When a customer uploads a screenshot after
            checkout, it appears here.
          </p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {pending.map((p) => (
              <div
                key={p.id}
                className="grid gap-4 px-4 py-4 lg:grid-cols-[160px_1fr_auto]"
              >
                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--page-soft)]">
                  {p.viewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a href={p.viewUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={p.viewUrl}
                        alt="Payment proof"
                        className="h-36 w-full object-contain bg-white"
                      />
                    </a>
                  ) : (
                    <div className="flex h-36 items-center justify-center px-2 text-center text-xs text-[var(--text-muted)]">
                      Screenshot unavailable
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-mono text-xs text-[var(--primary)]">
                    {p.order?.number ?? p.orderId}
                  </p>
                  <p className="font-medium text-[var(--text)]">
                    {p.payerName ?? "—"} · {p.method.replace(/_/g, " ")}
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    Amount {formatNpr(p.amountNprMinor)}
                    {p.referenceCode ? ` · Ref ${p.referenceCode}` : ""}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Customer: {p.order?.name ?? "—"} · Submitted{" "}
                    {new Date(p.submittedAt).toLocaleString("en-NP")}
                  </p>
                  <StatusPill label={p.status} variant="warning" />
                </div>
                <PaymentReviewActions
                  paymentId={p.id}
                  orderHref={`/admin/orders/${p.orderId}`}
                />
              </div>
            ))}
          </div>
        )}
      </DataTableShell>

      {done.length > 0 ? (
        <div className="mt-8">
          <DataTableShell title="Recently reviewed">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-raised/50 text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {done.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${p.orderId}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {p.order?.number ?? p.orderId.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatNpr(p.amountNprMinor)}</td>
                    <td className="px-4 py-3">
                      <StatusPill
                        label={p.status}
                        variant={p.status === "VERIFIED" ? "success" : "danger"}
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {p.reviewedAt
                        ? new Date(p.reviewedAt).toLocaleString("en-NP")
                        : "—"}
                      {p.rejectionReason ? ` · ${p.rejectionReason}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTableShell>
        </div>
      ) : null}
    </>
  );
}
