import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { PaymentQrUploader } from "@/components/admin/payment-qr-uploader";
import { resolveStorefrontBankQrPath } from "@/lib/payments/resolve-bank-qr";
import { STOREFRONT_BANK_QR_PATH } from "@/lib/payments/storefront-payment";
import { isProductMediaStorageConfigured } from "@/lib/storage/adapter";

export const dynamic = "force-dynamic";

export default async function PaymentMethodsPage() {
  const current = await resolveStorefrontBankQrPath();
  const usingUpload = current !== STOREFRONT_BANK_QR_PATH;
  const storageOk = isProductMediaStorageConfigured();

  return (
    <>
      <AdminHeader
        title="Payment methods"
        description="Manage the shared Bank / eSewa / Khalti QR shown at checkout. Cropped QR only — never raw chat screenshots."
      />

      <div className="space-y-6">
        <section className="rounded-xl border border-warning/40 bg-warning/5 p-5">
          <Badge variant="warning" className="mb-3">
            Security policy
          </Badge>
          <ul className="list-inside list-disc space-y-2 text-sm text-text-muted">
            <li>
              Do <strong className="text-text">not</strong> upload raw bank
              screenshots from WhatsApp or chat apps.
            </li>
            <li>Crop to the QR code only on an approved TRIHEX background.</li>
            <li>Prefer square PNG/WebP, minimum 256×256.</li>
            <li>Replacing the QR is audited. Privileged role required.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-surface/60 p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-text">Active checkout QR</h2>
            <Badge variant={usingUpload ? "success" : "default"}>
              {usingUpload ? "Admin upload" : "Static fallback"}
            </Badge>
            <Badge variant={storageOk ? "success" : "warning"}>
              {storageOk ? "Storage ready" : "Storage not configured"}
            </Badge>
          </div>
          {storageOk ? (
            <PaymentQrUploader currentUrl={current} />
          ) : (
            <p className="text-sm text-text-muted">
              Configure PRODUCT_MEDIA_STORAGE_BUCKET + Supabase service role to
              enable QR upload. Until then checkout uses{" "}
              <code className="text-xs">{STOREFRONT_BANK_QR_PATH}</code>.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
