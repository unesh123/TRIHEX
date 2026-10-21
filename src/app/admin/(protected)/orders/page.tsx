import { AdminHeader } from "@/components/admin/admin-header";
import { OrderCommandTable, type OrderRow } from "@/components/admin/order-command-table";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { desc, inArray } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/env";
import { getRepositories } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Command Workspace · TRIHEX Admin",
  description: "Live store orders management with interactive status changer and WhatsApp dispatch.",
};

export default async function AdminOrdersPage() {
  let orderRows: OrderRow[] = [];

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        const dbOrders = await db
          .select({
            id: schema.orders.id,
            orderNumber: schema.orders.humanReadableOrderNumber,
            customerName: schema.orders.customerName,
            customerEmail: schema.orders.customerEmail,
            customerPhone: schema.orders.customerPhone,
            subtotalMinor: schema.orders.subtotalMinor,
            grandTotalMinor: schema.orders.grandTotalMinor,
            orderStatus: schema.orders.orderStatus,
            paymentStatus: schema.orders.paymentStatus,
            fulfillmentStatus: schema.orders.fulfillmentStatus,
            placedAt: schema.orders.placedAt,
            createdAt: schema.orders.createdAt,
            orderNotes: schema.orders.orderNotes,
          })
          .from(schema.orders)
          .orderBy(desc(schema.orders.createdAt))
          .limit(100);

        const orderIds = dbOrders.map((o) => o.id);
        const items =
          orderIds.length > 0
            ? await db
                .select({
                  orderId: schema.orderItems.orderId,
                  productName: schema.orderItems.productName,
                  variantName: schema.orderItems.variantName,
                  quantity: schema.orderItems.quantity,
                })
                .from(schema.orderItems)
                .where(inArray(schema.orderItems.orderId, orderIds))
            : [];

        orderRows = dbOrders.map((o) => {
          const matchingItems = items.filter((i) => i.orderId === o.id);
          const itemsSummary = matchingItems
            .map((i) => `${i.productName} (${i.variantName})`)
            .join(", ");

          return {
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName || "Customer",
            customerEmail: o.customerEmail,
            customerPhone: o.customerPhone || "",
            subtotalMinor: o.subtotalMinor,
            grandTotalMinor: o.grandTotalMinor,
            orderStatus: o.orderStatus,
            paymentStatus: o.paymentStatus,
            fulfillmentStatus: o.fulfillmentStatus,
            itemsSummary: itemsSummary || "Subscription Access",
            itemCount: matchingItems.length || 1,
            placedAt: o.placedAt ? o.placedAt.toISOString() : o.createdAt.toISOString(),
            notes: o.orderNotes,
          };
        });
      }
    } catch (err) {
      console.error("[AdminOrdersPage] DB load error, using fallback repo:", err);
    }
  }

  // Fallback to in-memory repository if DB is unavailable or empty in dev
  if (orderRows.length === 0) {
    try {
      const repoOrders = await getRepositories().orders.listRecent(50);
      orderRows = repoOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName || "Customer",
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone || "",
        subtotalMinor: o.subtotalNprMinor,
        grandTotalMinor: o.totalNprMinor,
        orderStatus: o.status,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentWhatsappDelivered ? "DELIVERED" : "NOT_STARTED",
        itemsSummary: o.lines.map((l) => l.productSlug).join(", "),
        itemCount: o.lines.length,
        placedAt: o.createdAt,
        notes: o.notes,
      }));
    } catch {
      // Empty fallback
    }
  }

  // Also seamlessly merge in VIP orders so the admin sees every order in one unified command view
  try {
    const { getAllVipOrders } = await import("@/lib/vip/vip-order-store");
    const vipOrders = await getAllVipOrders();
    for (const vo of vipOrders) {
      if (!orderRows.some((o) => o.orderNumber.toUpperCase() === vo.orderNumber.toUpperCase())) {
        orderRows.push({
          id: vo.id,
          orderNumber: vo.orderNumber,
          customerName: vo.customerName,
          customerEmail: vo.customerEmail,
          customerPhone: vo.customerPhone,
          subtotalMinor: vo.amountMinor,
          grandTotalMinor: vo.amountMinor,
          orderStatus: vo.orderStatus,
          paymentStatus: vo.paymentStatus,
          fulfillmentStatus: vo.fulfillmentStatus,
          itemsSummary: `👑 ${vo.tierTitle}`,
          itemCount: 1,
          placedAt: vo.placedAt,
          notes: vo.notes,
        });
      }
    }
  } catch {
    // non-fatal
  }

  // Sort latest orders first
  orderRows.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

  const pendingCount = orderRows.filter((o) => o.paymentStatus !== "PAID" && o.orderStatus !== "CANCELLED").length;
  const readyCount = orderRows.filter((o) => o.paymentStatus === "PAID" && o.orderStatus !== "FULFILLED").length;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Live Orders Command Workspace"
        description="Monitor site checkouts in real-time, inspect payment proofs, change order statuses directly, and dispatch credentials via WhatsApp."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Awaiting Payment Action</p>
          <p className="mt-1.5 font-[family-name:var(--font-sora)] text-2xl font-bold text-slate-900">{pendingCount}</p>
          <p className="text-xs text-slate-500">Requires proof review or verification</p>
        </div>
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Ready to Fulfill</p>
          <p className="mt-1.5 font-[family-name:var(--font-sora)] text-2xl font-bold text-slate-900">{readyCount}</p>
          <p className="text-xs text-slate-500">Paid orders ready for WhatsApp credentials dispatch</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders Processed</p>
          <p className="mt-1.5 font-[family-name:var(--font-sora)] text-2xl font-bold text-slate-900">{orderRows.length}</p>
          <p className="text-xs text-slate-500">From live store orders database</p>
        </div>
      </div>

      <OrderCommandTable initialOrders={orderRows} />
    </div>
  );
}
