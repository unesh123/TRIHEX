"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import { assertPermission } from "@/lib/auth/permissions";
import { updateQuoteStatus, type QuoteStatus } from "@/lib/quotes/store";

const QUOTE_STATUSES = new Set<QuoteStatus>([
  "REQUESTED",
  "SCOPING",
  "PROPOSAL_READY",
  "APPROVED",
  "DECLINED",
  "EXPIRED",
  "CONVERTED",
]);

export async function updateQuoteStatusAction(formData: FormData) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) throw new Error("Unauthorized");
  assertPermission(gate.session.role, "support:manage");

  const quoteId = String(formData.get("quoteId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as QuoteStatus;
  const message = String(formData.get("message") ?? "").trim();
  if (!quoteId || !QUOTE_STATUSES.has(status)) {
    throw new Error("Invalid quote update.");
  }

  const updated = await updateQuoteStatus({
    quoteId,
    status,
    message,
    // Auth IDs and profile IDs are intentionally not conflated; the audit entry
    // is still created with an operator-visible status change.
    actorId: null,
  });
  if (!updated) throw new Error("Quote not found.");

  revalidatePath("/admin/quotes");
  revalidatePath(`/quotes/${updated.secureToken}`);
}
