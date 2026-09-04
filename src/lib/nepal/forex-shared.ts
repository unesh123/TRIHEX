export type ForexFreshnessStatus = "LIVE" | "CACHED" | "STALE" | "UNAVAILABLE";

export interface CurrencyRate {
  currency: string;
  name: string;
  unit: number;
  buy: number; // in NPR
  sell: number; // in NPR
  spreadNpr: number;
  deltaPercent?: number;
}

export interface ForexSnapshot {
  date: string;
  publishedAt: string;
  fetchedAt: string;
  source: string;
  isLive: boolean;
  freshnessStatus: ForexFreshnessStatus;
  ageLabel?: string;
  rates: CurrencyRate[];
}

export function formatRelativeAge(input: Date | string | number): string {
  const d = typeof input === "number" ? input : new Date(input).getTime();
  const diffMs = Date.now() - d;
  if (diffMs < 0 || isNaN(diffMs)) return "Just now";
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Official NRB baseline rates for high-reliability fallback and offline testing
export const BASELINE_NRB_RATES: CurrencyRate[] = [
  { currency: "USD", name: "U.S. Dollar", unit: 1, buy: 135.20, sell: 135.80, spreadNpr: 0.60, deltaPercent: 0.05 },
  { currency: "EUR", name: "European Euro", unit: 1, buy: 147.10, sell: 147.75, spreadNpr: 0.65, deltaPercent: -0.12 },
  { currency: "GBP", name: "UK Pound Sterling", unit: 1, buy: 174.45, sell: 175.22, spreadNpr: 0.77, deltaPercent: 0.18 },
  { currency: "AUD", name: "Australian Dollar", unit: 1, buy: 88.30, sell: 88.69, spreadNpr: 0.39, deltaPercent: 0.02 },
  { currency: "CAD", name: "Canadian Dollar", unit: 1, buy: 98.40, sell: 98.84, spreadNpr: 0.44, deltaPercent: -0.04 },
  { currency: "JPY", name: "Japanese Yen (10)", unit: 10, buy: 8.95, sell: 8.99, spreadNpr: 0.04, deltaPercent: -0.22 },
  { currency: "CNY", name: "Chinese Yuan", unit: 1, buy: 18.65, sell: 18.73, spreadNpr: 0.08, deltaPercent: 0.01 },
  { currency: "AED", name: "UAE Dirham", unit: 1, buy: 36.81, sell: 36.97, spreadNpr: 0.16, deltaPercent: 0.00 },
  { currency: "QAR", name: "Qatari Riyal", unit: 1, buy: 37.09, sell: 37.26, spreadNpr: 0.17, deltaPercent: 0.01 },
  { currency: "SAR", name: "Saudi Arabian Riyal", unit: 1, buy: 36.03, sell: 36.19, spreadNpr: 0.16, deltaPercent: 0.00 },
  { currency: "INR", name: "Indian Rupee (100)", unit: 100, buy: 160.00, sell: 160.15, spreadNpr: 0.15, deltaPercent: 0.00 },
];

export function convertForeignToNpr(amount: number, buyRate: number, unit = 1): number {
  if (unit <= 0 || amount <= 0 || buyRate <= 0) return 0;
  return Number(((amount * buyRate) / unit).toFixed(2));
}

export function convertNprToForeign(nprAmount: number, sellRate: number, unit = 1): number {
  if (unit <= 0 || nprAmount <= 0 || sellRate <= 0) return 0;
  return Number(((nprAmount * unit) / sellRate).toFixed(2));
}
