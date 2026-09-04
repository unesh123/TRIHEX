import { notFound } from "next/navigation";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";
import { formatNpr } from "@/lib/money";
import {
  getOrderBySecureToken,
  getPublicOrderTimeline,
} from "@/lib/checkout/order-store";
import { orderSupportUrl } from "@/lib/whatsapp";

import {
  resolveSecretIdForSku,
  getDeliverableBySecretId,
  createSignedDeliveryToken,
} from "@/lib/fulfillment/secrets-store";
import { Download, Lock, ShieldCheck, ExternalLink, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

interface SecureOrderPageProps {
  params: Promise<{ secureToken: string }>;
}

export default async function SecureOrderPage({ params }: SecureOrderPageProps) {
  const { secureToken } = await params;
  const order = await getOrderBySecureToken(secureToken);
  if (!order) notFound();

  const timeline = getPublicOrderTimeline(order);
  const supportUrl = orderSupportUrl({
    orderNumber: order.orderNumber,
    publicStatus: order.status,
  });

  const isPaid =
    order.status === "PAID" ||
    order.status === "COMPLETED" ||
    order.paymentStatus === "PAID" ||
    order.paymentStatus === "VERIFIED";

  const vaultLines = (order.lines ?? [])
    .map((l) => {
      const secretId = resolveSecretIdForSku(l.productName + " " + l.variantSku);
      if (!secretId) return null;
      const deliverable = getDeliverableBySecretId(secretId);
      if (!deliverable) return null;
      const signedToken = isPaid
        ? createSignedDeliveryToken({
            orderId: order.id,
            orderNumber: order.orderNumber,
            sku: l.variantSku,
            secretId,
            expiresInHours: 72,
          })
        : null;
      return {
        line: l,
        deliverable,
        signedToken,
      };
    })
    .filter(Boolean);

  return (
    <StorefrontPageShell
      title={`Order ${order.orderNumber}`}
      description="Public order timeline. Sensitive payment proofs are not shown here."
    >
      {isPaid && vaultLines.length > 0 && (
        <div className="mb-8 max-w-lg rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-emerald-950 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-black text-emerald-900">
              Verified & Unlocked Deliverables
            </h3>
          </div>
          <p className="mt-1 text-xs text-emerald-800">
            Payment verified! Your order-scoped, cryptographically signed fulfillment access is ready:
          </p>
          <div className="mt-4 space-y-3">
            {vaultLines.map((item) => {
              if (!item) return null;
              const { line, deliverable, signedToken } = item;
              const accessHref = signedToken
                ? `/api/fulfillment/access?token=${encodeURIComponent(signedToken)}`
                : "#";
              return (
                <div
                  key={line.variantSku}
                  className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {deliverable.title}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-800">
                      <ShieldCheck className="h-3 w-3" />
                      Authorized
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    {deliverable.accessInstructions}
                  </p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <a
                      href={accessHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Access Vault Package
                    </a>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
                      <Clock className="h-3 w-3 text-emerald-600" />
                      Link expires in 72 hours
                    </span>
                  </div>

                  {deliverable.licenseCode && (
                    <div className="mt-2.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 font-mono">
                      <span>Access Passcode: </span>
                      <strong className="select-all text-slate-900">{deliverable.licenseCode}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isPaid && vaultLines.length > 0 && (
        <div className="mb-8 max-w-lg rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Lock className="h-4 w-4 text-amber-700" />
            <span>Encrypted Vault Drop Pending Payment Verification</span>
          </div>
          <p className="mt-1 text-xs text-amber-800">
            This order contains digital vault packages. Once your payment receipt is verified by our team, your secure expiring access tokens will unlock right here.
          </p>
        </div>
      )}
      <dl className="mb-8 grid max-w-lg gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Status</dt>
          <dd className="text-text">{order.status}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Payment</dt>
          <dd className="text-text">{order.paymentStatus}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Total</dt>
          <dd className="text-text">{formatNpr(order.totalNprMinor)}</dd>
        </div>
      </dl>

      <ol className="max-w-lg space-y-4 border-l-2 border-primary/30 pl-4">
        {timeline.map((event) => (
          <li key={`${event.at}-${event.status}`}>
            <p className="font-medium text-text">{event.status}</p>
            <p className="text-sm text-text-muted">{event.message}</p>
          </li>
        ))}
      </ol>

      <Button href={supportUrl} external variant="whatsapp" className="mt-8">
        WhatsApp order support
      </Button>
    </StorefrontPageShell>
  );
}
