import { WatchlistAlert, WatchlistEntityType, WatchlistCondition, WatchlistTriggerResult } from "./types";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { fetchNrbForexRates } from "@/lib/nepal/nrb-forex-adapter";

let inMemoryWatchlists: WatchlistAlert[] = [];

export async function createWatchlistAlert(params: {
  userId: string;
  entityType: WatchlistEntityType;
  entityId: string;
  condition: WatchlistCondition;
  channel?: "EMAIL" | "BROWSER" | "WHATSAPP";
  targetValue?: string;
  label?: string;
}): Promise<WatchlistAlert> {
  const now = new Date().toISOString();
  const alertId = `watch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const label =
    params.label ||
    `${params.entityType} Alert: ${params.condition} ${params.targetValue ? `(${params.targetValue})` : ""}`.trim();

  const newAlert: WatchlistAlert = {
    id: alertId,
    userId: params.userId,
    entityType: params.entityType,
    entityId: params.entityId,
    condition: params.condition,
    channel: params.channel || "BROWSER",
    targetValue: params.targetValue,
    label,
    enabled: true,
    createdAt: now,
  };

  inMemoryWatchlists.unshift(newAlert);

  const db = getDb();
  if (db) {
    try {
      await db.insert(schema.watchlists).values({
        id: alertId as any,
        userId: params.userId,
        entityType: params.entityType,
        entityId: params.entityId,
        condition: params.condition,
        channel: params.channel || "BROWSER",
        targetValue: params.targetValue,
        enabled: true,
      });
    } catch (e) {
      console.error("[watchlist] Failed to insert watchlist alert into DB:", e);
    }
  }

  return newAlert;
}

export async function getWatchlistAlerts(userId: string): Promise<WatchlistAlert[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(schema.watchlists)
        .where(eq(schema.watchlists.userId, userId));

      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          entityType: r.entityType as WatchlistEntityType,
          entityId: r.entityId,
          condition: r.condition as WatchlistCondition,
          channel: (r.channel || "BROWSER") as any,
          targetValue: r.targetValue || undefined,
          label: `${r.entityType} ${r.entityId} Alert`,
          enabled: r.enabled,
          lastTriggeredAt: r.lastTriggeredAt ? r.lastTriggeredAt.toISOString() : undefined,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (e) {
      console.warn("[watchlist] Failed to query DB watchlists, falling back to memory:", e);
    }
  }

  return inMemoryWatchlists.filter((w) => w.userId === userId);
}

export async function toggleWatchlistAlert(
  alertId: string,
  enabled: boolean,
  userId: string
): Promise<boolean> {
  const item = inMemoryWatchlists.find((w) => w.id === alertId && w.userId === userId);
  if (item) {
    item.enabled = enabled;
  }

  const db = getDb();
  if (db) {
    try {
      await db
        .update(schema.watchlists)
        .set({ enabled })
        .where(and(eq(schema.watchlists.id, alertId as any), eq(schema.watchlists.userId, userId)));
      return true;
    } catch (e) {
      console.error("[watchlist] Failed to toggle alert in DB:", e);
    }
  }

  return !!item;
}

export async function deleteWatchlistAlert(alertId: string, userId: string): Promise<boolean> {
  const idx = inMemoryWatchlists.findIndex((w) => w.id === alertId && w.userId === userId);
  if (idx >= 0) {
    inMemoryWatchlists.splice(idx, 1);
  }

  const db = getDb();
  if (db) {
    try {
      await db
        .delete(schema.watchlists)
        .where(and(eq(schema.watchlists.id, alertId as any), eq(schema.watchlists.userId, userId)));
      return true;
    } catch (e) {
      console.error("[watchlist] Failed to delete alert from DB:", e);
    }
  }

  return idx >= 0;
}

/**
 * Evaluates active alerts against live data benchmarks (e.g. NRB forex snapshot).
 */
export async function evaluateWatchlistTriggers(userId: string): Promise<WatchlistTriggerResult[]> {
  const alerts = await getWatchlistAlerts(userId);
  const activeAlerts = alerts.filter((a) => a.enabled);
  const results: WatchlistTriggerResult[] = [];

  let forexSnapshot: any = null;

  for (const alert of activeAlerts) {
    if (alert.entityType === "FOREX") {
      if (!forexSnapshot) {
        forexSnapshot = await fetchNrbForexRates().catch(() => null);
      }

      if (forexSnapshot?.rates) {
        const rate = forexSnapshot.rates.find((r: any) => r.currency === alert.entityId);
        if (rate && alert.targetValue) {
          const target = Number.parseFloat(alert.targetValue);
          const currentSell = rate.sell;
          const currentBuy = rate.buy;

          if (alert.condition === "RATE_ABOVE" && currentSell >= target) {
            results.push({
              alertId: alert.id,
              triggered: true,
              reason: `${alert.entityId} sell rate is Rs. ${currentSell.toFixed(2)}, which is at or above your target of Rs. ${target.toFixed(2)}`,
              currentValue: `Rs. ${currentSell.toFixed(2)}`,
            });
            continue;
          }

          if (alert.condition === "RATE_BELOW" && currentBuy <= target) {
            results.push({
              alertId: alert.id,
              triggered: true,
              reason: `${alert.entityId} buy rate dropped to Rs. ${currentBuy.toFixed(2)}, below your target of Rs. ${target.toFixed(2)}`,
              currentValue: `Rs. ${currentBuy.toFixed(2)}`,
            });
            continue;
          }
        }
      }
    }

    results.push({
      alertId: alert.id,
      triggered: false,
      reason: "Condition not currently met or monitoring active",
      currentValue: alert.currentValue || "Active",
    });
  }

  return results;
}

export function resetWatchlistsStoreForTest(items: WatchlistAlert[] = []): void {
  inMemoryWatchlists = [...items];
}
