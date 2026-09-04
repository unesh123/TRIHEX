import { notFound } from "next/navigation";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";
import { formatNpr } from "@/lib/money";
import {
  getOrderBySecureToken,
  getPublicOrderTimeline,
} from "@/lib/checkout/order-store";
import { orderSupportUrl } from "@/lib/whatsapp";

import { KeyRound, Lock, ShieldCheck } from "lucide-react";

function getVaultDeliverable(name: string, sku: string) {
  const norm = (name + " " + sku).toLowerCase();
  if (norm.includes("money") || norm.includes("aimoney")) {
    return {
      title: "AI Money Maker Course (2026)",
      key: "lJnuvVmB-NyzaBorvApWJQ",
      deliverable: "Mega Encrypted Cloud Repository",
    };
  }
  if (norm.includes("psychology") || norm.includes("closing") || norm.includes("psych-close")) {
    return {
      title: "The Psychology of Closing Bundle",
      key: "PSYCH-CLOSE-TRIHEX-2026",
      deliverable: "Digital Video & PDF Master Vault",
    };
  }
  if (norm.includes("passive") || norm.includes("rebel") || norm.includes("antisocial")) {
    return {
      title: "The Passive Rebel (Antisocial Leads)",
      key: "PASSIVE-REBEL-TRIHEX-VIP",
      deliverable: "Covert Traffic Blueprint & SOPs",
    };
  }
  if (norm.includes("udemy") || norm.includes("16-developer") || norm.includes("16pack")) {
    return {
      title: "Udemy 16 Package AI Agent Pack",
      key: "UDEMY-AI-16PACK-DISPATCH",
      deliverable: "16 Video Masterclasses Archive",
    };
  }
  return null;
}

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
    order.paymentStatus === "PAID";

  const vaultLines = (order.lines ?? [])
    .map((l) => ({
      line: l,
      vault: getVaultDeliverable(l.productName, l.variantSku),
    }))
    .filter(
      (
        x,
      ): x is {
        line: (typeof order.lines)[number];
        vault: NonNullable<ReturnType<typeof getVaultDeliverable>>;
      } => Boolean(x.vault),
    );

  return (
    <StorefrontPageShell
      title={`Order ${order.orderNumber}`}
      description="Public order timeline. Sensitive payment proofs are not shown here."
    >
      {isPaid && vaultLines.length > 0 && (
        <div className="mb-8 max-w-lg rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-emerald-950 shadow-sm">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-black text-emerald-900">
              Unlocked Vault Deliverables
            </h3>
          </div>
          <p className="mt-1 text-xs text-emerald-800">
            Payment verified! Here are your master unlock keys and package deliverables:
          </p>
          <div className="mt-4 space-y-3">
            {vaultLines.map(({ line, vault }) => (
              <div
                key={line.variantSku}
                className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {vault.title}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-800">
                    <ShieldCheck className="h-3 w-3" />
                    Unlocked
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Decryption Key:
                  </span>
                  <code className="rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 font-mono text-xs font-black text-emerald-950 select-all">
                    {vault.key}
                  </code>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  Deliverable: {vault.deliverable}
                </div>
              </div>
            ))}
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
            This order contains encrypted digital vault packages. Once your payment receipt is verified by our team, your master decryption keys will unlock right here.
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
