/**
 * Integer minor-unit money arithmetic.
 * NPR is stored as paisa (1 NPR = 100 paisa) for consistency with USD cents,
 * but display of NPR defaults to whole rupees (no decimals) unless configured.
 * NEVER use floating-point for money calculations.
 */

export type CurrencyCode = "NPR" | "USD";

export interface Money {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
}

export function money(amountMinor: number, currency: CurrencyCode): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error(`Money amount must be an integer minor unit, got ${amountMinor}`);
  }
  return { amountMinor, currency };
}

export function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amountMinor + b.amountMinor, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amountMinor - b.amountMinor, a.currency);
}

export function multiply(m: Money, factor: number): Money {
  if (!Number.isFinite(factor)) {
    throw new Error(`Invalid multiply factor: ${factor}`);
  }
  // Round half-up to nearest minor unit using integer math where possible
  const scaled = Math.round(m.amountMinor * factor);
  return money(scaled, m.currency);
}

export function max(...values: Money[]): Money {
  if (values.length === 0) throw new Error("max requires at least one value");
  return values.reduce((acc, v) => {
    assertSameCurrency(acc, v);
    return v.amountMinor > acc.amountMinor ? v : acc;
  });
}

export function min(...values: Money[]): Money {
  if (values.length === 0) throw new Error("min requires at least one value");
  return values.reduce((acc, v) => {
    assertSameCurrency(acc, v);
    return v.amountMinor < acc.amountMinor ? v : acc;
  });
}

export function isPositive(m: Money): boolean {
  return m.amountMinor > 0;
}

export function isZero(m: Money): boolean {
  return m.amountMinor === 0;
}

export function compare(a: Money, b: Money): number {
  assertSameCurrency(a, b);
  return a.amountMinor - b.amountMinor;
}

export function gte(a: Money, b: Money): boolean {
  return compare(a, b) >= 0;
}

export function lt(a: Money, b: Money): boolean {
  return compare(a, b) < 0;
}

/**
 * Convert USD cents to NPR paisa using an integer FX rate expressed as
 * NPR minor units per 1 USD (i.e. NPR * 100 per dollar).
 * Example: FX rate 135.50 NPR/USD => rateNprMinorPerUsd = 13550
 * Result: floor((usdCents * rateNprMinorPerUsd) / 100)
 */
export function convertUsdToNpr(
  usdMinor: number,
  rateNprMinorPerUsd: number,
): Money {
  if (!Number.isInteger(usdMinor) || !Number.isInteger(rateNprMinorPerUsd)) {
    throw new Error("FX conversion requires integer inputs");
  }
  if (rateNprMinorPerUsd <= 0) {
    throw new Error("FX rate must be positive");
  }
  // usdMinor is cents; rate is NPR minor per 1 USD (100 cents)
  // nprMinor = usdMinor * rateNprMinorPerUsd / 100
  const nprMinor = Math.floor((usdMinor * rateNprMinorPerUsd) / 100);
  return money(nprMinor, "NPR");
}

export type RoundingMode =
  | "NEAREST_5"
  | "NEAREST_10"
  | "END_9"
  | "END_49"
  | "END_99"
  | "NO_ROUNDING";

/**
 * Psychological rounding operates on whole NPR (amountMinor / 100).
 * Result is returned in NPR minor units.
 */
export function applyPsychologicalRounding(
  nprMinor: number,
  mode: RoundingMode,
): number {
  if (!Number.isInteger(nprMinor)) {
    throw new Error("Rounding requires integer minor units");
  }
  if (mode === "NO_ROUNDING") return nprMinor;

  const whole = Math.ceil(nprMinor / 100); // round up to whole NPR first

  let rounded: number;
  switch (mode) {
    case "NEAREST_5":
      rounded = Math.round(whole / 5) * 5;
      break;
    case "NEAREST_10":
      rounded = Math.round(whole / 10) * 10;
      break;
    case "END_9":
      rounded = Math.floor(whole / 10) * 10 + 9;
      if (rounded < whole) rounded += 10;
      break;
    case "END_49":
      rounded = Math.floor(whole / 100) * 100 + 49;
      if (rounded < whole) rounded += 100;
      break;
    case "END_99":
      rounded = Math.floor(whole / 100) * 100 + 99;
      if (rounded < whole) rounded += 100;
      break;
    default:
      rounded = whole;
  }

  return rounded * 100;
}

/**
 * Format NPR for display: whole rupees by default (no decimals).
 */
export function formatNpr(
  amountMinor: number,
  options: { showDecimals?: boolean; locale?: string } = {},
): string {
  const { showDecimals = false, locale = "en-NP" } = options;
  const major = amountMinor / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(major);
}

export function formatUsd(amountMinor: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

/** Basis points: 10000 = 100%, 2500 = 25% */
export function applyBasisPoints(amountMinor: number, basisPoints: number): number {
  if (!Number.isInteger(amountMinor) || !Number.isInteger(basisPoints)) {
    throw new Error("Basis point calc requires integers");
  }
  // ceil to avoid undercharging fee estimates
  return Math.ceil((amountMinor * basisPoints) / 10000);
}

export function ceilDiv(numerator: number, denominator: number): number {
  if (denominator <= 0) throw new Error("Denominator must be positive");
  return Math.ceil(numerator / denominator);
}
