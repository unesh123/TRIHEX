import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import {
  getAllVipOrders,
  updateVipOrderStatus,
  approveVipOrderAndActivateMember,
  changeVipOrderTier,
} from "@/lib/vip/vip-order-store";
import {
  toggleVipLock,
  allocateVipBonus,
  updateVipMember,
} from "@/lib/vip/vip-member-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") !== "false";
    const orders = await getAllVipOrders(all);
    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("[VipOrdersAPI] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch VIP orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    // 1. Update Order Status
    if (action === "UPDATE_STATUS") {
      const { orderId, status, notes } = body;
      if (!orderId || !status) {
        return NextResponse.json(
          { success: false, error: "orderId and status are required." },
          { status: 400 }
        );
      }

      const updated = await updateVipOrderStatus(orderId, status, notes);
      return NextResponse.json({ success: true, order: updated });
    }

    // 2. 1-Click Approve Order & Activate VIP with Flexible Plan / Duration
    if (action === "APPROVE_ACTIVATE") {
      const {
        orderId,
        bonusDays,
        bonusPerk,
        customTag,
        adminNotes,
        overrideTier,
        overrideAmountNpr,
        customDays,
      } = body;
      if (!orderId) {
        return NextResponse.json(
          { success: false, error: "orderId is required." },
          { status: 400 }
        );
      }

      const result = await approveVipOrderAndActivateMember(orderId, {
        bonusDays: bonusDays ? Number(bonusDays) : 0,
        bonusPerk: bonusPerk || undefined,
        customTag: customTag || undefined,
        adminNotes: adminNotes || undefined,
        overrideTier: overrideTier || undefined,
        overrideAmountNpr: overrideAmountNpr ? Number(overrideAmountNpr) : undefined,
        customDays: customDays ? Number(customDays) : undefined,
      });

      return NextResponse.json({
        success: true,
        order: result.order,
        member: result.member,
      });
    }

    // 2.5 1-Click Change VIP Plan / Duration
    if (action === "CHANGE_TIER") {
      const { orderId, tier, amountNpr, customDays, adminNotes } = body;
      if (!orderId || !tier) {
        return NextResponse.json(
          { success: false, error: "orderId and tier are required." },
          { status: 400 }
        );
      }

      const result = await changeVipOrderTier(orderId, tier, {
        customDays: customDays ? Number(customDays) : undefined,
        amountNpr: amountNpr ? Number(amountNpr) : undefined,
        adminNotes,
      });

      return NextResponse.json({
        success: true,
        order: result.order,
        member: result.member,
      });
    }

    // 3. Allocate VIP Bonus to Member
    if (action === "ALLOCATE_BONUS") {
      const { memberId, bonusDays, bonusPerk } = body;
      if (!memberId) {
        return NextResponse.json(
          { success: false, error: "memberId is required." },
          { status: 400 }
        );
      }

      const updatedMember = await allocateVipBonus(
        memberId,
        Number(bonusDays) || 0,
        bonusPerk
      );
      return NextResponse.json({ success: true, member: updatedMember });
    }

    // 4. Advanced Security Lock / Unlock
    if (action === "TOGGLE_LOCK") {
      const { memberId, lock, reason } = body;
      if (!memberId) {
        return NextResponse.json(
          { success: false, error: "memberId is required." },
          { status: 400 }
        );
      }

      const updatedMember = await toggleVipLock(
        memberId,
        Boolean(lock),
        reason
      );
      return NextResponse.json({ success: true, member: updatedMember });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[VipOrdersAPI] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process VIP order action." },
      { status: 500 }
    );
  }
}
