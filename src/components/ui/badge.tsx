import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-surface-raised text-text-muted border border-border",
        primary:
          "bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] text-[#c4b5ff] border border-[color-mix(in_srgb,var(--primary)_35%,transparent)]",
        success:
          "bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-success border border-[color-mix(in_srgb,var(--success)_35%,transparent)]",
        warning:
          "bg-[color-mix(in_srgb,var(--warning)_16%,transparent)] text-warning border border-[color-mix(in_srgb,var(--warning)_35%,transparent)]",
        danger:
          "bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] text-danger border border-[color-mix(in_srgb,var(--danger)_35%,transparent)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
