import { safeFetch } from "@/lib/ingestion/safe-fetch";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createHash } from "node:crypto";
import { NepalFeedResult } from "./types";

export * from "./forex-shared";
import { ForexSnapshot, ForexFreshnessStatus, BASELINE_NRB_RATES, formatRelativeAge, CurrencyRate } from "./forex-shared";


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


/** Reset in-memory snapshot cache for tests */
export function resetForexCacheForTest(snapshot?: ForexSnapshot | null): void {
  previousSnapshotCache = snapshot || null;
}

export async function fetchNrbForexFeed(): Promise<NepalFeedResult<ForexSnapshot>> {
  const snapshot = await fetchNrbForexRates();
  return {
    status: snapshot.freshnessStatus,
    data: snapshot,
    sourceName: snapshot.source,
    sourceUrl: "https://www.nrb.org.np/api/forex/v1/rates",
    sourceTimestamp: snapshot.publishedAt,
    fetchedAt: snapshot.fetchedAt,
    notice: snapshot.freshnessStatus === "STALE" ? "Official offline baseline active due to NRB API unavailability." : undefined,
  };
}
