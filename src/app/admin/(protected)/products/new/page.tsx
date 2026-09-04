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
        title="Add New Product"
        description="Create a verified digital tool or asset for the TRIHEX store catalogue with pricing, duration, features, and taxonomy."
        actions={
          <Button href="/admin/products" variant="secondary" size="sm">
            Cancel
          </Button>
        }
      />

      {q.error ? (
        <div className="mb-6 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4 text-sm font-semibold text-[var(--danger)]">
          Could not create product ({q.error}). Please verify all required fields and try again.
        </div>
      ) : null}

      <form action={createProductAction} className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Main Column */}
        <div className="space-y-6">
          {/* Card 1: Product Basics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-sora)] text-base font-bold text-slate-900">
              Basic Information
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              This information will be displayed on the storefront card and product detail page.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Product Name *
                </label>
                <Input
                  name="name"
                  required
                  placeholder="e.g. Cursor Pro AI Code Editor"
                  className="mt-1.5 h-11 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  URL Slug (Optional — generated automatically if blank)
                </label>
                <Input
                  name="slug"
                  placeholder="e.g. cursor-pro-12m"
                  className="mt-1.5 h-11 font-mono text-xs text-slate-600"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Leave empty to generate from name automatically. Must be unique.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="A concise 1–2 sentence summary shown on storefront search cards."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Included Features (One per line)
                </label>
                <textarea
                  name="features"
                  rows={5}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder={"Claude 3.5 Sonnet & GPT-4o Frontier AI\nAutonomous Code Composer\nDeep Codebase Semantic Indexing\nVerified Delivery & Local Support"}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Each line appears as a green checkmark feature bullet on the product page and WhatsApp checkout quote.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Value */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-sora)] text-base font-bold text-slate-900">
              Pricing &amp; Discounts
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Set customer sell price in Nepalese Rupees (NPR) with honest compare-at list pricing.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Customer Price NPR (Selling) *
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">Rs.</span>
                  <Input
                    name="priceNpr"
                    type="number"
                    min={0}
                    step={1}
                    required
                    defaultValue={1999}
                    className="h-11 pl-11 font-bold text-slate-900"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Actual amount paid by customer at checkout.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Original / List Price NPR
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">Rs.</span>
                  <Input
                    name="compareAtNpr"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="e.g. 4999"
                    className="h-11 pl-11 text-slate-600"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Displayed crossed out with computed % discount badge.</p>
              </div>
            </div>
          </div>

          {/* Card 3: Plan Duration & Variant */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-sora)] text-base font-bold text-slate-900">
              Initial Plan Duration
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Duration Value
                </label>
                <Input
                  name="durationValue"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Duration Unit
                </label>
                <select
                  name="durationUnit"
                  defaultValue="MONTH"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                >
                  <option value="MONTH">Month(s)</option>
                  <option value="YEAR">Year(s)</option>
                  <option value="DAY">Day(s)</option>
                  <option value="ONE_TIME">One-Time / Lifetime</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Card 4: Publication & Availability */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-sora)] text-base font-bold text-slate-900">
              Status &amp; Availability
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Catalogue Status
                </label>
                <select
                  name="productStatus"
                  defaultValue="PUBLIC"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-slate-400 focus:outline-none"
                >
                  <option value="PUBLIC">PUBLIC — Live on shop (Orderable)</option>
                  <option value="DRAFT">DRAFT — Under Review (Check Availability)</option>
                  <option value="BLOCKED">BLOCKED — Temporarily unavailable</option>
                  <option value="ARCHIVED">ARCHIVED — Hidden from shop</option>
                </select>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 space-y-3 border border-slate-200/70">
                <label className="flex items-center gap-3 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="purchasable"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  <span>Allow instant website order &amp; QR checkout</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  <span>Feature in Homepage Spotlight shelf</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 5: Category & Brand */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-sora)] text-base font-bold text-slate-900">
              Category &amp; Taxonomy
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Storefront Category
                </label>
                <select
                  name="categorySlug"
                  defaultValue="ai-tools"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-slate-400 focus:outline-none"
                >
                  <option value="ai-tools">AI Assistants &amp; Models</option>
                  <option value="developer-tools">Developer &amp; Coding Tools</option>
                  <option value="video">Video &amp; Motion AI</option>
                  <option value="design">Creative &amp; Design</option>
                  <option value="productivity">Productivity &amp; Workspace</option>
                  <option value="automation">Automation &amp; Agents</option>
                  <option value="digital-assets">Digital Assets &amp; Prompt Packs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Brand Slug
                </label>
                <Input
                  name="brandSlug"
                  defaultValue="trihex"
                  className="mt-1.5 h-11 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Stock Available Quantity
                </label>
                <Input
                  name="seedVisibleQuantity"
                  type="number"
                  min={0}
                  defaultValue={50}
                  className="mt-1.5 h-11 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Submit Button */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-slate-900 text-sm font-bold text-white shadow transition hover:bg-slate-800"
            >
              Save Product &amp; Configure Image →
            </Button>
            <p className="mt-2.5 text-center text-[11px] text-slate-400">
              Once created, you can instantly upload artwork or adjust multi-plan durations.
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
