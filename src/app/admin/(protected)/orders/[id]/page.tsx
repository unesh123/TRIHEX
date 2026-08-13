import { FulfillmentChecklistForm } from "@/components/admin/fulfillment-checklist-form";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatusPill } from "@/components/admin/admin-section-page";
import { PaymentReviewActions } from "@/components/admin/payment-review-actions";
import { Button } from "@/components/ui/button";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { formatNpr } from "@/lib/money";
import { detectPaymentDuplicates } from "@/lib/payments/store";
import { fulfillmentStatusLabel } from "@/lib/orders/fulfillment-checklist";
import { resolveProofViewUrl } from "@/lib/storage/proof-url";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = requireDb();

  const [byId] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .limit(1);

  const order =
    byId ??
    (
      await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.humanReadableOrderNumber, id))
        .limit(1)
    )[0];

  if (!order) notFound();

  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, order.id));

  const proofs = await db
    .select()
    .from(schema.manualPaymentSubmissions)
    .where(eq(schema.manualPaymentSubmissions.orderId, order.id));

  const proofsWithUrl = await Promise.all(
    proofs.map(async (p) => {
      const duplicates = await detectPaymentDuplicates({
        reference: p.senderReference,
        proofHash: p.proofContentHash,
        excludeOrderId: order.id,
      });
      return {
        ...p,
        viewUrl: await resolveProofViewUrl(p.proofImageUrl),
        duplicates,
      };
    }),
  );

  let customerWa: string | null = null;
  if (order.customerPhone?.trim()) {
    try {
      const digits = normalizeWhatsAppNumber(order.customerPhone);
      const text = encodeURIComponent(
        [
          `Hello ${order.customerName ?? ""}`,
          "",
          `Regarding your order ${order.humanReadableOrderNumber}`,
          "",
          "We are confirming your payment / delivery. Thank you!",
        ].join("\n"),
      );
      customerWa = `https://wa.me/${digits}?text=${text}`;
    } catch {
      customerWa = null;
    }
  }

  const hasProof = proofsWithUrl.length > 0;
  const fulfillmentLabel = fulfillmentStatusLabel(
    {
      activated: order.fulfillmentActivated,
      emailSent: order.fulfillmentEmailSent,
      whatsappDelivered: order.fulfillmentWhatsappDelivered,
      notes: order.fulfillmentNotes,
      deliveredAt: order.fulfillmentDeliveredAt?.toISOString() ?? null,
    },
    String(order.paymentStatus),
    String(order.orderStatus),
  );

  return (
    <>
      <AdminHeader
        title={order.humanReadableOrderNumber}
        description="Full customer details, products ordered, payment screenshot, and fulfillment checklist."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/admin/orders" variant="secondary" size="sm">
              All orders
            </Button>
            <Button href="/admin/payments/review" size="sm">
              Payment queue
            </Button>
            {customerWa ? (
              <Button href={customerWa} external variant="whatsapp" size="sm">
                WhatsApp customer
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <StatusPill
          label={`Order: ${order.orderStatus}`}
          variant={
            order.orderStatus === "PAID" || order.orderStatus === "COMPLETED"
              ? "success"
              : order.orderStatus === "PROCESSING"
                ? "warning"
                : "default"
          }
        />
        <StatusPill
          label={`Payment: ${order.paymentStatus}`}
          variant={order.paymentStatus === "PAID" ? "success" : "warning"}
        />
        <StatusPill
          label={`Fulfillment: ${fulfillmentLabel}`}
          variant={order.fulfillmentWhatsappDelivered ? "success" : "warning"}
        />
        {hasProof ? (
          <StatusPill label="Screenshot uploaded" variant="success" />
        ) : (
          <StatusPill label="No screenshot yet" variant="danger" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Customer details
          </h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Name</dt>
              <dd className="font-medium">{order.customerName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Email</dt>
              <dd>
                <a
                  className="text-[var(--primary)] hover:underline"
                  href={`mailto:${order.customerEmail}`}
                >
                  {order.customerEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Phone</dt>
              <dd className="font-medium">{order.customerPhone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Order placed</dt>
              <dd>
                {new Date(
                  order.placedAt ?? order.createdAt,
                ).toLocaleString("en-NP")}
              </dd>
            </div>
            {order.orderNotes ? (
              <div>
                <dt className="text-xs text-[var(--text-muted)]">
                  Customer notes
                </dt>
                <dd>{order.orderNotes}</dd>
              </div>
            ) : null}
          </dl>
          <p className="pt-2 text-lg font-semibold">
            Total {formatNpr(order.grandTotalMinor)}
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Products ordered
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No line items.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-[var(--border)]/70 bg-[var(--page-soft)] px-3 py-3"
                >
                  <div className="flex justify-between gap-3">
                    <span className="font-medium text-[var(--text)]">
                      {item.productName}
                    </span>
                    <span className="shrink-0 font-semibold">
                      {formatNpr(item.totalMinor)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {item.variantName} · SKU {item.sku} · Qty {item.quantity} ·
                    Unit {formatNpr(item.unitPriceMinor)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <FulfillmentChecklistForm
        orderId={order.id}
        initial={{
          activated: order.fulfillmentActivated,
          emailSent: order.fulfillmentEmailSent,
          whatsappDelivered: order.fulfillmentWhatsappDelivered,
          notes: order.fulfillmentNotes,
          deliveredAt: order.fulfillmentDeliveredAt?.toISOString() ?? null,
        }}
      />

      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--text)]">
          Payment screenshot (verify here)
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          When the customer uploads proof, the order moves to PROCESSING.
          Approve payment after you confirm the screenshot, then deliver via
          WhatsApp.
        </p>
        {proofsWithUrl.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            No payment proof uploaded yet.
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {proofsWithUrl.map((p) => (
              <div
                key={p.id}
                className="grid gap-4 border-t border-[var(--border)] pt-4 lg:grid-cols-[280px_1fr]"
              >
                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--page-soft)]">
                  {p.viewUrl ? (
                    <a href={p.viewUrl} target="_blank" rel="noopener noreferrer">
                      {/* Signed proof URLs are temporary and cannot be safely fetched by the image optimizer. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.viewUrl}
                        alt="Payment screenshot"
                        className="max-h-[420px] w-full object-contain bg-white"
                      />
                    </a>
                  ) : (
                    <div className="flex h-48 items-center justify-center text-xs text-[var(--text-muted)]">
                      Cannot load screenshot (check storage / signed URL)
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <StatusPill
                    label={String(p.status)}
                    variant={
                      p.status === "VERIFIED"
                        ? "success"
                        : p.status === "REJECTED"
                          ? "danger"
                          : "warning"
                    }
                  />
                  {p.duplicates.hasWarning ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]"
                    >
                      <strong>Duplicate warning:</strong>{" "}
                      {p.duplicates.duplicateReference.length
                        ? `Same payer reference used on ${p.duplicates.duplicateReference.length} other submission(s). `
                        : ""}
                      {p.duplicates.duplicateProof.length
                        ? `Same screenshot hash on ${p.duplicates.duplicateProof.length} other submission(s).`
                        : ""}
                    </div>
                  ) : null}
                  <p>
                    <strong>{p.senderName}</strong> ·{" "}
                    {String(p.method).replace(/_/g, " ")}
                  </p>
                  <p>
                    Amount {formatNpr(p.amountMinor)} · Ref{" "}
                    <span className="font-mono">{p.senderReference}</span>
                  </p>
                  {p.proofContentHash ? (
                    <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">
                      Proof hash {p.proofContentHash.slice(0, 16)}…
                    </p>
                  ) : null}
                  <p className="text-xs text-[var(--text-muted)]">
                    Uploaded {new Date(p.createdAt).toLocaleString("en-NP")}
                  </p>
                  {p.rejectionReason ? (
                    <p className="text-[var(--danger)]">
                      Rejected: {p.rejectionReason}
                    </p>
                  ) : null}
                  {["SUBMITTED", "UNDER_REVIEW"].includes(String(p.status)) ? (
                    <PaymentReviewActions
                      paymentId={p.id}
                      orderHref={`/admin/orders/${order.id}`}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
