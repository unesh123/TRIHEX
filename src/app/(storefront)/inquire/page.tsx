import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import {
  formatStorePrice,
  getLiveMerchandisingCatalogue,
  type MerchCard,
} from "@/lib/catalog/merchandising";
import { productEnquiryUrl, getWhatsAppDisplay } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function InquireRow({ product }: { product: MerchCard }) {
  const wa = productEnquiryUrl({
    productName: product.title,
    variantName: product.packageLabel,
    slug: product.slug,
    priceLabel:
      product.showPrice && product.priceNprMinor != null
        ? formatStorePrice(product.priceNprMinor)
        : null,
    compareAtLabel:
      product.compareAtPriceNprMinor != null
        ? formatStorePrice(product.compareAtPriceNprMinor)
        : null,
    features: product.features.slice(0, 4),
  });

  return (
    <li className="flex flex-col gap-3 border-b border-[var(--border)] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--warning)]">
            Check availability
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {product.brandName}
          </span>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="mt-1 block font-[family-name:var(--font-sora)] text-base font-semibold text-[var(--text)] hover:text-[var(--primary)] sm:text-lg"
        >
          {product.title}
        </Link>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          {product.packageLabel}
          {product.durationLabel ? ` · ${product.durationLabel}` : ""}
        </p>
        {product.shortDescription ? (
          <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)] sm:text-sm">
            {product.shortDescription}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-48 sm:items-end">
        {product.showPrice && product.priceNprMinor != null ? (
          <div className="text-left sm:text-right">
            {product.compareAtPriceNprMinor != null ? (
              <p className="text-xs text-[var(--text-muted)] line-through">
                {formatStorePrice(product.compareAtPriceNprMinor)}
              </p>
            ) : null}
            <p className="font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)]">
              {formatStorePrice(product.priceNprMinor)}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              Price may change — inquire first
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Price on enquiry</p>
        )}
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
        >
          Inquire on WhatsApp
        </a>
      </div>
    </li>
  );
}

export default async function InquireListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const [review, coming] = await Promise.all([
    getLiveMerchandisingCatalogue({
      visibility: ["AVAILABILITY_UNDER_REVIEW"],
      query: q,
      includeBlocked: false,
    }),
    getLiveMerchandisingCatalogue({
      visibility: ["COMING_SOON"],
      query: q,
      includeBlocked: false,
    }),
  ]);

  const products = [...review, ...coming].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  return (
    <StorefrontPageShell
      title="Check availability"
      description={`Browse packages you can inquire about on WhatsApp (${getWhatsAppDisplay()}). Ask first — if we have it, pay, then we deliver on WhatsApp after verification.`}
    >
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_8px_24px_var(--shadow)] sm:p-5">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
          <li>Find a product in the list below</li>
          <li>Tap Inquire on WhatsApp and ask if it’s available</li>
          <li>Pay only after we confirm (bank / eSewa / Khalti QR)</li>
          <li>We verify payment, then deliver your package on WhatsApp</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button href="/products?filter=available" variant="secondary" size="sm">
            Buy Now products
          </Button>
          <Button href="/products" variant="outline" size="sm">
            All products
          </Button>
        </div>
      </div>

      <form
        action="/inquire"
        className="mb-4 flex flex-col gap-2 sm:flex-row"
      >
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search CapCut, ChatGPT, Canva…"
          className="h-11 flex-1 rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none focus:border-[var(--primary)]"
        />
        <Button type="submit" size="sm" className="h-11">
          Search
        </Button>
      </form>

      <div className="rounded-2xl border border-[var(--border)] bg-white px-4 shadow-[0_8px_24px_var(--shadow)] sm:px-5">
        <div className="flex items-center justify-between border-b border-[var(--border)] py-3">
          <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-[var(--text)]">
            Inquiry list
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {products.length} package{products.length === 1 ? "" : "s"}
          </p>
        </div>
        {products.length ? (
          <ul className="divide-y-0">
            {products.map((p) => (
              <InquireRow key={p.slug} product={p} />
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-sm text-[var(--text-secondary)]">
            No inquiry products yet. Ask on WhatsApp, or check{" "}
            <Link href="/products" className="text-[var(--primary)] underline">
              all products
            </Link>
            .
          </p>
        )}
      </div>
    </StorefrontPageShell>
  );
}
