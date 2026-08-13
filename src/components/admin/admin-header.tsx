import { Badge } from "@/components/ui/badge";
import { isDatabaseConfigured } from "@/lib/env";

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <header className="relative mb-8 overflow-hidden rounded-[1.45rem] border border-[var(--border)] bg-[linear-gradient(135deg,#ffffff_0%,#f1f7f6_56%,#edf4fb_100%)] px-5 py-5 shadow-[0_14px_34px_rgba(16,24,39,.06)] sm:px-7 sm:py-6">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[var(--accent)]/10 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-ink)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.13em] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4ee6b9] shadow-[0_0_0_3px_rgba(78,230,185,.14)]" /> Operations console
            </span>
            {!isDatabaseConfigured() ? <Badge variant="warning">Demo / seed data</Badge> : null}
          </div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-[-0.04em] text-text sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
