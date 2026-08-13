"use client";

import { cn } from "@/lib/utils";

export type TimelineStep = {
  key: string;
  label: string;
  done: boolean;
  active: boolean;
  at?: string;
};

export function OrderTimeline({
  steps,
  className,
}: {
  steps: TimelineStep[];
  className?: string;
}) {
  return (
    <ol className={cn("space-y-0", className)}>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  step.done
                    ? "bg-[var(--success)] text-white"
                    : step.active
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-muted)] text-[var(--text-muted)]",
                )}
                aria-hidden
              >
                {step.done ? "✓" : i + 1}
              </span>
              {!last ? (
                <span
                  className={cn(
                    "my-1 w-0.5 flex-1 min-h-6",
                    step.done ? "bg-[var(--success)]" : "bg-[var(--border)]",
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-5", last && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-semibold",
                  step.done || step.active
                    ? "text-[var(--text)]"
                    : "text-[var(--text-muted)]",
                )}
              >
                {step.label}
              </p>
              {step.at ? (
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {new Date(step.at).toLocaleString("en-NP")}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
