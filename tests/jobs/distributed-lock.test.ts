import { describe, it, expect } from "vitest";
import {
  hashLockKey,
  acquireJobLock,
  runWithJobLock,
  withTransactionAdvisoryLock,
} from "@/lib/jobs/distributed-lock";
import { executeJobByName, REGISTERED_JOBS } from "@/lib/jobs/registry";

describe("Distributed Job Locking & Scheduler Engine", () => {
  it("computes deterministic 32-bit integer hashes for lock names", () => {
    const hash1 = hashLockKey("forex-sync");
    const hash2 = hashLockKey("forex-sync");
    const hashOther = hashLockKey("earthquake-sync");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashOther);
    expect(Number.isInteger(hash1)).toBe(true);
  });

  it("prevents concurrent execution of the same job key", async () => {
    const testJobKey = `unit-test-lock-${Date.now()}`;

    // First acquire succeeds
    const lock1 = await acquireJobLock(testJobKey, 60);
    expect(lock1.acquired).toBe(true);

    // Second concurrent acquire fails
    const lock2 = await acquireJobLock(testJobKey, 60);
    expect(lock2.acquired).toBe(false);

    // Release lock1
    await lock1.release();

    // Third acquire succeeds after release
    const lock3 = await acquireJobLock(testJobKey, 60);
    expect(lock3.acquired).toBe(true);
    await lock3.release();
  });

  it("runWithJobLock automatically releases lock on completion and on error", async () => {
    const jobKey = `unit-test-wrapper-${Date.now()}`;

    // Normal execution
    const run1 = await runWithJobLock(jobKey, async () => {
      return "SUCCESS_DATA";
    });
    expect(run1.ran).toBe(true);
    if (run1.ran) expect(run1.result).toBe("SUCCESS_DATA");

    // Error execution releases lock
    await expect(
      runWithJobLock(jobKey, async () => {
        throw new Error("Job intentional failure");
      })
    ).rejects.toThrow("Job intentional failure");

    // Lock was released, next run must succeed
    const run2 = await runWithJobLock(jobKey, async () => "SECOND_SUCCESS");
    expect(run2.ran).toBe(true);
  });

  it("executes registered deal-expire job cleanly", async () => {
    expect(REGISTERED_JOBS["deal-expire"]).toBeDefined();
    const result = await executeJobByName("deal-expire");

    expect(result.ok).toBe(true);
    expect(result.jobName).toBe("deal-expire");
    expect(typeof result.durationMs).toBe("number");
  });

  it("returns clean error result for unregistered job", async () => {
    const result = await executeJobByName("non-existent-job-12345");

    expect(result.ok).toBe(false);
    expect(result.errorCategory).toBe("JOB_NOT_FOUND");
  });

  it("withTransactionAdvisoryLock executes safely and releases lock on normal exit or crash", async () => {
    const jobKey = `tx-lock-test-${Date.now()}`;

    const res1 = await withTransactionAdvisoryLock(jobKey, async () => {
      return { status: "PROCESSED" };
    });
    expect(res1.ran).toBe(true);
    if (res1.ran) expect(res1.result.status).toBe("PROCESSED");

    // Crash simulation releases lock
    await expect(
      withTransactionAdvisoryLock(jobKey, async () => {
        throw new Error("Worker crash simulation");
      })
    ).rejects.toThrow("Worker crash simulation");

    // Immediately available for next invocation
    const res2 = await withTransactionAdvisoryLock(jobKey, async () => "RECOVERED");
    expect(res2.ran).toBe(true);
    if (res2.ran) expect(res2.result).toBe("RECOVERED");
  });
});

