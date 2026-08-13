import { Badge } from "@/components/ui/badge";
import { isDatabaseConfigured } from "@/lib/env";

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight text-text">
            {title}
          </h1>
          {!isDatabaseConfigured() ? (
            <Badge variant="warning">Demo / seed data</Badge>
          ) : null}
        </div>
        {description ? (
          <p className="max-w-3xl text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
