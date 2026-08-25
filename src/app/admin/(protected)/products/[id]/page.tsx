import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatusPill } from "@/components/admin/admin-section-page";
import { CoverImageEditor } from "@/components/admin/cover-image-editor";
import { ProductStatusControl } from "@/components/admin/product-status-control";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadAdminProductByIdOrSlug } from "@/lib/catalog/live-catalogue";
import {
  featuresForSlug,
  featuresTextFromList,
} from "@/lib/catalog/package-features";
import { getProductCover } from "@/lib/catalog/product-covers";
import {
  softDeleteProductAction,
  updateProductAction,
  updateVariantPriceAction,
} from "@/app/admin/(protected)/products/actions";
import { formatNpr } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; kind?: string }>;
}) {
  const { id } = await params;
  const q = await searchParams;
  const product = await loadAdminProductByIdOrSlug(id);
  if (!product) notFound();

  const cover = getProductCover(product.slug);
  const coverPath = product.coverUrl ?? cover?.publicPath ?? "";
  const coverAlt = product.coverAlt ?? cover?.alt ?? product.name;
  const featuresDefault = featuresTextFromList(
    featuresForSlug(product.slug, product.longDescription),
  );
  const sellMajor =
    product.priceMinor != null ? Math.round(product.priceMinor / 100) : 0;
  const compareMajor =
    product.compareAtMinor != null
      ? Math.round(product.compareAtMinor / 100)
      : "";
  const costMajor =
    product.costUsdMinor != null
      ? Math.round((product.costUsdMinor / 100) * 160)
      : null;
  const margin =
    costMajor != null && sellMajor > 0 ? sellMajor - costMajor : null;
  const marginPct =
    margin != null && sellMajor > 0
      ? Math.round((margin / sellMajor) * 100)
      : null;

  const savedLabel =
    q.kind === "price"
      ? "Price & stock saved"
      : q.kind === "create"
        ? "Product created — upload an image below"
        : "Product saved successfully";

  const underReview =
    product.productStatus === "DRAFT" || product.needsDataVerification;

  return (
    <>
      <AdminHeader
        title={product.name}
        description="Edit details, image, features, price, stock, and hide/show on the storefront."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href={`/products/${product.slug}`} variant="outline" size="sm">
              View live
            </Button>
            <Button href="/admin/products" variant="secondary" size="sm">
              Back to list
            </Button>
          </div>
        }
      />

      {q.saved ? (
        <div
          role="status"
          className="mb-5 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]"
        >
          ✓ {savedLabel}. The storefront now uses this name/details — open “View
          live” to confirm.
        </div>
      ) : null}
      {q.error ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
        >
          {q.error === "upload_failed"
            ? "Image upload failed. Use Upload from PC in the image box."
            : q.error === "file_too_large"
              ? "Image too large (max 6MB)."
              : q.error === "save_failed"
                ? "Could not save product. Try again or change status with the dropdown (saves instantly)."
                : `Could not save (${q.error}).`}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <StatusPill
          label={underReview ? "UNDER REVIEW" : product.productStatus}
          variant="warning"
        />
        <StatusPill label={product.complianceStatus} variant="warning" />
        {product.purchasable ? (
          <StatusPill label="Available on shop" variant="success" />
        ) : (
          <StatusPill label="Check Availability" variant="danger" />
        )}
        <StatusPill
          label={`Stock: ${product.seedVisibleQuantity ?? "∞"}`}
          variant="default"
        />
      </div>

      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-[var(--text)]">
          Status (saves instantly)
        </h2>
        <div className="mt-3 max-w-xl">
          <ProductStatusControl
            productId={product.id}
            initialStatus={product.productStatus}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          action={updateProductAction}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
        >
          <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-[var(--text)]">
            Product details & image
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Change the <strong>Name</strong> below and click Save product — it
            updates live on the shop immediately.
          </p>
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="productStatus" value={product.productStatus} />
          <label className="block text-xs text-[var(--text-muted)]">
            Name (shown on storefront)
            <Input name="name" defaultValue={product.name} className="mt-1" required />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Short description
            <textarea
              name="shortDescription"
              defaultValue={product.shortDescription ?? ""}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Plan features (one per line)
            <textarea
              name="features"
              defaultValue={featuresDefault}
              rows={6}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={product.featured} />
            Featured on storefront
          </label>

          <CoverImageEditor
            productId={product.id}
            initialUrl={coverPath}
            initialAlt={coverAlt}
          />

          <Button type="submit" className="w-full sm:w-auto">
            Save product
          </Button>
        </form>

        <form
          action={updateVariantPriceAction}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
        >
          <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-[var(--text)]">
            Price, discount & stock
          </h2>
          <input type="hidden" name="variantId" value={product.variantId} />
          <input type="hidden" name="productId" value={product.id} />
          <p className="text-xs text-[var(--text-muted)]">
            SKU {product.sku}
            {product.priceMinor != null
              ? ` · current ${formatNpr(product.priceMinor)}`
              : ""}
          </p>
          {costMajor != null ? (
            <div
              className={
                margin != null && margin < 0
                  ? "rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2 text-xs font-semibold text-[var(--danger)]"
                  : "rounded-lg border border-[var(--border)] bg-[var(--page-soft)] px-3 py-2 text-xs text-[var(--text-secondary)]"
              }
            >
              Est. cost ~ NPR {costMajor.toLocaleString("en-NP")}
              {margin != null ? (
                <>
                  {" "}
                  · margin NPR {margin.toLocaleString("en-NP")}
                  {marginPct != null ? ` (${marginPct}%)` : ""}
                  {margin < 0 ? " — LOSS — raise sell price above cost" : ""}
                </>
              ) : null}
            </div>
          ) : null}
          {q.error === "loss_price" ? (
            <p className="text-xs font-semibold text-[var(--danger)]">
              Sell price is below cost. Raise the price before saving.
            </p>
          ) : null}
          {q.error === "fake_discount" ? (
            <p className="text-xs font-semibold text-[var(--danger)]">
              List price must be honest (≤35% off, list ≥ sell, list ≥ cost).
            </p>
          ) : null}
          <label className="block text-xs text-[var(--text-muted)]">
            Sell price NPR
            <Input
              name="priceNpr"
              type="number"
              min={0}
              step={1}
              defaultValue={sellMajor || ""}
              className="mt-1"
              required
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Optional list price NPR (only if honest — max 35% off)
            <Input
              name="compareAtNpr"
              type="number"
              min={0}
              step={1}
              defaultValue={compareMajor}
              className="mt-1"
              placeholder="Leave empty — no fake % badges"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Cost NPR (private — margin calc)
            <Input
              name="costNpr"
              type="number"
              min={0}
              step={1}
              defaultValue={costMajor ?? ""}
              className="mt-1"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Visible stock qty (manual inventory)
            <Input
              name="seedVisibleQuantity"
              type="number"
              min={0}
              defaultValue={product.seedVisibleQuantity ?? ""}
              className="mt-1"
              placeholder="Leave empty for unlimited / made-to-order"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="purchasable"
              defaultChecked={product.purchasable}
            />
            Customer contact status — ON = available, OFF = Check Availability
          </label>
          <p className="text-[11px] text-[var(--text-muted)]">
            Uncheck + Save price → the shop keeps the product visible and routes
            customers to Check Availability on WhatsApp.
          </p>
          <Button type="submit" className="w-full sm:w-auto">
            Save price & stock
          </Button>
        </form>
      </div>

      <form
        action={softDeleteProductAction}
        className="mt-8 rounded-2xl border border-dashed border-[var(--danger)]/40 bg-white p-5"
      >
        <input type="hidden" name="productId" value={product.id} />
        <h2 className="text-sm font-semibold text-[var(--danger)]">
          Hide product from store
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Soft-archives the product (ARCHIVED). It disappears from the shop but
          stays in the database. You can also set status to ARCHIVED above.
        </p>
        <Button type="submit" variant="secondary" size="sm" className="mt-3">
          Hide from storefront
        </Button>
      </form>

      <p className="mt-6 text-xs text-[var(--text-muted)]">
        Slug: <code>{product.slug}</code> ·{" "}
        <Link
          href={`/products/${product.slug}`}
          className="text-[var(--primary)] hover:underline"
        >
          View on storefront
        </Link>
      </p>
    </>
  );
}
