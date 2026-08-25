import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-[0_8px_20px_rgba(12,88,119,.18)] hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_12px_26px_rgba(12,88,119,.24)]",
        secondary:
          "border border-border bg-surface-raised text-text shadow-sm hover:-translate-y-0.5 hover:border-primary/45 hover:bg-white hover:shadow-md",
        ghost: "text-text-muted hover:bg-surface-raised hover:text-text",
        outline:
          "border border-border bg-white/60 text-text hover:-translate-y-0.5 hover:border-primary/45 hover:bg-white",
        danger: "bg-danger text-white shadow-sm hover:-translate-y-0.5 hover:brightness-110",
        whatsapp:
          "bg-[#16894c] text-white shadow-[0_8px_20px_rgba(22,137,76,.16)] hover:-translate-y-0.5 hover:bg-[#11743f]",
      },
      size: {
        sm: "h-10 px-3 text-xs",
        md: "h-11 px-4",
        lg: "h-13 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  external?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, type = "button", href, external, ...props },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (href) {
      if (external || href.startsWith("http") || href.startsWith("https")) {
        return (
          <a
            href={href}
            className={classes}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.children}
          </a>
        );
      }
      return (
        <Link href={href} className={classes}>
          {props.children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
