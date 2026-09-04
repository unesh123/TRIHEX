/**
 * Distributed Job Locking Engine
 *
 * Prevents concurrent cron execution across serverless instances or background workers.
 * Uses PostgreSQL advisory locks when connected, with TTL-backed fallback for local/test mode.
 */

import { getDb } from "@/db";
import { sql } from "drizzle-orm";

interface LockHandle {
  acquired: boolean;
  lockKey: string;
  release: () => Promise<void>;
}

// Fallback in-memory locks with expiration for development/tests
const inMemoryLocks = new Map<string, number>();

/**
 * Derives a deterministic signed 32-bit integer key from a string for PostgreSQL advisory locks
 */
export function hashLockKey(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Attempts to acquire an exclusive lock for a given job name.
 * If another instance is running the job, acquired will be false.
 */
export async function acquireJobLock(jobName: string, lockDurationSec = 300): Promise<LockHandle> {
  const lockKey = `job-lock:${jobName}`;
  const now = Date.now();
  const db = getDb();

  // 1. Try PostgreSQL advisory lock if database client is available
  if (db) {
    try {
      const lockId = hashLockKey(jobName);
      const result = await db.execute<{ acquired: boolean }>(
        sql`SELECT pg_try_advisory_lock(${lockId}) as acquired;`
      );

      const isLocked = Boolean(result[0]?.acquired);

      if (!isLocked) {
        return {
          acquired: false,
          lockKey,
          release: async () => {},
        };
      }

      return {
        acquired: true,
        lockKey,
        release: async () => {
          try {
            await db.execute(sql`SELECT pg_advisory_unlock(${lockId});`);
          } catch {
            // Ignore unlock errors
          }
        },
      };
    } catch {
      // Fall through to memory lock if DB lock fails
    }
  }

  // 2. Memory lock fallback (for test/development/offline runtime)
  const existingExpire = inMemoryLocks.get(lockKey);
  if (existingExpire && existingExpire > now) {
    return {
      acquired: false,
      lockKey,
      release: async () => {},
    };
  }

  // Acquire in-memory lock with TTL
  const expiresAt = now + lockDurationSec * 1000;
  inMemoryLocks.set(lockKey, expiresAt);

  return {
    acquired: true,
    lockKey,
    release: async () => {
      inMemoryLocks.delete(lockKey);
    },
  };
}

/**
 * Helper to execute a job handler safely wrapped in a distributed lock
 */
export async function runWithJobLock<T>(
  jobName: string,
  handler: () => Promise<T>,
  lockDurationSec = 300
): Promise<{ ran: true; result: T } | { ran: false; reason: string }> {
  const lock = await acquireJobLock(jobName, lockDurationSec);

  if (!lock.acquired) {
    return {
      ran: false,
      reason: `Lock for job "${jobName}" could not be acquired (job currently executing elsewhere).`,
    };
  }

  try {
    const result = await handler();
    return { ran: true, result };
  } finally {
    await lock.release();
  }
}

/**
 * Executes a callback within a transaction-scoped PostgreSQL advisory lock (pg_try_advisory_xact_lock).
 * The lock is automatically released by PostgreSQL when the transaction commits or rolls back,
 * preventing any session-level lock leakage through pooled or serverless connections.
 */
export async function withTransactionAdvisoryLock<T>(
  jobName: string,
  handler: () => Promise<T>
): Promise<{ ran: true; result: T } | { ran: false; reason: string }> {
  const db = getDb();
  if (db && typeof (db as any).transaction === "function") {
    try {
      return await (db as any).transaction(async (tx: any) => {
        const lockId = hashLockKey(jobName);
        const result = await tx.execute(
          sql`SELECT pg_try_advisory_xact_lock(${lockId}) as acquired;`
        );
        const acquired = Boolean(result[0]?.acquired);
        if (!acquired) {
          return {
            ran: false,
            reason: `Transaction lock for "${jobName}" could not be acquired (concurrent run active).`,
          };
        }
        const res = await handler();
        return { ran: true, result: res };
      });
    } catch (err: any) {
      if (err?.message?.includes("could not be acquired")) {
        return { ran: false, reason: err.message };
      }
      throw err;
    }
  }

  // Fallback to runWithJobLock when transaction or DB is not available
  return runWithJobLock(jobName, handler);
}

