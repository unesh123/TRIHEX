import { AdminHeader } from "@/components/admin/admin-header";
import { BulkImportForm } from "@/components/admin/bulk-import-form";
import { Button } from "@/components/ui/button";
import {
  bulkImportFromTextAction,
  importStarterInquiryCatalogueAction,
} from "@/app/admin/(protected)/products/import-actions";
import { INQUIRY_STARTER_COUNT } from "@/db/inquiry-expansion";

export const dynamic = "force-dynamic";

export default async function AdminProductImportPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string;
    created?: string;
    updated?: string;
    skipped?: string;
    bad?: string;
    error?: string;
    starter?: string;
  }>;
}) {
  const q = await searchParams;

  return (
    <>
      <AdminHeader
        title="Import products (cost → NPR)"
        description="Paste your buying list with cost. We convert to Nepali sell price, show profit, and add as Check Availability (WhatsApp inquiry) products."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/admin/products" variant="secondary" size="sm">
              Back to products
            </Button>
            <Button href="/inquire" variant="outline" size="sm">
              View inquire list
            </Button>
          </div>
        }
      />

      {q.ok ? (
        <div
          role="status"
          className="mb-5 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]"
        >
          ✓ Import done
          {q.starter ? ` (starter ${INQUIRY_STARTER_COUNT}+ catalogue)` : ""}.
          Created {q.created ?? 0}, updated {q.updated ?? 0}, skipped{" "}
          {q.skipped ?? 0}
          {q.bad && Number(q.bad) > 0 ? `, ${q.bad} bad lines` : ""}. Open{" "}
          <a href="/inquire" className="underline">
            /inquire
          </a>{" "}
          or Products → Under Review on the shop.
        </div>
      ) : null}
      {q.error ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
        >
          Nothing imported. Paste lines like:{" "}
          <code>Product name | 18 USD</code>
        </div>
      ) : null}

      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-[var(--text)]">
          Quick start — add {INQUIRY_STARTER_COUNT}+ similar packages
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Loads ChatGPT, Gemini, CapCut, Canva, Claude, Adobe, Spotify, Netflix,
          Midjourney, and more as <strong>Check Availability</strong> products
          with estimated USD costs (FX 160, 30% margin). Edit each cost later to
          your real buy price.
        </p>
        <form action={importStarterInquiryCatalogueAction} className="mt-3">
          <Button type="submit" size="sm">
            Add starter inquiry catalogue ({INQUIRY_STARTER_COUNT}+)
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold text-[var(--text)]">
          Paste your real buying list
        </h2>
        <p className="mt-1 mb-4 text-xs text-[var(--text-muted)]">
          Format: <code>Name | cost</code> or{" "}
          <code>Name | cost USD|NPR | margin%</code>. Example:{" "}
          <code>CapCut Pro — 1 Month | 5 USD</code>
        </p>
        <BulkImportForm action={bulkImportFromTextAction} />
      </div>
    </>
  );
}
