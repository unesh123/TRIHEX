import { NextResponse } from "next/server";
import { AdminApiError, requireCronSecret } from "@/lib/api/guard";
import { appendAuditEvent } from "@/lib/audit/log";
import { releaseExpiredReservations } from "@/lib/inventory/reserve";

export async function GET(request: Request) {
  try {
    requireCronSecret(request);
    const result = await releaseExpiredReservations("cron");

    await appendAuditEvent({
      action: "SYSTEM_EVENT",
      actorId: "cron",
      entityType: "inventory_reservation",
      metadata: {
        job: "release-reservations",
        released: result.released,
        errors: result.errors,
      },
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Cron job failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
