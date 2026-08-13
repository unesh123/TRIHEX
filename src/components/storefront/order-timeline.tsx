"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, CircleDot } from "lucide-react";
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
  const shouldReduceMotion = useReducedMotion();

  return (
    <ol className={cn("space-y-0", className)} aria-label="Order progress">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const stateLabel = step.done ? "Complete" : step.active ? "Current step" : "Upcoming";
        return (
          <li key={step.key} className="flex gap-3 sm:gap-4">
            <div className="flex w-8 shrink-0 flex-col items-center">
              <motion.span
                initial={shouldReduceMotion ? false : { scale: 0.86, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.22, delay: index * 0.035 }}
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold shadow-sm",
                  step.done
                    ? "border-[var(--success)] bg-[var(--success)] text-white"
                    : step.active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border-strong)] bg-white text-[var(--text-muted)]",
                )}
                aria-hidden="true"
              >
                {step.done ? <Check className="h-4 w-4" strokeWidth={3} /> : step.active ? <CircleDot className="h-4 w-4" /> : index + 1}
              </motion.span>
              {!last ? (
                <span
                  className={cn(
                    "min-h-9 w-px flex-1",
                    step.done ? "bg-[var(--success)]" : "bg-[var(--border)]",
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className={cn("min-h-14 pb-5", last && "pb-0")}>
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-bold",
                    step.done || step.active ? "text-[var(--text)]" : "text-[var(--text-muted)]",
                  )}
                >
                  {step.label}
                </p>
                {step.active ? <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--primary)]">Now</span> : null}
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{stateLabel}{step.at ? ` · ${new Date(step.at).toLocaleString("en-NP")}` : ""}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
