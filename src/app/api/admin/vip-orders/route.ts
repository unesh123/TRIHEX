import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import {
  getAllVipOrders,
  updateVipOrderStatus,
  approveVipOrderAndActivateMember,
} from "@/lib/vip/vip-order-store";
import {
  toggleVipLock,
  allocateVipBonus,
  updateVipMember,
} from "@/lib/vip/vip-member-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const orders = await getAllVipOrders();
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

    // 2. 1-Click Approve Order & Activate VIP with Bonuses
    if (action === "APPROVE_ACTIVATE") {
      const { orderId, bonusDays, bonusPerk, customTag, adminNotes } = body;
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
