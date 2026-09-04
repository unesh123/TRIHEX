import { safeFetch } from "@/lib/ingestion/safe-fetch";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createHash } from "node:crypto";

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

let previousSnapshotCache: ForexSnapshot | null = null;

export async function fetchNrbForexRates(): Promise<ForexSnapshot> {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const url = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1&from=${today}&to=${today}`;

  try {
    const result = await safeFetch<any>(url, {
      timeoutMs: 4000,
      allowedDomains: ["www.nrb.org.np", "nrb.org.np"],
    });

    if (result.ok && result.data?.data?.payload?.[0]?.rates) {
      const payload = result.data.data.payload[0];
      const apiRates = payload.rates;
      const parsed: CurrencyRate[] = apiRates.map((r: any) => {
        const buy = Number.parseFloat(r.buy);
        const sell = Number.parseFloat(r.sell);
        const unit = Number.parseInt(r.currency.unit || "1", 10);

        // Compute 24h delta if previous snapshot exists
        let deltaPercent = 0;
        if (previousSnapshotCache) {
          const prev = previousSnapshotCache.rates.find((p) => p.currency === r.currency.iso3);
          if (prev && prev.buy > 0) {
            deltaPercent = Number((((buy - prev.buy) / prev.buy) * 100).toFixed(2));
          }
        }

        return {
          currency: r.currency.iso3,
          name: r.currency.name,
          unit,
          buy,
          sell,
          spreadNpr: Number((sell - buy).toFixed(2)),
          deltaPercent,
        };
      });

      const snapshotDate = payload.date || today;
      const publishedOn = payload.published_on || now.toISOString();

      const liveSnapshot: ForexSnapshot = {
        date: snapshotDate,
        publishedAt: publishedOn,
        fetchedAt: now.toISOString(),
        source: "Nepal Rastra Bank (Official Live API)",
        isLive: true,
        freshnessStatus: "LIVE",
        ageLabel: "Live now",
        rates: parsed,
      };

      previousSnapshotCache = liveSnapshot;

      // Persist snapshot to database asynchronously
      const db = getDb();
      if (db) {
        (async () => {
          try {
            const hash = createHash("sha256")
              .update(JSON.stringify({ date: snapshotDate, rates: parsed }))
              .digest("hex")
              .slice(0, 16);

            await db.insert(schema.feedSnapshots).values({
              feedType: "NRB_FOREX",
              sourceTimestamp: publishedOn,
              payloadHash: hash,
              normalizedData: {
                date: snapshotDate,
                publishedAt: publishedOn,
                rates: parsed,
              },
              freshnessStatus: "LIVE",
              fetchedAt: now,
            });
          } catch (insertErr) {
            console.error("[forex] Failed to insert feed snapshot to DB:", insertErr);
          }
        })();
      }

      return liveSnapshot;
    }
  } catch {
    // Network, timeout, or rate-limit fallback
  }

  // 1. Try to read the most recent snapshot from PostgreSQL feed_snapshots
  const db = getDb();
  if (db) {
    try {
      const [latest] = await db
        .select()
        .from(schema.feedSnapshots)
        .where(eq(schema.feedSnapshots.feedType, "NRB_FOREX"))
        .orderBy(desc(schema.feedSnapshots.fetchedAt))
        .limit(1);

      if (latest && latest.normalizedData && (latest.normalizedData as any).rates) {
        const data = latest.normalizedData as any;
        const fetchedTime = new Date(latest.fetchedAt).getTime();
        const ageHours = (Date.now() - fetchedTime) / (1000 * 60 * 60);
        const freshnessStatus: ForexFreshnessStatus = ageHours < 24 ? "CACHED" : "STALE";
        const relativeAge = formatRelativeAge(latest.fetchedAt);

        const cachedSnapshot: ForexSnapshot = {
          date: data.date || today,
          publishedAt: data.publishedAt || latest.fetchedAt.toISOString(),
          fetchedAt: latest.fetchedAt.toISOString(),
          source: `Nepal Rastra Bank (${freshnessStatus === "CACHED" ? `Cached ${relativeAge}` : "Stale Snapshot"})`,
          isLive: false,
          freshnessStatus,
          ageLabel: `${freshnessStatus === "CACHED" ? "Cached" : "Stale"} · ${relativeAge}`,
          rates: data.rates,
        };

        return cachedSnapshot;
      }
    } catch (dbErr) {
      console.error("[forex] Failed to retrieve cached snapshot from DB:", dbErr);
    }
  }

  // 2. Try in-memory cached snapshot if available
  if (previousSnapshotCache) {
    const age = formatRelativeAge(previousSnapshotCache.fetchedAt);
    return {
      ...previousSnapshotCache,
      isLive: false,
      freshnessStatus: "CACHED",
      ageLabel: `Cached · ${age}`,
      source: `Nepal Rastra Bank (Cached · ${age})`,
    };
  }

  // 3. Fallback to verified official baseline snapshot with explicit STALE label
  return {
    date: today,
    publishedAt: now.toISOString(),
    fetchedAt: now.toISOString(),
    source: "Nepal Rastra Bank (Offline Baseline)",
    isLive: false,
    freshnessStatus: "STALE",
    ageLabel: "Stale · Offline baseline",
    rates: BASELINE_NRB_RATES,
  };
}

export function convertForeignToNpr(amount: number, buyRate: number, unit = 1): number {
  if (unit <= 0 || amount <= 0 || buyRate <= 0) return 0;
  return Number(((amount * buyRate) / unit).toFixed(2));
}

export function convertNprToForeign(nprAmount: number, sellRate: number, unit = 1): number {
  if (unit <= 0 || nprAmount <= 0 || sellRate <= 0) return 0;
  return Number(((nprAmount * unit) / sellRate).toFixed(2));
}

/** Reset in-memory snapshot cache for tests */
export function resetForexCacheForTest(snapshot?: ForexSnapshot | null): void {
  previousSnapshotCache = snapshot || null;
}
