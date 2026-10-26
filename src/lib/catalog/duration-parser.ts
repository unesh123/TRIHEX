/**
 * Unified Duration Parser for TRIHEX DIGITAL.
 * Accurately extracts duration value, unit, approximate days, and customer-facing label
 * from product titles, package strings, and slugs.
 */

export type ParsedDuration = {
  value: number;
  unit: "DAY" | "WEEK" | "MONTH" | "YEAR";
  label: string;
  approxDays: number;
};

export function durationFromFields(
  value: number | null | undefined,
  unit: string | null | undefined,
): ParsedDuration | null {
  if (value == null || value <= 0 || !unit) return null;
  const normalized = unit.toUpperCase().replace(/S$/, "");
  if (normalized === "DAY") {
    return { value, unit: "DAY", label: value === 1 ? "1 Day" : `${value} Days`, approxDays: value };
  }
  if (normalized === "WEEK") {
    return { value, unit: "WEEK", label: value === 1 ? "1 Week" : `${value} Weeks`, approxDays: value * 7 };
  }
  if (normalized === "MONTH") {
    return {
      value,
      unit: "MONTH",
      label: value === 12 ? "12 Months (1 Year)" : value === 24 ? "24 Months (2 Years)" : value === 1 ? "1 Month" : `${value} Months`,
      approxDays: value * 30,
    };
  }
  if (normalized === "YEAR") {
    return { value, unit: "YEAR", label: value === 1 ? "1 Year" : `${value} Years`, approxDays: value * 365 };
  }
  return null;
}

/** Resolve variant duration from its most variant-specific evidence first. */
export function resolveVariantDuration(input: {
  sku?: string | null;
  variantName?: string | null;
  durationValue?: number | null;
  durationUnit?: string | null;
  fallback?: string | null;
}): ParsedDuration | null {
  return (
    extractDuration(input.sku) ??
    extractDuration(input.variantName) ??
    durationFromFields(input.durationValue, input.durationUnit) ??
    extractDuration(input.fallback)
  );
}

export function extractDuration(
  textOrSlug: string | null | undefined,
): ParsedDuration | null {
  if (!textOrSlug) return null;
  const s = textOrSlug.toLowerCase().trim();

  // 1. Years / Yrs (e.g., "1 Year", "2 Years", "1-year", "12m", "1-yr")
  const yMatch =
    s.match(/\b(\d+)\s*(?:years?|yrs?)\b/i) ||
    s.match(/(?:^|-)(\d+)-(?:years?|yrs?)(?:-|$)/i);
  if (yMatch) {
    const val = parseInt(yMatch[1]!, 10);
    return {
      value: val,
      unit: "YEAR",
      label: val === 1 ? "1 Year" : `${val} Years`,
      approxDays: val * 365,
    };
  }

  // 2. Months / Moths / m suffix (e.g. "1 Month", "3 Months", "6 Months", "12 Months", "12m", "6m", "3m", "1m")
  const mMatch =
    s.match(/\b(\d+)\s*(?:months?|moths?)\b/i) ||
    s.match(/(?:^|-)(\d+)-(?:months?|moths?)(?:-|$)/i) ||
    s.match(/(?:^|-)(\d+)m(?:onths?)?(?:-|$)/i);
  if (mMatch) {
    const val = parseInt(mMatch[1]!, 10);
    const label =
      val === 12
        ? "12 Months (1 Year)"
        : val === 24
          ? "24 Months (2 Years)"
          : val === 1
            ? "1 Month"
            : `${val} Months`;
    return {
      value: val,
      unit: "MONTH",
      label,
      approxDays: val * 30,
    };
  }

  // 3. Weeks (e.g. "1 Week", "2 Weeks", "1-week")
  const wMatch =
    s.match(/\b(\d+)\s*weeks?\b/i) ||
    s.match(/(?:^|-)(\d+)-weeks?(?:-|$)/i);
  if (wMatch) {
    const val = parseInt(wMatch[1]!, 10);
    return {
      value: val,
      unit: "WEEK",
      label: val === 1 ? "1 Week" : `${val} Weeks`,
      approxDays: val * 7,
    };
  }

  // 4. Days / d suffix (e.g. "7 Days", "30 Days", "7-days", "30-days", "14-days", "20-days")
  const dMatch =
    s.match(/\b(\d+)\s*days?\b/i) ||
    s.match(/(?:^|-)(\d+)-days?(?:-|$)/i);
  if (dMatch) {
    const val = parseInt(dMatch[1]!, 10);
    if (val === 30) {
      return {
        value: 1,
        unit: "MONTH",
        label: "1 Month",
        approxDays: 30,
      };
    }
    return {
      value: val,
      unit: "DAY",
      label: val === 1 ? "1 Day" : `${val} Days`,
      approxDays: val,
    };
  }

  // 5. Lifetime / Permanent
  if (s.includes("lifetime") || s.includes("permanent")) {
    return {
      value: 1,
      unit: "YEAR",
      label: "Lifetime Access",
      approxDays: 99999,
    };
  }

  // 6. One-time
  if (s.includes("one-time") || s.includes("single")) {
    return {
      value: 1,
      unit: "DAY",
      label: "One-time",
      approxDays: 1,
    };
  }

  return null;
}
