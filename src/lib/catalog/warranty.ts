/**
 * Warranty / guarantee options for every duration plan.
 * - NONE = current sell price, no replacement guarantee
 * - PROTECTED = +30% price, guarantee length scales with plan duration
 */

export const WARRANTY_PRICE_MULTIPLIER = 1.3;

export type WarrantyTier = "none" | "protected";

export type WarrantyQuote = {
  tier: WarrantyTier;
  label: string;
  shortLabel: string;
  description: string;
  /** Guarantee coverage in days (0 for none) */
  guaranteeDays: number;
  guaranteeLabel: string | null;
  /** Price multiplier applied to base sell (1 or 1.3) */
  priceMultiplier: number;
};

/** Map plan length → guarantee coverage when customer buys protected. */
export function guaranteeForPlanDays(planDays: number): {
  days: number;
  label: string;
} {
  // ~1 month / short packs → 15-day guarantee
  if (planDays <= 45) {
    return { days: 15, label: "15-day replacement guarantee" };
  }
  // ~3 months → 1-month guarantee
  if (planDays <= 120) {
    return { days: 30, label: "1-month replacement guarantee" };
  }
  // ~6–10 months → 3-month guarantee
  if (planDays <= 330) {
    return { days: 90, label: "3-month replacement guarantee" };
  }
  // ~1 year+ → full year guarantee
  return { days: 365, label: "Full 1-year replacement guarantee" };
}

export function parsePlanDaysFromLabel(label: string | null | undefined): number {
  if (!label) return 30;
  const t = label.toLowerCase();
  const m = t.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/);
  if (!m) return 30;
  const n = Number(m[1]);
  const unit = m[2];
  if (unit.startsWith("day")) return n;
  if (unit.startsWith("week")) return n * 7;
  if (unit.startsWith("month")) return n * 30;
  if (unit.startsWith("year")) return n * 365;
  return 30;
}

export function warrantyOptionsForPlan(planDays: number): WarrantyQuote[] {
  const g = guaranteeForPlanDays(planDays);
  return [
    {
      tier: "none",
      label: "No warranty",
      shortLabel: "No warranty",
      description:
        "Current price. No replacement guarantee if the account stops working.",
      guaranteeDays: 0,
      guaranteeLabel: null,
      priceMultiplier: 1,
    },
    {
      tier: "protected",
      label: `With warranty · ${g.label}`,
      shortLabel: g.label,
      description: `${g.label}. If delivery fails or access stops within the guarantee window after verification, we help replace or fix it. Price is 30% higher.`,
      guaranteeDays: g.days,
      guaranteeLabel: g.label,
      priceMultiplier: WARRANTY_PRICE_MULTIPLIER,
    },
  ];
}

/** Round NPR minor (paisa) to nearest rupee after warranty uplift. */
export function applyWarrantyPrice(
  baseSellNprMinor: number,
  tier: WarrantyTier,
): number {
  if (!Number.isFinite(baseSellNprMinor) || baseSellNprMinor < 0) return 0;
  if (tier !== "protected") return Math.round(baseSellNprMinor);
  const uplifted = baseSellNprMinor * WARRANTY_PRICE_MULTIPLIER;
  // Round to nearest NPR rupee (100 paisa)
  return Math.round(uplifted / 100) * 100;
}

export function isWarrantyTier(value: unknown): value is WarrantyTier {
  return value === "none" || value === "protected";
}
