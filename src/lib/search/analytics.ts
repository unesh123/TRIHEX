import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { createHash } from "node:crypto";

export interface SearchAnalyticsItem {
  id: string;
  queryText: string;
  normalizedQuery: string;
  resultCount: number;
  clickedEntityType?: string;
  clickedEntityId?: string;
  ipHash?: string;
  createdAt: string;
}

export interface ZeroResultInsight {
  query: string;
  count: number;
  lastSearchedAt: string;
}

export interface TopQueryInsight {
  query: string;
  count: number;
  lastResultCount: number;
  lastSearchedAt: string;
}

export interface SearchAnalyticsSummary {
  totalSearches: number;
  zeroResultCount: number;
  zeroResultQueries: ZeroResultInsight[];
  topQueries: TopQueryInsight[];
  recentSearches: SearchAnalyticsItem[];
}

// In-memory buffer for offline mode and tests
let inMemorySearchLogs: SearchAnalyticsItem[] = [
  {
    id: "init-1",
    queryText: "claude 3.7",
    normalizedQuery: "claude 3.7",
    resultCount: 4,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "init-2",
    queryText: "midjourney v7 promo",
    normalizedQuery: "midjourney v7 promo",
    resultCount: 0, // Demand insight!
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "init-3",
    queryText: "deepseek r1 api key",
    normalizedQuery: "deepseek r1 api key",
    resultCount: 0, // Demand insight!
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

/**
 * Anonymizes an IP address with SHA-256 for privacy compliance.
 */
export function hashIpForAnalytics(ip: string): string {
  return createHash("sha256").update(ip + "TRIHEX_SEARCH_SALT").digest("hex").slice(0, 16);
}

/**
 * Records a search query into analytics store (PostgreSQL + in-memory fallback).
 */
export async function recordSearchQuery(params: {
  query: string;
  resultCount: number;
  ipHash?: string;
  clickedEntityType?: string;
  clickedEntityId?: string;
}): Promise<void> {
  const normalized = params.query.trim().toLowerCase().replace(/\s+/g, " ");
  if (normalized.length < 2) return;

  const now = new Date();
  const id = `sa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const entry: SearchAnalyticsItem = {
    id,
    queryText: params.query.trim().slice(0, 200),
    normalizedQuery: normalized.slice(0, 200),
    resultCount: params.resultCount,
    ipHash: params.ipHash,
    clickedEntityType: params.clickedEntityType,
    clickedEntityId: params.clickedEntityId,
    createdAt: now.toISOString(),
  };

  inMemorySearchLogs.unshift(entry);
  if (inMemorySearchLogs.length > 500) {
    inMemorySearchLogs.pop();
  }

  const db = getDb();
  if (db) {
    try {
      await db.insert(schema.searchAnalytics).values({
        queryText: entry.queryText,
        normalizedQuery: entry.normalizedQuery,
        resultCount: entry.resultCount,
        ipHash: entry.ipHash,
        clickedEntityType: entry.clickedEntityType,
        clickedEntityId: entry.clickedEntityId,
        createdAt: now,
      });
    } catch (e) {
      console.error("[search-analytics] Failed to log search event to DB:", e);
    }
  }
}

/**
 * Aggregates search analytics for the Admin Demand Intelligence dashboard.
 */
export async function getSearchAnalyticsSummary(): Promise<SearchAnalyticsSummary> {
  const db = getDb();
  if (db) {
    try {
      const allRows = await db
        .select()
        .from(schema.searchAnalytics)
        .orderBy(desc(schema.searchAnalytics.createdAt))
        .limit(500);

      if (allRows.length > 0) {
        return aggregateAnalyticsRows(
          allRows.map((r) => ({
            id: r.id,
            queryText: r.queryText,
            normalizedQuery: r.normalizedQuery,
            resultCount: r.resultCount,
            ipHash: r.ipHash || undefined,
            clickedEntityType: r.clickedEntityType || undefined,
            clickedEntityId: r.clickedEntityId || undefined,
            createdAt: r.createdAt.toISOString(),
          }))
        );
      }
    } catch (e) {
      console.error("[search-analytics] DB read failed, falling back to memory:", e);
    }
  }

  return aggregateAnalyticsRows(inMemorySearchLogs);
}

function aggregateAnalyticsRows(rows: SearchAnalyticsItem[]): SearchAnalyticsSummary {
  const totalSearches = rows.length;
  let zeroResultCount = 0;

  const queryCounts = new Map<string, { count: number; lastResultCount: number; lastSearchedAt: string }>();
  const zeroCounts = new Map<string, { count: number; lastSearchedAt: string }>();

  for (const item of rows) {
    const q = item.normalizedQuery;

    // Top queries aggregation
    const existing = queryCounts.get(q) || { count: 0, lastResultCount: item.resultCount, lastSearchedAt: item.createdAt };
    existing.count += 1;
    if (new Date(item.createdAt) > new Date(existing.lastSearchedAt)) {
      existing.lastSearchedAt = item.createdAt;
      existing.lastResultCount = item.resultCount;
    }
    queryCounts.set(q, existing);

    // Zero-result aggregation
    if (item.resultCount === 0) {
      zeroResultCount += 1;
      const existingZero = zeroCounts.get(q) || { count: 0, lastSearchedAt: item.createdAt };
      existingZero.count += 1;
      if (new Date(item.createdAt) > new Date(existingZero.lastSearchedAt)) {
        existingZero.lastSearchedAt = item.createdAt;
      }
      zeroCounts.set(q, existingZero);
    }
  }

  const topQueries: TopQueryInsight[] = Array.from(queryCounts.entries())
    .map(([query, val]) => ({
      query,
      count: val.count,
      lastResultCount: val.lastResultCount,
      lastSearchedAt: val.lastSearchedAt,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const zeroResultQueries: ZeroResultInsight[] = Array.from(zeroCounts.entries())
    .map(([query, val]) => ({
      query,
      count: val.count,
      lastSearchedAt: val.lastSearchedAt,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    totalSearches,
    zeroResultCount,
    zeroResultQueries,
    topQueries,
    recentSearches: rows.slice(0, 20),
  };
}

/** Reset in-memory search analytics for tests */
export function resetSearchAnalyticsForTest(items?: SearchAnalyticsItem[]): void {
  inMemorySearchLogs = items ? [...items] : [];
}
