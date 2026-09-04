/**
 * Background Jobs Registry & Executor
 */

import { JobDefinition, JobExecutionResult } from "./types";
import { runWithJobLock } from "./distributed-lock";
import { fetchNrbForexRates } from "@/lib/nepal/nrb-forex-adapter";
import { fetchNepalSeismicEvents } from "@/lib/nepal/earthquake-adapter";
import { checkDealExpirations } from "@/lib/deals/store";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const REGISTERED_JOBS: Record<string, JobDefinition> = {
  "deal-expire": {
    name: "deal-expire",
    description: "Evaluates validity timestamps of published deals and flags expired offers.",
    schedule: "0 * * * *", // Hourly
    timeoutMs: 15000,
    maxRetries: 2,
    lockDurationSec: 300,
    handler: async () => {
      const { expiredCount, expiringSoonCount } = checkDealExpirations();

      // If DB is connected, also update dealCandidates in PostgreSQL
      const db = getDb();
      if (db) {
        try {
          const now = new Date();
          const rows = await db
            .select({ id: schema.dealCandidates.id, validUntil: schema.dealCandidates.validUntil })
            .from(schema.dealCandidates)
            .where(eq(schema.dealCandidates.status, "PUBLISHED"));

          for (const r of rows) {
            if (r.validUntil && new Date(r.validUntil) < now) {
              await db
                .update(schema.dealCandidates)
                .set({ status: "EXPIRED", expiredAt: now, updatedAt: now })
                .where(eq(schema.dealCandidates.id, r.id));
            }
          }
        } catch {
          // Handled gracefully
        }
      }

      return {
        ok: true,
        itemsExpired: expiredCount,
        metadata: { expiringSoonCount },
      };
    },
  },

  "forex-sync": {
    name: "forex-sync",
    description: "Polls official Nepal Rastra Bank forex exchange rates and stores historical snapshot.",
    schedule: "*/30 * * * *", // Every 30 minutes
    timeoutMs: 10000,
    maxRetries: 3,
    lockDurationSec: 180,
    handler: async () => {
      const snapshot = await fetchNrbForexRates();
      const db = getDb();

      if (db) {
        try {
          const hash = crypto
            .createHash("sha256")
            .update(JSON.stringify(snapshot.rates))
            .digest("hex");

          await db.insert(schema.feedSnapshots).values({
            feedType: "NRB_FOREX",
            sourceTimestamp: snapshot.publishedAt,
            payloadHash: hash,
            normalizedData: {
              date: snapshot.date,
              publishedAt: snapshot.publishedAt,
              rates: snapshot.rates,
              source: snapshot.source,
            },
            freshnessStatus: snapshot.isLive ? "LIVE" : "CACHED",
          });
        } catch (err: any) {
          return {
            ok: false,
            errorCategory: "DB_WRITE_FAILURE",
            errorMessage: err?.message,
          };
        }
      }

      return {
        ok: true,
        itemsProcessed: snapshot.rates.length,
        metadata: {
          isLive: snapshot.isLive,
          date: snapshot.date,
          publishedAt: snapshot.publishedAt,
        },
      };
    },
  },

  "earthquake-sync": {
    name: "earthquake-sync",
    description: "Polls USGS seismic monitoring feed for recorded earthquakes in the Nepal region.",
    schedule: "*/15 * * * *", // Every 15 minutes
    timeoutMs: 10000,
    maxRetries: 2,
    lockDurationSec: 120,
    handler: async () => {
      const { events, isLive, source } = await fetchNepalSeismicEvents();
      const db = getDb();

      if (db) {
        try {
          const hash = crypto
            .createHash("sha256")
            .update(JSON.stringify(events))
            .digest("hex");

          await db.insert(schema.feedSnapshots).values({
            feedType: "USGS_SEISMIC",
            sourceTimestamp: new Date().toISOString(),
            payloadHash: hash,
            normalizedData: { events, source },
            freshnessStatus: isLive ? "LIVE" : "CACHED",
          });
        } catch {
          // Handled gracefully
        }
      }

      return {
        ok: true,
        itemsProcessed: events.length,
        metadata: { isLive, count: events.length },
      };
    },
  },

  "source-health-check": {
    name: "source-health-check",
    description: "Audits upstream sources and updates circuit-breaker health indicators.",
    schedule: "*/30 * * * *",
    timeoutMs: 15000,
    maxRetries: 2,
    lockDurationSec: 300,
    handler: async () => {
      const db = getDb();
      if (!db) {
        return { ok: true, itemsProcessed: 0, metadata: { mode: "demo" } };
      }

      try {
        const sourceRows = await db.select().from(schema.sources);
        let updatedCount = 0;

        for (const s of sourceRows) {
          let newStatus = "HEALTHY";
          if (s.consecutiveFailures >= 5) {
            newStatus = "DEGRADED";
          } else if (s.consecutiveFailures >= 10) {
            newStatus = "OFFLINE";
          }

          if (newStatus !== s.healthStatus) {
            await db
              .update(schema.sources)
              .set({ healthStatus: newStatus, updatedAt: new Date() })
              .where(eq(schema.sources.id, s.id));
            updatedCount++;
          }
        }

        return {
          ok: true,
          itemsProcessed: sourceRows.length,
          itemsUpdated: updatedCount,
        };
      } catch (err: any) {
        return {
          ok: false,
          errorCategory: "HEALTH_CHECK_ERROR",
          errorMessage: err?.message,
        };
      }
    },
  },
};

/**
 * Executes a registered job with distributed locking and timing metrics
 */
export async function executeJobByName(jobName: string): Promise<JobExecutionResult> {
  const job = REGISTERED_JOBS[jobName];
  if (!job) {
    return {
      ok: false,
      jobName,
      durationMs: 0,
      errorCategory: "JOB_NOT_FOUND",
      errorMessage: `Job "${jobName}" is not registered.`,
    };
  }

  const startTime = Date.now();
  const lockResult = await runWithJobLock(
    jobName,
    async () => {
      return await job.handler();
    },
    job.lockDurationSec
  );

  const durationMs = Date.now() - startTime;

  if (!lockResult.ran) {
    return {
      ok: false,
      jobName,
      durationMs,
      errorCategory: "SKIPPED_LOCKED",
      errorMessage: lockResult.reason,
    };
  }

  return {
    ...lockResult.result,
    jobName,
    durationMs,
  };
}
