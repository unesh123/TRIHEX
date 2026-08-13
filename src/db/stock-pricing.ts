/**
 * Reusable pricing helper — margin % default 30%, manual override wins.
 */
export const DEFAULT_MARGIN_PERCENT = 30;
export const OPERATIONAL_FX_NPR_PER_USD = 160;

export function costNprFromUsd(usd: number, fx = OPERATIONAL_FX_NPR_PER_USD): number {
  return Math.round(usd * fx);
}

export function sellFromCost(
  costNpr: number,
  marginPercent = DEFAULT_MARGIN_PERCENT,
): number {
  const raw = costNpr * (1 + marginPercent / 100);
  return Math.max(10, Math.round(raw / 10) * 10);
}

export function sellNprFromUsdt(
  usdt: number,
  marginPercent = DEFAULT_MARGIN_PERCENT,
  fx = OPERATIONAL_FX_NPR_PER_USD,
): number {
  return sellFromCost(costNprFromUsd(usdt, fx), marginPercent);
}

export function usdtToUsdMinor(usdt: number): number {
  return Math.round(usdt * 100);
}

export function marginPercent(costNpr: number, sellNpr: number): number {
  if (costNpr <= 0) return 100;
  return Math.round(((sellNpr - costNpr) / costNpr) * 1000) / 10;
}

export function isLoss(costNpr: number, sellNpr: number): boolean {
  return sellNpr < costNpr;
}
