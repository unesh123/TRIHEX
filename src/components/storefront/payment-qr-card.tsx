import { formatNpr } from "@/lib/money";
import {
  STOREFRONT_BANK_QR_PATH,
  STOREFRONT_PAYEE_NAME,
} from "@/lib/payments/storefront-payment";

/** Card-style scan-to-pay panel (QR + amount + steps). */
export function PaymentQrCard({
  amountMinor,
  orderNumber,
  compact = false,
  qrSrc,
}: {
  amountMinor: number;
  orderNumber?: string | null;
  compact?: boolean;
  /** Resolved from admin upload when available */
  qrSrc?: string | null;
}) {
  const src = qrSrc?.trim() || STOREFRONT_BANK_QR_PATH;
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_12px_32px_var(--shadow)]">
      <div className="bg-[linear-gradient(135deg,#0f3d6e_0%,#0d9488_100%)] px-4 py-3 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
          Scan to pay — Bank · eSewa · Khalti
        </p>
        <p className="font-[family-name:var(--font-sora)] text-lg font-semibold">
          {STOREFRONT_PAYEE_NAME}
        </p>
        {amountMinor > 0 ? (
          <p className="mt-1 text-sm text-white/90">
            Amount:{" "}
            <span className="text-xl font-semibold text-white">
              {formatNpr(amountMinor)}
            </span>
          </p>
        ) : null}
      </div>

      <div className={compact ? "p-3" : "p-4 sm:p-5"}>
        <div className="mx-auto max-w-[240px] rounded-xl border border-[var(--border)] bg-white p-3 sm:max-w-[280px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="TRIHEX DIGITAL payment QR — scan with Bank, eSewa, or Khalti"
            width={900}
            height={900}
            className="h-auto w-full object-contain"
          />
        </div>

        <p className="mt-3 text-center text-xs font-medium text-[var(--text)]">
          One QR for Bank apps, eSewa, and Khalti
        </p>

        {orderNumber ? (
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            Remarks: <strong className="text-[var(--text)]">{orderNumber}</strong>
          </p>
        ) : (
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            After placing the order, put your order number in payment remarks.
          </p>
        )}

        <ol className="mt-4 grid gap-2 text-xs text-[var(--text-secondary)] sm:grid-cols-3">
          {[
            { n: "1", t: "Scan QR" },
            { n: "2", t: "Pay exact NPR" },
            { n: "3", t: "Upload + WhatsApp" },
          ].map((s) => (
            <li
              key={s.n}
              className="flex items-center gap-2 rounded-lg bg-[var(--page-soft)] px-3 py-2 font-medium"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-white">
                {s.n}
              </span>
              {s.t}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
