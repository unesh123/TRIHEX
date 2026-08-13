import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

function HexMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Three interlocking hex facets */}
      <path
        d="M10 8.5 L16 5 L22 8.5 L22 15.5 L16 19 L10 15.5 Z"
        fill="var(--primary)"
        opacity="0.95"
      />
      <path
        d="M14 16.5 L20 13 L26 16.5 L26 23.5 L20 27 L14 23.5 Z"
        fill="var(--success)"
        opacity="0.85"
      />
      <path
        d="M6 16.5 L12 13 L18 16.5 L18 23.5 L12 27 L6 23.5 Z"
        fill="#F7F8FC"
        stroke="var(--primary)"
        strokeWidth="1.2"
        opacity="0.95"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  size = "md",
  showWordmark = true,
}: LogoProps) {
  const sizes = {
    sm: { mark: "h-7 w-7", text: "text-sm", sub: "text-[9px]" },
    md: { mark: "h-9 w-9", text: "text-base", sub: "text-[10px]" },
    lg: { mark: "h-12 w-12", text: "text-xl", sub: "text-xs" },
  }[size];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <HexMark className={sizes.mark} />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-[family-name:var(--font-sora)] font-semibold tracking-[0.04em] text-text",
              sizes.text,
            )}
          >
            TRIHEX{" "}
            <span className="text-primary">DIGITAL</span>
          </span>
          <span
            className={cn(
              "mt-0.5 font-medium uppercase tracking-[0.18em] text-text-muted",
              sizes.sub,
            )}
          >
            Nepal-first access
          </span>
        </span>
      ) : null}
    </span>
  );

  if (href == null) return content;

  return (
    <Link href={href} className="rounded-md focus-visible:outline-none">
      {content}
    </Link>
  );
}
