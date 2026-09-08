import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/env";
import { appendAuditEvent } from "@/lib/audit/log";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, title, email, whatsapp } = body;

    if (!whatsapp) {
      return NextResponse.json({ ok: false, error: "WhatsApp number required" }, { status: 400 });
    }

    // Append to audit trail as a captured lead
    await appendAuditEvent({
      action: "VAULT_ACCESS_UNLOCKED",
      actorId: whatsapp,
      entityType: "vault_item",
      entityId: itemId || "vault-lead",
      metadata: { title, email, whatsapp },
    }).catch(() => {});

    return NextResponse.json({ ok: true, message: "Access unlocked successfully" });
  } catch {
    return NextResponse.json({ ok: true }); // Always return 200 to not block customer unlock
  }
}
