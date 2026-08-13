import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClasses = {
  default: "from-[var(--primary)]/20 via-transparent to-transparent text-text",
  success: "from-[var(--success)]/22 via-transparent to-transparent text-success",
  warning: "from-[var(--warning)]/22 via-transparent to-transparent text-warning",
  danger: "from-[var(--danger)]/22 via-transparent to-transparent text-danger",
};

const dotClasses = {
  default: "bg-[var(--primary)]",
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};

export function KpiCard({ label, value, hint, tone = "default" }: KpiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[1.15rem] border border-border bg-surface-raised p-5 shadow-[0_10px_28px_rgba(16,24,39,.055)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(16,24,39,.09)]">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70", toneClasses[tone])} aria-hidden="true" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">{label}</p>
          <span className={cn("h-2 w-2 rounded-full", dotClasses[tone])} aria-hidden="true" />
        </div>
        <p className={cn("mt-3 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.045em] tabular-nums", tone === "default" ? "text-text" : tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-danger")}>{value}</p>
        {hint ? <p className="mt-2 text-xs leading-relaxed text-text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
