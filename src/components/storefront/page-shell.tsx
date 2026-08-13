import { cn } from "@/lib/utils";

interface StorefrontPageShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function StorefrontPageShell({
  title,
  description,
  children,
  className,
}: StorefrontPageShellProps) {
  return (
    <div className={cn("min-h-[60vh] bg-[var(--page)]", className)}>
      <header className="border-b border-[var(--border)] bg-white">
        <div className="store-container py-10">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      <div className="store-container py-10">{children}</div>
    </div>
  );
}
