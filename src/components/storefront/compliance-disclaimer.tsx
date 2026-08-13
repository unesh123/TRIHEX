import { COMPLIANCE_FOOTER_DISCLAIMER } from "@/lib/compliance/gate";
import { cn } from "@/lib/utils";

interface ComplianceDisclaimerProps {
  className?: string;
  compact?: boolean;
}

export function ComplianceDisclaimer({
  className,
  compact = false,
}: ComplianceDisclaimerProps) {
  return (
    <p
      className={cn(
        "text-text-muted",
        compact ? "text-[11px] leading-relaxed" : "text-xs leading-relaxed sm:text-sm",
        className,
      )}
      role="note"
    >
      {COMPLIANCE_FOOTER_DISCLAIMER}
    </p>
  );
}
