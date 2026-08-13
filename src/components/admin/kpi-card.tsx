import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClasses = {
  default: "text-text",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function KpiCard({ label, value, hint, tone = "default" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-[family-name:var(--font-sora)] text-3xl font-semibold tabular-nums",
          toneClasses[tone],
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}
