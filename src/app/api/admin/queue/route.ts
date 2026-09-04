import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import { getAllDealCandidates, updateDealCandidate, approveDeal } from "@/lib/deals/store";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateQueueSchema = z.object({
  dealId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "UPDATE"]),
  approvalType: z.enum(["FREE", "PAID"]).optional(),
  assignedProductId: z.string().optional(),
  promoCode: z.string().optional(),
  eligibility: z.string().optional(),
});

export async function GET() {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = getAllDealCandidates();
  return NextResponse.json({ deals: all });
}

export async function POST(req: NextRequest) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = UpdateQueueSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 422 });
    }

    const { dealId, action, approvalType, assignedProductId, promoCode, eligibility } = parsed.data;

    if (action === "APPROVE") {
      const approved = approveDeal(dealId, approvalType || "FREE", gate.session.email || "admin", assignedProductId);
      return NextResponse.json({ success: true, deal: approved });
    }

    if (action === "REJECT") {
      const rejected = updateDealCandidate(
        dealId,
        { status: "REJECTED" },
        gate.session.email || "admin"
      );
      return NextResponse.json({ success: true, deal: rejected });
    }

    if (action === "UPDATE") {
      const updated = updateDealCandidate(
        dealId,
        {
          promoCode,
          eligibility,
        },
        gate.session.email || "admin"
      );
      return NextResponse.json({ success: true, deal: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[AdminQueueAPI] Error updating deal queue:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
