import { Sparkles } from "lucide-react";
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
      <header className="relative isolate overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(135deg,#fbfdff_0%,#edf5f3_50%,#f8fafc_100%)]">
        <div className="pointer-events-none absolute inset-0 -z-10 surface-grid opacity-[0.26]" />
        <div className="pointer-events-none absolute -right-28 top-1/2 -z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="store-container py-10 sm:py-14">
          <span className="premium-kicker"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> TRIHEX digital access</span>
          <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.05em] text-[var(--text)] text-balance sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      <div className="store-container py-9 sm:py-12">{children}</div>
    </div>
  );
}
