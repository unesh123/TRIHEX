import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProductAction } from "@/app/admin/(protected)/products/actions";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;

  return (
    <>
      <AdminHeader
        title="Add product"
        description="Create a full catalogue item — name, price, stock, visibility, features, then upload image on the next screen."
        actions={
          <Button href="/admin/products" variant="secondary" size="sm">
            Cancel
          </Button>
        }
      />

      {q.error ? (
        <p className="mb-4 text-sm text-[var(--danger)]">
          Could not create product ({q.error}). Check name/slug and try again.
        </p>
      ) : null}

      <form
        action={createProductAction}
        className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
      >
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">Basics</h2>
          <label className="block text-xs text-[var(--text-muted)]">
            Name *
            <Input name="name" required className="mt-1" placeholder="Product name" />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Slug (optional — auto from name)
            <Input
              name="slug"
              className="mt-1"
              placeholder="chatgpt-plus-1-month"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Short description
            <textarea
              name="shortDescription"
              rows={2}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              placeholder="One–two sentences for the storefront card"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Plan features (one per line — shown on product page + WhatsApp)
            <textarea
              name="features"
              rows={5}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              placeholder={"Access for X months\nKey feature 2\nWhatsApp support"}
            />
          </label>
        </section>

        <section className="space-y-3 border-t border-[var(--border)] pt-4">
          <h2 className="text-sm font-semibold text-[var(--text)]">Pricing</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-[var(--text-muted)]">
              Sell price NPR (discounted) *
              <Input
                name="priceNpr"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={0}
                className="mt-1"
              />
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Original / list package price NPR
              <Input
                name="compareAtNpr"
                type="number"
                min={0}
                step={1}
                className="mt-1"
                placeholder="Shown struck-through"
              />
            </label>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Customers see original price crossed out and your sell price as the
            discount.
          </p>
        </section>

        <section className="space-y-3 border-t border-[var(--border)] pt-4">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Stock & visibility
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-[var(--text-muted)]">
              Visible stock qty
              <Input
                name="seedVisibleQuantity"
                type="number"
                min={0}
                step={1}
                className="mt-1"
                placeholder="e.g. 10"
              />
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Storefront status
              <select
                name="productStatus"
                defaultValue="DRAFT"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              >
                <option value="DRAFT">DRAFT — Under review (visible, no Buy)</option>
                <option value="PUBLIC">PUBLIC — Live on shop</option>
                <option value="BLOCKED">BLOCKED — Show as unavailable</option>
                <option value="ARCHIVED">ARCHIVED — Hidden from shop</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="purchasable" />
            Available on shop — customers can request confirmation on WhatsApp
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" />
            Featured on homepage
          </label>
        </section>

        <section className="space-y-3 border-t border-[var(--border)] pt-4">
          <h2 className="text-sm font-semibold text-[var(--text)]">Catalog</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-[var(--text-muted)]">
              Brand slug
              <Input name="brandSlug" defaultValue="trihex" className="mt-1" />
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Category slug
              <Input
                name="categorySlug"
                defaultValue="ai-tools"
                className="mt-1"
              />
            </label>
          </div>
        </section>

        <Button type="submit" className="w-full sm:w-auto">
          Create product → upload image next
        </Button>
      </form>
    </>
  );
}
