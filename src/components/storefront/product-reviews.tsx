export function ProductReviews({
  reviews,
}: {
  reviews: Array<{
    id: string;
    authorName: string;
    rating: number;
    title: string | null;
    body: string | null;
  }>;
}) {
  if (reviews.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)] sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        Customer feedback
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)]">
        Real reviews
      </h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        These are individual testimonials — we do not invent star counts or review volume.
      </p>
      <ul className="mt-5 space-y-4">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-[var(--border)]/70 bg-[var(--page-soft)] px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--text)]">
                {r.authorName}
              </p>
              <p className="text-xs font-medium text-[var(--warning)]">
                {"★".repeat(r.rating)}
                {"☆".repeat(Math.max(0, 5 - r.rating))}
              </p>
            </div>
            {r.title ? (
              <p className="mt-1 text-sm font-medium text-[var(--text)]">{r.title}</p>
            ) : null}
            {r.body ? (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{r.body}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
