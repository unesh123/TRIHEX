import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import { getAllVipOrders } from "@/lib/vip/vip-order-store";
import type { OrderRow } from "@/components/admin/order-command-table";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const vipOrders = await getAllVipOrders(true);
    const orderRows: OrderRow[] = vipOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName || "Customer",
      customerEmail: o.customerEmail || "",
      customerPhone: o.customerPhone || "",
      subtotalMinor: o.amountMinor,
      grandTotalMinor: o.amountMinor,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      itemsSummary: o.itemsSummary || o.tierTitle || "Digital Product",
      itemCount: 1,
      paymentMethod: o.paymentMethod || "Manual QR",
      placedAt: o.placedAt,
      notes: o.notes,
    }));

    return NextResponse.json({
      success: true,
      count: orderRows.length,
      orders: orderRows,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Admin Orders API] error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load orders" },
      { status: 500 }
    );
  }
}
