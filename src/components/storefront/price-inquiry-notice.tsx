import { PRICE_INQUIRY_NOTICE } from "@/lib/compliance/gate";
import { cn } from "@/lib/utils";

/** Quote near prices — ask before buying; rates can move. */
export function PriceInquiryNotice({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <p
      role="note"
      className={cn(
        "rounded-xl border border-[var(--warning)]/25 bg-[var(--warning-soft)] px-3 py-2 leading-relaxed text-[var(--text-secondary)]",
        compact ? "text-[10px] sm:text-[11px]" : "text-xs sm:text-sm",
        className,
      )}
    >
      {PRICE_INQUIRY_NOTICE}
    </p>
  );
}
