"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNpr } from "@/lib/money";
import { STOREFRONT_PAYEE_NAME } from "@/lib/payments/storefront-payment";
import { PaymentQrCard } from "@/components/storefront/payment-qr-card";

function paymentCopy(method: string, orderNumber: string) {
  const m = method.toUpperCase();
  if (m.includes("ESEWA")) {
    return {
      title: "Pay with eSewa",
      steps: [
        `Send exact amount to ${STOREFRONT_PAYEE_NAME} on eSewa`,
        `Remarks / note: ${orderNumber}`,
        "Upload proof here, then message WhatsApp with the screenshot",
      ],
      showQr: false,
      refPlaceholder: "eSewa transaction ID",
    };
  }
  if (m.includes("KHALTI")) {
    return {
      title: "Pay with Khalti",
      steps: [
        `Send exact amount to ${STOREFRONT_PAYEE_NAME} on Khalti`,
        `Remarks / note: ${orderNumber}`,
        "Upload proof here, then message WhatsApp with the screenshot",
      ],
      showQr: false,
      refPlaceholder: "Khalti transaction ID",
    };
  }
  return {
    title: "Pay with bank QR",
    steps: [
      "Scan the QR and pay the exact amount below",
      `Remarks: ${orderNumber}`,
      "Upload proof here, then send the same screenshot on WhatsApp for verification",
    ],
    showQr: true,
    refPlaceholder: "Bank / wallet reference",
  };
}

export function PaymentProofUploader({
  orderNumber,
  amountMinor,
  paymentMethod,
  whatsappUrl,
  statusInquiryUrl,
  qrSrc,
}: {
  orderNumber: string;
  amountMinor: number;
  paymentMethod: string;
  whatsappUrl: string | null;
  statusInquiryUrl?: string | null;
  qrSrc?: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const copy = paymentCopy(paymentMethod, orderNumber);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("orderNumber", orderNumber);
    data.set("amountMinor", String(amountMinor));
    data.set("paymentMethod", paymentMethod);
    setStatus("uploading");
    setMessage("");
    try {
      const res = await fetch("/api/payment-proof", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(
          json.error ??
            "Upload failed. Please message WhatsApp and send your payment screenshot there.",
        );
        return;
      }
      setStatus("ok");
      setMessage(
        "Order complete on your side. Screenshot received — message WhatsApp so we can verify and deliver your package.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage(
        "Network error. Message WhatsApp and send your payment screenshot for verification.",
      );
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)]">
      <div>
        <h2 className="font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)]">
          {copy.title}
        </h2>
        <div className="mt-3 rounded-xl border border-[var(--primary)]/20 bg-[var(--page-soft)] px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Amount due
          </p>
          <p className="font-[family-name:var(--font-sora)] text-2xl font-semibold text-[var(--text)]">
            {formatNpr(amountMinor)}
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Order <strong>{orderNumber}</strong> · Payee{" "}
            <strong>{STOREFRONT_PAYEE_NAME}</strong>
          </p>
        </div>
      </div>

      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-[var(--text-secondary)]">
        {copy.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      {copy.showQr ? (
        <PaymentQrCard
          amountMinor={amountMinor}
          orderNumber={orderNumber}
          compact
          qrSrc={qrSrc}
        />
      ) : (
        <p className="rounded-xl bg-[var(--page-soft)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          Prefer bank QR? Place a new order with “Bank transfer / QR”, or pay via
          wallet then upload proof here.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-3" encType="multipart/form-data">
        <label className="block text-xs text-[var(--text-muted)]">
          Your name on the payment
          <Input name="senderName" required className="mt-1" placeholder="Full name" />
        </label>
        <label className="block text-xs text-[var(--text-muted)]">
          Transaction / reference ID
          <Input
            name="senderReference"
            required
            className="mt-1"
            placeholder={copy.refPlaceholder}
          />
        </label>
        <label className="block text-xs text-[var(--text-muted)]">
          Payment screenshot
          <Input
            name="proof"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
            className="mt-1"
          />
        </label>
        <Button type="submit" disabled={status === "uploading"} className="w-full">
          {status === "uploading" ? "Uploading…" : "Upload payment proof"}
        </Button>
        {message ? (
          <p
            className={
              status === "ok"
                ? "text-sm font-medium text-[var(--success)]"
                : "text-sm text-[var(--danger)]"
            }
          >
            {message}
          </p>
        ) : null}
      </form>

      {whatsappUrl ? (
        <div
          className={
            status === "ok"
              ? "space-y-2 rounded-2xl border-2 border-[var(--success)]/40 bg-[var(--success-soft)] p-4"
              : "space-y-2 rounded-2xl border border-[#25D366]/40 bg-[#25D366]/10 p-4"
          }
        >
          <p className="text-sm font-semibold text-[var(--text)]">
            {status === "ok"
              ? "Payment done? Message WhatsApp for verification"
              : "After you pay — message WhatsApp for verification"}
          </p>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            Open WhatsApp, send the pre-filled message, then attach your payment
            screenshot in the same chat so we can verify quickly.
          </p>
          <Button href={whatsappUrl} external variant="whatsapp" className="w-full">
            {status === "ok"
              ? "Send screenshot on WhatsApp for verification"
              : "Message WhatsApp for payment verification"}
          </Button>
          {statusInquiryUrl ? (
            <Button
              href={statusInquiryUrl}
              external
              variant="outline"
              className="w-full"
            >
              Inquire about payment / order status
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
