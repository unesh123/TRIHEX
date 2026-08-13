import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";
import { PaymentProofUploader } from "@/components/storefront/payment-proof-uploader";
import {
  orderVerificationUrl,
  paymentStatusInquiryUrl,
} from "@/lib/whatsapp";
import { formatNpr } from "@/lib/money";
import { resolveStorefrontBankQrPath } from "@/lib/payments/resolve-bank-qr";

export const dynamic = "force-dynamic";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    paymentMethod?: string;
    total?: string;
    token?: string;
    proof?: string;
    proofError?: string;
  }>;
}

function methodLabel(method: string) {
  const m = method.toUpperCase();
  if (m.includes("ESEWA")) return "eSewa";
  if (m.includes("KHALTI")) return "Khalti";
  return "Bank transfer / QR";
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const qrSrc = await resolveStorefrontBankQrPath();
  const orderNumber = params.orderNumber?.trim();
  const paymentMethod = params.paymentMethod ?? "BANK_TRANSFER";
  const totalMinor = Number(params.total ?? 0);
  const amountWhole = Math.round(totalMinor / 100);
  const proofUploaded = params.proof === "1";

  const waVerifyUrl =
    orderNumber && amountWhole > 0
      ? orderVerificationUrl({
          orderNumber,
          amountNprWhole: amountWhole,
          paymentMethod,
        })
      : null;

  const waStatusUrl = orderNumber
    ? paymentStatusInquiryUrl({
        orderNumber,
        amountNprWhole: amountWhole > 0 ? amountWhole : undefined,
      })
    : null;

  return (
    <StorefrontPageShell
      title={proofUploaded ? "Order placed — payment proof received" : "Complete your payment"}
      description={
        orderNumber
          ? proofUploaded
            ? `Order ${orderNumber} is processing. Message WhatsApp so we can verify your screenshot and deliver.`
            : `Order ${orderNumber} is reserved. Pay via ${methodLabel(paymentMethod)}, upload your screenshot, then message WhatsApp.`
          : "Your order was submitted."
      }
    >
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[0_8px_24px_var(--shadow)]">
          {orderNumber ? (
            <p className="font-mono text-lg text-[var(--primary)]">{orderNumber}</p>
          ) : null}
          {totalMinor > 0 ? (
            <p className="text-[var(--text)]">
              Amount:{" "}
              <span className="font-[family-name:var(--font-sora)] text-2xl font-semibold">
                {formatNpr(totalMinor)}
              </span>
            </p>
          ) : null}

          {proofUploaded ? (
            <div className="rounded-2xl border border-[var(--success)]/35 bg-[var(--success-soft)] p-4 text-sm">
              <p className="font-semibold text-[var(--text)]">
                Payment screenshot uploaded
              </p>
              <p className="mt-1 text-[var(--text-secondary)]">
                Your order is in processing. Next: message WhatsApp and confirm
                verification so we can deliver the package.
              </p>
            </div>
          ) : (
            <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
              <li>Pay the exact amount with {methodLabel(paymentMethod)}.</li>
              <li>Upload your payment screenshot on this page.</li>
              <li>Message WhatsApp for payment verification.</li>
            </ol>
          )}

          {params.proofError ? (
            <p className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--text)]">
              {params.proofError}
            </p>
          ) : null}

          {waVerifyUrl ? (
            <div className="rounded-2xl border border-[#25D366]/35 bg-[#25D366]/10 p-4">
              <p className="text-sm font-semibold text-[var(--text)]">
                Message WhatsApp for verification
              </p>
              <Button href={waVerifyUrl} external variant="whatsapp" className="mt-3 w-full">
                Open WhatsApp
              </Button>
            </div>
          ) : null}

          {waStatusUrl ? (
            <Button href={waStatusUrl} external variant="outline" className="w-full">
              Inquire about payment / order status
            </Button>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {params.token ? (
              <Button href={`/orders/${params.token}`} variant="secondary">
                View order timeline
              </Button>
            ) : null}
            <Button href="/track-order" variant="outline">
              Track order
            </Button>
          </div>
        </div>

        {orderNumber && !proofUploaded ? (
          <PaymentProofUploader
            orderNumber={orderNumber}
            amountMinor={totalMinor}
            paymentMethod={paymentMethod}
            whatsappUrl={waVerifyUrl}
            statusInquiryUrl={waStatusUrl}
            qrSrc={qrSrc}
          />
        ) : orderNumber && proofUploaded ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--text-secondary)] shadow-[0_8px_24px_var(--shadow)]">
            <h2 className="font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)]">
              What happens next
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>We review your payment screenshot in admin.</li>
              <li>After approval, payment is marked PAID.</li>
              <li>We deliver your package for this order via WhatsApp.</li>
            </ol>
            {waStatusUrl ? (
              <Button
                href={waStatusUrl}
                external
                variant="whatsapp"
                className="mt-5 w-full"
              >
                Ask about payment status on WhatsApp
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </StorefrontPageShell>
  );
}
