import { AdminHeader } from "@/components/admin/admin-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { getRecentAuditEvents } from "@/lib/audit/log";
import {
  getPaidOrdersCount,
  getVerifiedRevenueStats,
} from "@/lib/admin/revenue-stats";
import { loadAdminProducts } from "@/lib/catalog/live-catalogue";
import { isDatabaseConfigured } from "@/lib/env";
import { listManualPayments } from "@/lib/payments/store";
import { getRepositories } from "@/lib/repositories";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const products = isDatabaseConfigured() ? await loadAdminProducts() : [];
  const active = products.filter((p) => p.productStatus !== "ARCHIVED");
  const publicCount = active.filter((p) => p.productStatus === "PUBLIC").length;
  const blockedCount = active.filter((p) => p.productStatus === "BLOCKED").length;
  const draftCount = active.filter((p) => p.productStatus === "DRAFT").length;
  const purchasable = active.filter((p) => p.purchasable).length;
  const missingCover = active.filter((p) => !p.coverUrl).length;
  const lowStock = active.filter(
    (p) =>
      p.seedVisibleQuantity != null &&
      p.seedVisibleQuantity > 0 &&
      p.seedVisibleQuantity <= 5,
  ).length;
  const recentAudit = await getRecentAuditEvents(8);

  let orderCount = 0;
  let pendingProofs = 0;
  let unpaidOrders = 0;
  let toDeliver = 0;
  const revenue = await getVerifiedRevenueStats();
  const paidOrders = await getPaidOrdersCount();

  if (isDatabaseConfigured()) {
    const orders = await getRepositories().orders.listRecent(100);
    orderCount = orders.length;
    unpaidOrders = orders.filter((o) => o.paymentStatus !== "PAID").length;
    toDeliver = orders.filter(
      (o) =>
        o.paymentStatus === "PAID" && !o.fulfillmentWhatsappDelivered,
    ).length;
    const payments = await listManualPayments();
    pendingProofs = payments.filter((p) =>
      ["SUBMITTED", "UNDER_REVIEW"].includes(p.status),
    ).length;
  }

  return (
    <>
      <AdminHeader
        title="Overview"
        description="Live ops — verified revenue, profit, payment proofs, products, and stock."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/admin/payments/review" size="sm">
              Payment queue
              {pendingProofs > 0 ? ` (${pendingProofs})` : ""}
            </Button>
            <Button href="/admin/orders" variant="secondary" size="sm">
              Orders{toDeliver > 0 ? ` · ${toDeliver} to deliver` : ""}
            </Button>
            <Button href="/admin/products/new" variant="secondary" size="sm">
              Add product
            </Button>
          </div>
        }
      />

      {!isDatabaseConfigured() ? (
        <div className="mb-8 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-text-muted">
          <strong className="text-warning">Demo mode.</strong> Set{" "}
          <code className="text-xs">DATABASE_URL</code> to load live KPIs.
        </div>
      ) : null}

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Verified revenue"
          value={revenue.revenueLabel}
          tone="success"
          hint={`${revenue.verifiedCount} approved payments · ${paidOrders} PAID orders`}
        />
        <KpiCard
          label="Estimated profit"
          value={revenue.profitLabel}
          tone={revenue.profitNprMinor < 0 ? "warning" : "success"}
          hint={
            revenue.costNprMinor > 0
              ? `Cost ${revenue.costLabel} · from verified orders`
              : "Set product cost in admin for accurate profit"
          }
        />
        <KpiCard
          label="Pending payment proofs"
          value={pendingProofs}
          tone={pendingProofs > 0 ? "warning" : "default"}
          hint="Approve here → revenue + stock update"
        />
        <KpiCard
          label="Recent orders"
          value={orderCount}
          hint={`${unpaidOrders} not fully paid yet`}
        />
        <KpiCard
          label="To deliver"
          value={toDeliver}
          tone={toDeliver > 0 ? "warning" : "success"}
          hint="PAID orders waiting for WhatsApp delivery"
        />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Buy Now products"
          value={purchasable}
          hint={`${publicCount} public · ${draftCount} draft · ${blockedCount} blocked`}
        />
        <KpiCard
          label="Low stock (≤5)"
          value={lowStock}
          tone={lowStock > 0 ? "warning" : "default"}
          hint={`${missingCover} missing covers · stock drops on Approve`}
        />
      </div>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--success-soft)]/40 px-4 py-3 text-sm text-[var(--text-secondary)]">
        <strong className="text-[var(--success)]">Manual verify flow:</strong>{" "}
        Customer pays + uploads proof → you Approve → order becomes{" "}
        <strong>PAID</strong>, revenue/profit count here, and product stock
        decreases by the bought quantity. Reject puts the order back to awaiting
        payment (and restores stock if it was already approved).
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface/60 p-5">
          <h2 className="text-sm font-semibold text-text">Quick links</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button href="/admin/products" variant="secondary" size="sm">
              Products & images
            </Button>
            <Button href="/admin/pricing" variant="secondary" size="sm">
              Pricing desk
            </Button>
            <Button href="/admin/orders" variant="secondary" size="sm">
              Orders
            </Button>
            <Button href="/admin/payments/review" variant="secondary" size="sm">
              Payment review
            </Button>
            <Button href="/admin/payment-methods" variant="secondary" size="sm">
              Payment QR
            </Button>
            <Button href="/admin/settings/security" variant="secondary" size="sm">
              Security / MFA
            </Button>
          </div>
          <p className="mt-4 text-xs text-text-muted">
            Live shop:{" "}
            <a
              href="https://trihexdigital.shop"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              trihexdigital.shop
            </a>
            . Change name/image/price on Products → Save.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface/60 p-5">
          <h2 className="text-sm font-semibold text-text">Recent audit</h2>
          <ul className="mt-4 space-y-2 text-xs text-text-muted">
            {recentAudit.length === 0 ? (
              <li>No events yet.</li>
            ) : (
              recentAudit.map((event) => (
                <li key={event.id} className="flex justify-between gap-2">
                  <span>
                    {event.action} · {event.entityType}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {new Date(event.createdAt).toLocaleString("en-NP")}
                  </span>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/admin/audit"
            className="mt-4 inline-block text-xs text-primary hover:underline"
          >
            View audit log →
          </Link>
        </section>
      </div>
    </>
  );
}
