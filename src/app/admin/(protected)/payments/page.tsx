import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { listManualPayments } from "@/lib/payments/store";
import { formatNpr } from "@/lib/money";
import { Button } from "@/components/ui/button";

export default async function AdminPaymentsPage() {
  const payments = await listManualPayments();

  return (
    <>
      <AdminHeader
        title="Payments"
        description="Manual payment submissions from checkout. Use Review queue to approve or reject proofs."
        actions={
          <Button href="/admin/payments/review" size="sm">
            Review queue
          </Button>
        }
      />
      <ul className="space-y-2 text-sm">
        {payments.length === 0 ? (
          <li className="text-text-muted">No manual payments submitted yet.</li>
        ) : (
          payments.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface/60 px-4 py-3"
            >
              <span>
                {p.id} · {p.status} · {formatNpr(p.amountNprMinor)}
              </span>
              <Link href="/admin/payments/review" className="text-xs text-primary">
                Review →
              </Link>
            </li>
          ))
        )}
      </ul>
    </>
  );
}
