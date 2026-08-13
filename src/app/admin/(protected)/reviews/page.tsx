import { AdminHeader } from "@/components/admin/admin-header";
import { StatusPill } from "@/components/admin/admin-section-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadAdminProducts } from "@/lib/catalog/live-catalogue";
import { isDatabaseConfigured } from "@/lib/env";
import { listAllReviewsAdmin } from "@/lib/reviews/store";
import {
  createReviewAction,
  setReviewStatusAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const q = await searchParams;
  const products = isDatabaseConfigured() ? await loadAdminProducts() : [];
  const reviews = isDatabaseConfigured() ? await listAllReviewsAdmin() : [];

  return (
    <>
      <AdminHeader
        title="Customer reviews"
        description="Add real testimonials only. No fake volume claims. Approved reviews show on product pages."
      />

      {q.saved ? (
        <div className="mb-4 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success)]">
          Review saved.
        </div>
      ) : null}
      {q.error ? (
        <div className="mb-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {q.error}
        </div>
      ) : null}

      <form
        action={createReviewAction}
        className="mb-8 grid max-w-2xl gap-3 rounded-2xl border border-[var(--border)] bg-white p-5"
      >
        <h2 className="text-sm font-semibold">Add testimonial</h2>
        <label className="text-xs text-[var(--text-muted)]">
          Product (optional if category set)
          <select
            name="productId"
            className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
            defaultValue=""
          >
            <option value="">— none —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[var(--text-muted)]">
          Category slug (optional)
          <Input name="categorySlug" placeholder="ai-tools" className="mt-1" />
        </label>
        <label className="text-xs text-[var(--text-muted)]">
          Customer display name
          <Input name="authorName" required className="mt-1" placeholder="Suman K." />
        </label>
        <label className="text-xs text-[var(--text-muted)]">
          Rating (1–5)
          <Input
            name="rating"
            type="number"
            min={1}
            max={5}
            defaultValue={5}
            required
            className="mt-1"
          />
        </label>
        <label className="text-xs text-[var(--text-muted)]">
          Title
          <Input name="title" className="mt-1" placeholder="Fast delivery" />
        </label>
        <label className="text-xs text-[var(--text-muted)]">
          Review body
          <textarea
            name="body"
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" size="sm" className="w-fit">
          Publish review
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--page-soft)] text-xs uppercase text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Product / category</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  No reviews yet — add a real customer testimonial above.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)]/60">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.authorName ?? "—"}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {r.title ?? r.body?.slice(0, 60)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {r.productName ?? r.categorySlug ?? "—"}
                  </td>
                  <td className="px-4 py-3">{r.rating}/5</td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={r.status}
                      variant={
                        r.status === "APPROVED"
                          ? "success"
                          : r.status === "REJECTED"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.status !== "APPROVED" ? (
                        <form action={setReviewStatusAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="APPROVED" />
                          <button
                            type="submit"
                            className="text-xs font-medium text-[var(--success)] hover:underline"
                          >
                            Approve
                          </button>
                        </form>
                      ) : null}
                      {r.status !== "REJECTED" ? (
                        <form action={setReviewStatusAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <button
                            type="submit"
                            className="text-xs font-medium text-[var(--danger)] hover:underline"
                          >
                            Reject
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
