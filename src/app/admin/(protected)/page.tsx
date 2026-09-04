import { AdminHeader } from "@/components/admin/admin-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { getRecentAuditEvents, type AuditEvent } from "@/lib/audit/log";
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

import { auditCatalogClaims } from "@/lib/catalog/claims-engine";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  let dataWarning = "";
  let products = [] as Awaited<ReturnType<typeof loadAdminProducts>>;
  if (isDatabaseConfigured()) {
    try {
      products = await loadAdminProducts();
    } catch (error) {
      console.error("[Admin overview] product load failed", error);
      dataWarning = "Some live catalogue data is temporarily unavailable. The admin shell is still safe to use; check System health before making changes.";
    }
  }
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
  let recentAudit: AuditEvent[] = [];
  try {
    recentAudit = await getRecentAuditEvents(8);
  } catch (error) {
    console.error("[Admin overview] audit load failed", error);
    dataWarning ||= "Recent audit activity is temporarily unavailable.";
  }

  let orderCount = 0;
  let pendingProofs = 0;
  let unpaidOrders = 0;
  let toDeliver = 0;
  let deliveredCount = 0;
  const revenue = await getVerifiedRevenueStats();
  const paidOrders = await getPaidOrdersCount();
  const claimsAudit = auditCatalogClaims();

  if (isDatabaseConfigured()) {
    try {
      const orders = await getRepositories().orders.listRecent(100);
      orderCount = orders.length;
      unpaidOrders = orders.filter((o) => o.paymentStatus !== "PAID").length;
      toDeliver = orders.filter(
        (o) =>
          o.paymentStatus === "PAID" && !o.fulfillmentWhatsappDelivered,
      ).length;
      deliveredCount = orders.filter((o) => o.fulfillmentWhatsappDelivered).length;
      const payments = await listManualPayments();
      pendingProofs = payments.filter((p) =>
        ["SUBMITTED", "UNDER_REVIEW"].includes(p.status),
      ).length;
    } catch (error) {
      console.error("[Admin overview] order/payment load failed", error);
      dataWarning ||= "Order and payment metrics are temporarily unavailable.";
    }
  }

  return (
    <>
      <AdminHeader
        title="TRIHEX Command Center"
        description="Real-time operations pipeline — verified revenue, payment queue, SLA fulfillment, product claims health, and audit logs."
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

      {/* Live Operational Pipeline */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Live Order Pipeline &amp; SLA Tracking
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            System Online
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">1. Awaiting Payment</span>
            <div className="text-lg font-black text-slate-800 mt-0.5">{unpaidOrders}</div>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 border border-amber-100">
            <span className="text-[10px] uppercase font-bold text-amber-600">2. Proof Review</span>
            <div className="text-lg font-black text-amber-900 mt-0.5">{pendingProofs}</div>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-600">3. To Deliver (WhatsApp)</span>
            <div className="text-lg font-black text-blue-900 mt-0.5">{toDeliver}</div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
            <span className="text-[10px] uppercase font-bold text-emerald-600">4. Delivered &amp; Active</span>
            <div className="text-lg font-black text-emerald-900 mt-0.5">{deliveredCount}</div>
          </div>
        </div>
      </div>

      {!isDatabaseConfigured() ? (
        <div className="mb-8 rounded-2xl border border-warning/30 bg-[linear-gradient(135deg,#fff8e9,#fffdf8)] px-5 py-4 text-sm text-text-muted shadow-sm">
          <strong className="text-warning">Demo mode.</strong> Set{" "}
          <code className="text-xs">DATABASE_URL</code> to load live KPIs.
        </div>
      ) : null}
      {dataWarning ? (
        <div className="mb-8 rounded-2xl border border-warning/30 bg-[linear-gradient(135deg,#fff8e9,#fffdf8)] px-5 py-4 text-sm text-text-muted shadow-sm">
          <strong className="text-warning">Live data warning.</strong>{" "}
          {dataWarning}
        </div>
      ) : null}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
          label="Available catalogue"
          value={purchasable}
          hint={`${publicCount} public · ${draftCount} draft · ${blockedCount} blocked`}
        />
        <KpiCard
          label="Low stock (≤5)"
          value={lowStock}
          tone={lowStock > 0 ? "warning" : "default"}
          hint={`${missingCover} missing covers · stock drops on Approve`}
        />
        <KpiCard
          label="Verified claims health"
          value={`${claimsAudit.verifiedCount} Active`}
          tone={claimsAudit.needsReview.length > 0 ? "warning" : "success"}
          hint={`${claimsAudit.needsReview.length} need review · Zero false promises`}
        />
        <KpiCard
          label="Expired deals queue"
          value={claimsAudit.expired.length}
          tone={claimsAudit.expired.length > 0 ? "warning" : "default"}
          hint="Automated expiration active (e.g. pCloud)"
        />
      </div>

      <div className="mt-7 rounded-2xl border border-[var(--success)]/18 bg-[linear-gradient(135deg,var(--success-soft),#fbfffd)] px-5 py-4 text-sm leading-relaxed text-[var(--text-secondary)] shadow-sm">
        <strong className="text-[var(--success)]">Manual verify flow:</strong>{" "}
        Customer pays + uploads proof → you Approve → order becomes{" "}
        <strong>PAID</strong>, revenue/profit count here, and product stock
        decreases by the bought quantity. Reject puts the order back to awaiting
        payment (and restores stock if it was already approved).
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="admin-surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="font-[family-name:var(--font-sora)] text-lg font-semibold tracking-[-0.03em] text-text">Quick links</h2><span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-text-muted">Shortcuts</span></div>
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

        <section className="admin-surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="font-[family-name:var(--font-sora)] text-lg font-semibold tracking-[-0.03em] text-text">Recent audit</h2><span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-text-muted">Latest events</span></div>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-[var(--page-soft)]/45 text-xs text-text-muted">
            {recentAudit.length === 0 ? (
              <li>No events yet.</li>
            ) : (
              recentAudit.map((event) => (
                <li key={event.id} className="flex justify-between gap-3 px-3 py-3 first:pt-3 last:pb-3">
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
