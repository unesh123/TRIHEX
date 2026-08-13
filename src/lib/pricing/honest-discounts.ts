/**
 * Honest compare-at / list-price rules.
 * Never invent fake "was Rs.X" or 70–90% off badges.
 */

export const MAX_HONEST_DISCOUNT_PERCENT = 35;

export type HonestListCheck = {
  sellNprMinor: number;
  listNprMinor: number | null | undefined;
  /** Optional cost basis in NPR minor — list must be >= cost when provided */
  costNprMinor?: number | null;
};

/**
 * Returns a displayable list price only when it is defensible.
 * - list must be >= sell (real basis)
 * - discount vs list must be <= 35%
 * - if cost known, list must be >= cost
 */
export function honestCompareAtNprMinor(
  input: HonestListCheck,
): number | null {
  const sell = input.sellNprMinor;
  const list = input.listNprMinor;
  if (list == null || !Number.isFinite(list) || !Number.isFinite(sell)) {
    return null;
  }
  if (list < sell) return null;
  if (list === sell) return null;
  const discountPct = ((list - sell) / list) * 100;
  if (discountPct > MAX_HONEST_DISCOUNT_PERCENT) return null;
  if (
    input.costNprMinor != null &&
    Number.isFinite(input.costNprMinor) &&
    list < input.costNprMinor
  ) {
    return null;
  }
  return list;
}

export function discountPercentFromList(
  sellNprMinor: number,
  listNprMinor: number,
): number {
  if (listNprMinor <= 0 || sellNprMinor < 0 || sellNprMinor >= listNprMinor) {
    return 0;
  }
  return Math.round(((listNprMinor - sellNprMinor) / listNprMinor) * 100);
}

/** Assert list >= real sell basis (and honest band). Throws on violation. */
export function assertHonestListPrice(input: HonestListCheck): void {
  if (input.listNprMinor == null) return;
  if (input.listNprMinor < input.sellNprMinor) {
    throw new Error(
      `List price (${input.listNprMinor}) must be >= sell price (${input.sellNprMinor}).`,
    );
  }
  const honest = honestCompareAtNprMinor(input);
  if (honest == null && input.listNprMinor > input.sellNprMinor) {
    throw new Error(
      `List price is not an honest compare-at (max ${MAX_HONEST_DISCOUNT_PERCENT}% off, list >= cost).`,
    );
  }
}

/** Sell below cost = loss. */
export function isLossPrice(sellNprMinor: number, costNprMinor: number | null | undefined): boolean {
  if (costNprMinor == null || !Number.isFinite(costNprMinor)) return false;
  return sellNprMinor < costNprMinor;
}
