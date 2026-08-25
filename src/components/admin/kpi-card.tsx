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
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-[0_10px_28px_rgba(13,28,43,.055)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_36px_rgba(13,28,43,.1)]">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70", toneClasses[tone])} aria-hidden="true" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">{label}</p>
          <span className={cn("h-2.5 w-2.5 rounded-full ring-4 ring-white transition-transform duration-200 group-hover:scale-110", dotClasses[tone])} aria-hidden="true" />
        </div>
        <p className={cn("mt-3 font-[family-name:var(--font-sora)] text-[2rem] font-semibold tracking-[-0.05em] tabular-nums", tone === "default" ? "text-text" : tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-danger")}>{value}</p>
        {hint ? <p className="mt-2 text-xs leading-relaxed text-text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
