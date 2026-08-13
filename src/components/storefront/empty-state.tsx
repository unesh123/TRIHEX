import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--page-soft)] px-6 py-12 text-center">
      <h2 className="font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)]">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-muted)]">{body}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {primaryHref && primaryLabel ? (
          <Button href={primaryHref} size="sm">
            {primaryLabel}
          </Button>
        ) : null}
        {secondaryHref && secondaryLabel ? (
          <Button href={secondaryHref} variant="secondary" size="sm">
            {secondaryLabel}
          </Button>
        ) : null}
      </div>
      {!primaryHref && secondaryHref && secondaryLabel ? (
        <Link
          href={secondaryHref}
          className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
