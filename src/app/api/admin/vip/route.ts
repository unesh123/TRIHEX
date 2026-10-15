import { NextResponse } from "next/server";
import {
  getAllVipVaultItems,
  addVipVaultItem,
  updateVipVaultItem,
  deleteVipVaultItem,
  toggleVipItemWorking,
  toggleVipItemStatus,
} from "@/lib/vip/vip-store";

export async function GET() {
  const items = getAllVipVaultItems();
  return NextResponse.json({ success: true, count: items.length, items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, item, isWorking, status } = body;

    if (action === "create" && item) {
      const created = addVipVaultItem({
        id: item.id || `vip-${Date.now()}`,
        title: item.title,
        category: item.category || "VIP ACCESS & CHATS",
        tag: item.tag || "EXCLUSIVE ACCESS",
        summary: item.summary,
        boldItems: Array.isArray(item.boldItems) ? item.boldItems : [item.boldItems].filter(Boolean),
        status: item.status || "EXCLUSIVE",
        isWorking: item.isWorking ?? true,
      });
      return NextResponse.json({ success: true, item: created });
    }

    if (action === "toggle-working" && id) {
      const updated = toggleVipItemWorking(id, isWorking);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, item: updated });
    }

    if (action === "update-status" && id && status) {
      const updated = toggleVipItemStatus(id, status);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, item: updated });
    }

    if (action === "update" && id && item) {
      const updated = updateVipVaultItem(id, item);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, item: updated });
    }

    if (action === "delete" && id) {
      const deleted = deleteVipVaultItem(id);
      return NextResponse.json({ success: deleted });
    }

    return NextResponse.json({ success: false, error: "Invalid action or parameters" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
