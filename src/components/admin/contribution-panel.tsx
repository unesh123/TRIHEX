import { Badge } from "@/components/ui/badge";
import {
  calculateContribution,
  type ContributionBreakdown,
  type ContributionRisk,
} from "@/lib/pricing/contribution";
import { formatNpr } from "@/lib/money";

interface ContributionPanelProps {
  breakdown: ContributionBreakdown;
  ownerNote?: string;
}

const riskVariant: Record<
  ContributionRisk,
  "success" | "warning" | "danger" | "default"
> = {
  HEALTHY: "success",
  LOW_MARGIN: "warning",
  BELOW_POLICY: "warning",
  ESTIMATED_LOSS: "danger",
};

export function ContributionPanel({ breakdown, ownerNote }: ContributionPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised/70 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text">Contribution preview</h3>
        <Badge variant={riskVariant[breakdown.risk]}>{breakdown.label}</Badge>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <Row label="Selling price" value={formatNpr(breakdown.sellingPriceNprMinor)} />
        <Row
          label="Supplier (converted)"
          value={formatNpr(breakdown.supplierCostConvertedNprMinor)}
        />
        <Row
          label="Gross difference"
          value={formatNpr(breakdown.grossDifferenceNprMinor)}
        />
        <Row
          label="Estimated contribution"
          value={formatNpr(breakdown.estimatedContributionNprMinor)}
          highlight
        />
      </dl>

      <details className="mt-4 rounded-lg border border-border/80 bg-surface/50 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-text-muted">
          Allowances breakdown
        </summary>
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <Row
            label="Payment"
            value={formatNpr(breakdown.paymentAllowanceNprMinor)}
            compact
          />
          <Row
            label="Advertising"
            value={formatNpr(breakdown.advertisingAllowanceNprMinor)}
            compact
          />
          <Row
            label="Operating"
            value={formatNpr(breakdown.operatingAllowanceNprMinor)}
            compact
          />
          <Row
            label="Support"
            value={formatNpr(breakdown.supportAllowanceNprMinor)}
            compact
          />
          <Row
            label="Warranty"
            value={formatNpr(breakdown.warrantyAllowanceNprMinor)}
            compact
          />
          <Row label="Tax" value={formatNpr(breakdown.taxAllowanceNprMinor)} compact />
        </dl>
      </details>

      {ownerNote ? (
        <p className="mt-4 text-xs text-text-muted">
          Note: {ownerNote}. This is an estimated contribution — not guaranteed
          profit.
        </p>
      ) : (
        <p className="mt-4 text-xs text-text-muted">
          Estimated contribution only — not guaranteed profit.
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
  compact,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex justify-between gap-2" : undefined}>
      <dt className={compact ? "text-text-muted" : "text-xs text-text-muted"}>
        {label}
      </dt>
      <dd
        className={
          highlight
            ? "font-semibold text-primary"
            : compact
              ? "font-medium text-text"
              : "text-sm font-medium text-text"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function buildContributionFromVariant(variant: {
  manualSellingPriceNprMinor?: number;
  supplierCostUsdMinor: number;
  fxRateNprMinorPerUsd?: number;
  paymentAllowanceNprMinor?: number;
  advertisingAllowanceNprMinor?: number;
  operatingAllowanceNprMinor?: number;
  supportAllowanceNprMinor?: number;
  warrantyAllowanceNprMinor?: number;
  taxAllowanceNprMinor?: number;
  minimumProfitNprMinor?: number;
}): ContributionBreakdown | null {
  const selling = variant.manualSellingPriceNprMinor;
  const fx = variant.fxRateNprMinorPerUsd ?? 16000;
  if (selling == null) return null;

  const supplierNpr = Math.floor(
    (variant.supplierCostUsdMinor * fx) / 100,
  );

  return calculateContribution({
    sellingPriceNprMinor: selling,
    supplierCostConvertedNprMinor: supplierNpr,
    paymentAllowanceNprMinor: variant.paymentAllowanceNprMinor ?? 0,
    advertisingAllowanceNprMinor: variant.advertisingAllowanceNprMinor ?? 0,
    operatingAllowanceNprMinor: variant.operatingAllowanceNprMinor ?? 0,
    supportAllowanceNprMinor: variant.supportAllowanceNprMinor ?? 0,
    warrantyAllowanceNprMinor: variant.warrantyAllowanceNprMinor ?? 0,
    taxAllowanceNprMinor: variant.taxAllowanceNprMinor ?? 0,
    minimumPolicyNprMinor: variant.minimumProfitNprMinor ?? 0,
  });
}
