import { NextResponse } from "next/server";
import { AdminApiError, requireCronSecret } from "@/lib/api/guard";
import { appendAuditEvent } from "@/lib/audit/log";
import { executeJobByName, REGISTERED_JOBS } from "@/lib/jobs/registry";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobName: string }> }
) {
  try {
    requireCronSecret(request);
    const { jobName } = await params;

    const result = await executeJobByName(jobName);

    await appendAuditEvent({
      action: "SYSTEM_EVENT",
      actorId: "cron",
      entityType: "background_job",
      metadata: {
        jobName,
        ok: result.ok,
        durationMs: result.durationMs,
        itemsProcessed: result.itemsProcessed,
        errorCategory: result.errorCategory,
      },
    });

    if (!result.ok && result.errorCategory === "JOB_NOT_FOUND") {
      return NextResponse.json(
        {
          ok: false,
          error: result.errorMessage,
          availableJobs: Object.keys(REGISTERED_JOBS),
        },
        { status: 404 }
      );
    }

    if (!result.ok && result.errorCategory === "SKIPPED_LOCKED") {
      return NextResponse.json(
        {
          ok: false,
          status: "SKIPPED_LOCKED",
          message: result.errorMessage,
        },
        { status: 423 } // 423 Locked
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Job execution failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ jobName: string }> }
) {
  return GET(request, props);
}
