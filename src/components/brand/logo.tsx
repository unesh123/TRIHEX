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
    <div className="relative shrink-0 flex items-center justify-center">
      <Image
        src="/brand/trihex-mark.webp"
        alt="TRIHEX"
        width={48}
        height={48}
        priority
        className={cn(
          "shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(2,132,199,0.28)]",
          className,
        )}
        aria-hidden="true"
      />
    </div>
  );
}

export function Logo({
  className,
  href = "/",
  size = "md",
  showWordmark = true,
}: LogoProps) {
  const sizes = {
    sm: { mark: "h-8 w-8", text: "text-[15px]", sub: "text-[9px]" },
    md: { mark: "h-10 w-10", text: "text-[18px]", sub: "text-[10px]" },
    lg: { mark: "h-12 w-12", text: "text-2xl", sub: "text-xs" },
  }[size];

  const content = (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <HexMark className={sizes.mark} />
      {showWordmark ? (
        <span className="flex flex-col justify-center leading-none select-none">
          <span
            className={cn(
              "font-[family-name:var(--font-sora)] font-black tracking-tight flex items-center gap-1.5",
              sizes.text,
            )}
          >
            <span className="text-slate-950 font-black tracking-tight">TRIHEX</span>
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent font-black tracking-tight drop-shadow-[0_1px_2px_rgba(2,132,199,0.2)]">
              DIGITAL
            </span>
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-cyan-500 animate-pulse" />
            <span
              className={cn(
                "font-extrabold uppercase tracking-[0.2em] bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent",
                sizes.sub,
              )}
            >
              Nepal-First AI & Cloud
            </span>
          </span>
        </span>
      ) : null}
    </span>
  );

  if (href == null) return content;

  return (
    <Link href={href} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      {content}
    </Link>
  );
}

