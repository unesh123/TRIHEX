import { cn } from "@/lib/utils";

interface DataTableShellProps {
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DataTableShell({
  title,
  description,
  toolbar,
  children,
  className,
}: DataTableShellProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface/60",
        className,
      )}
    >
      {(title || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-sm font-semibold text-text">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-xs text-text-muted">{description}</p>
            ) : null}
          </div>
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
