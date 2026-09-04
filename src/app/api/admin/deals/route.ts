import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import {
  getAllDealCandidates,
  getDealCandidateBySlug,
  approveDeal,
  rejectDeal,
  updateDeal,
  checkDealExpirations,
} from "@/lib/deals/store";
import { verifyVendorDealClaim } from "@/lib/deals/vendor-verification";
import { appendAuditEvent } from "@/lib/audit/log";

export const runtime = "nodejs";

export async function GET() {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const expirationStats = checkDealExpirations();
  const deals = getAllDealCandidates();

  return NextResponse.json({
    ok: true,
    deals,
    stats: {
      total: deals.length,
      published: deals.filter((d) => d.status === "PUBLISHED").length,
      verified: deals.filter((d) => d.status === "VERIFIED").length,
      needsReview: deals.filter((d) => d.status === "NEEDS_REVIEW").length,
      expired: deals.filter((d) => d.status === "EXPIRED").length,
      expiringSoon: expirationStats.expiringSoonCount,
    },
  });
}

export async function POST(req: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, candidateId, approvalType, reason, updates, assignedProductId } = body;
    const actorId = gate.session.userId ?? "admin";

    if (!candidateId) {
      return NextResponse.json({ ok: false, error: "candidateId is required" }, { status: 400 });
    }

    if (action === "verify") {
      const candidates = getAllDealCandidates();
      const candidate = candidates.find((c) => c.id === candidateId);
      if (!candidate) {
        return NextResponse.json({ ok: false, error: "Candidate not found" }, { status: 404 });
      }

      const { updatedCandidate, report } = await verifyVendorDealClaim(candidate);
      updateDeal(candidateId, updatedCandidate, actorId);

      await appendAuditEvent({
        action: "DEAL_VERIFIED",
        actorId,
        entityType: "deal_candidate",
        entityId: candidateId,
        metadata: { score: report.score, claimsMatch: report.claimsMatch },
      });

      return NextResponse.json({ ok: true, deal: updatedCandidate, report });
    }

    if (action === "approve") {
      const updated = approveDeal(
        candidateId,
        approvalType === "PAID" ? "PAID" : "FREE",
        actorId,
        assignedProductId
      );
      if (!updated) {
        return NextResponse.json({ ok: false, error: "Could not approve deal" }, { status: 404 });
      }

      await appendAuditEvent({
        action: "DEAL_APPROVED",
        actorId,
        entityType: "deal_candidate",
        entityId: candidateId,
        metadata: { approvalType, assignedProductId },
      });

      return NextResponse.json({ ok: true, deal: updated });
    }

    if (action === "reject") {
      const updated = rejectDeal(candidateId, reason || "Rejected by admin review", actorId);
      if (!updated) {
        return NextResponse.json({ ok: false, error: "Could not reject deal" }, { status: 404 });
      }

      await appendAuditEvent({
        action: "DEAL_REJECTED",
        actorId,
        entityType: "deal_candidate",
        entityId: candidateId,
        metadata: { reason },
      });

      return NextResponse.json({ ok: true, deal: updated });
    }

    if (action === "update") {
      const updated = updateDeal(candidateId, updates || {}, actorId);
      if (!updated) {
        return NextResponse.json({ ok: false, error: "Could not update deal" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, deal: updated });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[admin] deal action failed", err);
    return NextResponse.json({ ok: false, error: err?.message || "Action failed" }, { status: 500 });
  }
}
