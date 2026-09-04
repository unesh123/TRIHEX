/**
 * Background Job & Scheduler Types
 */

export interface JobExecutionResult {
  ok: boolean;
  jobName: string;
  durationMs: number;
  itemsProcessed?: number;
  itemsCreated?: number;
  itemsUpdated?: number;
  itemsExpired?: number;
  errorCategory?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface JobDefinition {
  name: string;
  description: string;
  schedule: string;
  timeoutMs: number;
  maxRetries: number;
  lockDurationSec: number;
  handler: () => Promise<Omit<JobExecutionResult, "jobName" | "durationMs">>;
}

export type JobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED_LOCKED";
