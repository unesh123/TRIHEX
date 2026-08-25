import Image from "next/image";
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
    <Image
      src="/brand/trihex-mark.webp"
      alt=""
      width={48}
      height={48}
      className={cn("shrink-0 object-contain", className)}
      aria-hidden="true"
    />
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
