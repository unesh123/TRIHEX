import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import { assertPermission } from "@/lib/auth/permissions";
import {
  isYouComConfigured,
  searchPublicWebWithYouCom,
  YouComNotConfiguredError,
} from "@/lib/ai/you-com";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    assertPermission(gate.session.role, "support:manage");
  } catch {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  if (!isYouComConfigured()) {
    return NextResponse.json(
      { ok: false, error: "You.com research is not configured for this deployment." },
      { status: 503 },
    );
  }

  let body: { query?: unknown; count?: unknown };
  try {
    body = (await request.json()) as { query?: unknown; count?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  try {
    const results = await searchPublicWebWithYouCom({
      query: String(body.query ?? ""),
      count: typeof body.count === "number" ? body.count : undefined,
    });
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    if (error instanceof YouComNotConfiguredError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Research failed." },
      { status: 400 },
    );
  }
}
