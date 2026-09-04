"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ComplianceDisclaimer } from "@/components/storefront/compliance-disclaimer";
import { formatNpr } from "@/lib/money";
import type { DemoCatalogItem } from "@/lib/catalog/demo-catalog";
import { readCart, type CartLine } from "@/components/storefront/cart-view";
import { PriceInquiryNotice } from "@/components/storefront/price-inquiry-notice";
import { PaymentQrCard } from "@/components/storefront/payment-qr-card";
import { STOREFRONT_PAYMENT_HINTS } from "@/lib/payments/storefront-payment";
import { saveGuestOrder } from "@/lib/storefront/guest-orders";

type PaymentMethod = "ESEWA_MANUAL" | "KHALTI_MANUAL" | "BANK_TRANSFER";

const fieldClass =
  "mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]";

interface CheckoutFormProps {
  catalog: DemoCatalogItem[];
  qrSrc?: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function CheckoutForm({ catalog, qrSrc }: CheckoutFormProps) {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("Processing payment…");
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("BANK_TRANSFER");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [whatsAppUpdatesConsent, setWhatsAppUpdatesConsent] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");
  const [payerName, setPayerName] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setLines(readCart());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!submitting) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [submitting]);

  const catalogMap = useMemo(
    () => new Map(catalog.map((p) => [p.slug, p])),
    [catalog],
  );

  const resolved = lines
    .map((line) => {
      const product = catalogMap.get(line.productSlug);
      if (!product) return null;
      return { line, product };
    })
    .filter(Boolean) as { line: CartLine; product: DemoCatalogItem }[];

  const estimatedTotal = resolved.reduce(
    (sum, { line, product }) => sum + (product.priceNprMinor ?? 0) * line.quantity,
    0,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError("You must accept the terms to place an order.");
      return;
    }
    if (resolved.length === 0) {
      setError("Your cart is empty. Add products before checkout.");
      return;
    }
    if (!proofFile || proofFile.size <= 0) {
      setError("Upload your payment screenshot before placing the order.");
      return;
    }
    if (!payerName.trim() || !paymentReference.trim()) {
      setError(
        "Enter the name on the payment and the transaction / reference ID.",
      );
      return;
    }

    setSubmitting(true);
    setProcessingLabel("Processing payment…");
    // eslint-disable-next-line react-hooks/purity -- timing inside async submit handler
    const started = Date.now();

    try {
      setProcessingLabel("Creating your order…");
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
          customerNotes,
          marketingConsent,
          whatsAppUpdatesConsent,
          lines: resolved.map(({ line, product }) => ({
            productSlug: line.productSlug,
            variantSku: line.variantSku || product.variantSku,
            quantity: line.quantity,
          })),
        }),
      });

      let data: {
        ok?: boolean;
        error?: string;
        orderNumber?: string;
        totalNprMinor?: number;
        paymentMethod?: string;
        secureToken?: string | null;
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setError(
          res.ok
            ? "Checkout response was invalid. Please try again."
            : `Checkout failed (${res.status}). Please try again or message WhatsApp.`,
        );
        setSubmitting(false);
        return;
      }

      if (!res.ok || !data.ok || !data.orderNumber) {
        setError(data.error ?? "Checkout failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const orderNumber = data.orderNumber;
      const totalMinor = data.totalNprMinor ?? estimatedTotal;

      setProcessingLabel("Uploading payment screenshot…");
      const proofData = new FormData();
      proofData.set("orderNumber", orderNumber);
      proofData.set("senderName", payerName.trim());
      proofData.set("senderReference", paymentReference.trim());
      proofData.set("amountMinor", String(totalMinor));
      proofData.set("paymentMethod", data.paymentMethod ?? paymentMethod);
      proofData.set("proof", proofFile);

      const proofRes = await fetch("/api/payment-proof", {
        method: "POST",
        body: proofData,
      });
      let proofJson: { ok?: boolean; error?: string } = {};
      try {
        proofJson = (await proofRes.json()) as typeof proofJson;
      } catch {
        proofJson = {
          ok: false,
          error:
            "Order placed, but screenshot upload failed. Upload again on the next page.",
        };
      }

      const proofOk = Boolean(proofRes.ok && proofJson.ok);

      saveGuestOrder({
        orderNumber,
        secureToken: data.secureToken ?? null,
        totalNprMinor: totalMinor,
        paymentMethod: data.paymentMethod ?? paymentMethod,
        placedAt: new Date().toISOString(),
        paymentStatus: proofOk ? "UNDER_REVIEW" : "UNPAID",
        orderStatus: proofOk ? "PROCESSING" : "AWAITING_PAYMENT",
        proofUploaded: proofOk,
        itemsSummary: resolved
          .map(({ line, product }) => `${product.name} × ${line.quantity}`)
          .join(", "),
      });

      localStorage.removeItem("trihex_cart");

      setProcessingLabel("Completing your order…");
      // eslint-disable-next-line react-hooks/purity -- elapsed timing inside async submit handler
      const elapsed = Date.now() - started;
      if (elapsed < 2500) await sleep(2500 - elapsed);

      const params = new URLSearchParams({
        orderNumber,
        paymentMethod: data.paymentMethod ?? paymentMethod,
        total: String(totalMinor),
      });
      if (resolved.length > 0 && resolved[0]?.product?.name) {
        const pName = resolved[0].product.name;
        params.set("product", resolved.length > 1 ? `${pName} (+${resolved.length - 1} more)` : pName);
      }
      if (data.secureToken) params.set("token", data.secureToken);
      if (proofOk) {
        params.set("proof", "1");
      } else {
        params.set("proof", "0");
        if (proofJson.error) params.set("proofError", proofJson.error);
      }
      router.replace(`/checkout/success?${params.toString()}`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Network error. Check your connection.";
      setError(
        `${msg} If this keeps happening, message WhatsApp with your cart details.`,
      );
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <p className="text-sm text-[var(--text-muted)]">Loading checkout…</p>
    );
  }

  const methodHints =
    paymentMethod === "ESEWA_MANUAL"
      ? STOREFRONT_PAYMENT_HINTS.esewa
      : paymentMethod === "KHALTI_MANUAL"
        ? STOREFRONT_PAYMENT_HINTS.khalti
        : STOREFRONT_PAYMENT_HINTS.bank;

  return (
    <>
      {submitting ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.55)] p-4 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-busy="true"
          aria-label="Processing payment"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white px-6 py-8 text-center shadow-2xl">
            <div
              className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary-soft)] border-t-[var(--primary)]"
              aria-hidden
            />
            <p className="mt-5 font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)]">
              {processingLabel}
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Please wait — do not close this page. Your order completes in a few
              seconds.
            </p>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-5">
          <div
            role="alert"
            className="rounded-2xl border-2 border-[var(--warning)]/40 bg-[var(--warning-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--text)]"
          >
            <p className="font-semibold text-[var(--text)]">Before you pay</p>
            <p className="mt-1 text-[var(--text-secondary)]">
              Prices can be lower or higher at times depending on availability
              and supply. Please inquire about the product before proceeding to
              buy.
            </p>
          </div>

          <fieldset className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)]">
            <legend className="px-1 font-[family-name:var(--font-sora)] text-sm font-semibold text-[var(--text)]">
              Contact details
            </legend>
            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">Full name</span>
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">Email</span>
              <input
                required
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">Nepali mobile</span>
              <input
                required
                inputMode="tel"
                placeholder="98XXXXXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={fieldClass}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)]">
            <legend className="px-1 font-[family-name:var(--font-sora)] text-sm font-semibold text-[var(--text)]">
              1) Pay with the same QR
            </legend>
            <p className="text-xs text-[var(--text-muted)]">
              Use <strong>Bank app, eSewa, or Khalti</strong> — scan the{" "}
              <strong>same TRIHEX QR</strong> below, pay the exact amount, then
              upload your screenshot.
            </p>
            {(
              [
                ["BANK_TRANSFER", "Bank app (same QR)"],
                ["ESEWA_MANUAL", "eSewa (same QR)"],
                ["KHALTI_MANUAL", "Khalti (same QR)"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-3 text-sm text-[var(--text)] has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--primary-soft)]"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={value}
                  checked={paymentMethod === value}
                  onChange={() => setPaymentMethod(value)}
                />
                {label}
              </label>
            ))}

            <ul className="mt-1 list-disc space-y-1 rounded-xl bg-[var(--page-soft)] px-4 py-3 pl-8 text-xs text-[var(--text-secondary)]">
              {methodHints.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <div className="mt-2">
              <PaymentQrCard amountMinor={estimatedTotal} qrSrc={qrSrc} />
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-2xl border-2 border-[var(--primary)]/25 bg-white p-5 shadow-[0_8px_24px_var(--shadow)]">
            <legend className="px-1 font-[family-name:var(--font-sora)] text-sm font-semibold text-[var(--text)]">
              2) Upload payment screenshot
            </legend>
            <p className="text-xs text-[var(--text-muted)]">
              Required after you pay. We manually verify, then deliver via
              WhatsApp.
            </p>
            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">Name on the payment</span>
              <input
                required
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className={fieldClass}
                placeholder="Same name as sender"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">
                Transaction / reference ID
              </span>
              <input
                required
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className={fieldClass}
                placeholder="Bank / eSewa / Khalti reference"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">Payment screenshot</span>
              <input
                required
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className={fieldClass}
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {proofFile ? (
              <p className="text-xs text-[var(--success)]">
                Selected: {proofFile.name}
              </p>
            ) : null}
          </fieldset>

          <label className="block text-sm">
            <span className="text-[var(--text-muted)]">
              Order notes (optional)
            </span>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={3}
              className={fieldClass}
            />
          </label>

          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5 text-sm shadow-[0_8px_24px_var(--shadow)]">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <span className="text-[var(--text-muted)]">
                I agree to the{" "}
                <a href="/terms" className="text-[var(--primary)] hover:underline">
                  terms
                </a>
                ,{" "}
                <a
                  href="/refund-policy"
                  className="text-[var(--primary)] hover:underline"
                >
                  refund policy
                </a>
                , and{" "}
                <a
                  href="/privacy"
                  className="text-[var(--primary)] hover:underline"
                >
                  privacy policy
                </a>
                .
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-1"
              />
              <span className="text-[var(--text-muted)]">
                Send occasional product updates by email (optional).
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={whatsAppUpdatesConsent}
                onChange={(e) => setWhatsAppUpdatesConsent(e.target.checked)}
                className="mt-1"
              />
              <span className="text-[var(--text-muted)]">
                I consent to order-status messages on WhatsApp (optional).
              </span>
            </label>
          </div>

          {error ? (
            <p className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </p>
          ) : null}
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)] lg:sticky lg:top-24">
          <h2 className="font-[family-name:var(--font-sora)] font-semibold text-[var(--text)]">
            Order summary
          </h2>
          {resolved.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No items in cart.</p>
          ) : (
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {resolved.map(({ line, product }) => (
                <li key={line.productSlug} className="flex justify-between gap-3">
                  <span>
                    {product.name} × {line.quantity}
                  </span>
                  <span className="font-medium text-[var(--text)]">
                    {product.priceNprMinor != null
                      ? formatNpr(product.priceNprMinor * line.quantity)
                      : "On enquiry"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="text-sm text-[var(--text-muted)]">Total to pay</span>
            <span className="font-[family-name:var(--font-sora)] text-xl font-semibold text-[var(--text)]">
              {formatNpr(estimatedTotal)}
            </span>
          </div>
          <PriceInquiryNotice compact />
          <p className="text-xs text-[var(--text-muted)]">
            Pay with Bank / eSewa / Khalti (same QR) → upload screenshot → place
            order. Saved on this device for tracking even without login.
          </p>
          <Button
            type="submit"
            disabled={submitting || resolved.length === 0}
            className="w-full"
          >
            {submitting ? "Processing…" : "Place order with payment proof"}
          </Button>
          <ComplianceDisclaimer compact />
        </aside>
      </form>
    </>
  );
}
