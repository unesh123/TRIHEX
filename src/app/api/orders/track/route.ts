import { NextResponse } from "next/server";
import {
  getOrderByNumber,
  getPublicOrderTimeline,
} from "@/lib/checkout/order-store";
import { getRepositories } from "@/lib/repositories";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";
import {
  getVipMemberByPhone,
  getVipTagMetadata,
  type VipMember,
} from "@/lib/vip/vip-member-store";
import { isValidNepaliPhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface TrackBody {
  orderNumber?: string;
  email?: string;
  phone?: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

export async function POST(request: Request) {
  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const orderNumber = body.orderNumber?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();

  // 1. PHONE-ONLY LOOKUP: Customer tracking their VIP status and orders via mobile number
  if (phone && !orderNumber) {
    const cleanPhone = normalizePhone(phone);
    const digitsOnly = cleanPhone.replace(/\D/g, "");

    // Look up VIP Member status
    const vipMember: VipMember | null = await getVipMemberByPhone(cleanPhone);
    const vipTagMeta = vipMember ? getVipTagMetadata(vipMember.vipTag) : null;

    // Look up orders matching this phone number
    const matchingOrders: Array<{
      orderNumber: string;
      status: string;
      paymentStatus: string;
      totalNprMinor: number;
      createdAt: string;
      itemsSummary?: string;
      whatsappDelivered?: boolean;
    }> = [];

    try {
      const db = getDb();
      if (db) {
        const rows = await db
          .select()
          .from(schema.orders)
          .where(
            or(
              eq(schema.orders.customerPhone, cleanPhone),
              ilike(schema.orders.customerPhone, `%${digitsOnly.slice(-8)}%`),
            ),
          )
          .orderBy(desc(schema.orders.createdAt))
          .limit(10);

        for (const r of rows) {
          matchingOrders.push({
            orderNumber: r.humanReadableOrderNumber,
            status: r.orderStatus,
            paymentStatus: r.paymentStatus,
            totalNprMinor: r.grandTotalMinor,
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
            whatsappDelivered: Boolean(r.fulfillmentWhatsappDelivered),
          });
        }
      }
    } catch {
      // Offline fallback: check recent repository orders
      try {
        const repos = getRepositories();
        const recent = await repos.orders.listRecent(30);
        for (const o of recent) {
          if (
            o.customerPhone &&
            normalizePhone(o.customerPhone).includes(digitsOnly.slice(-8))
          ) {
            matchingOrders.push({
              orderNumber: o.orderNumber,
              status: o.status,
              paymentStatus: o.paymentStatus,
              totalNprMinor: o.totalNprMinor,
              createdAt: o.createdAt,
              whatsappDelivered: Boolean(o.fulfillmentWhatsappDelivered),
            });
          }
        }
      } catch {
        // Soft fail
      }
    }

    if (!vipMember && matchingOrders.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `No orders or VIP clearance found for mobile ${cleanPhone}. If you just placed an order, please allow 1 minute or message WhatsApp.`,
        },
        { status: 404 },
      );
    }

    // Latest order timeline if available
    let latestOrderTimeline: ReturnType<typeof getPublicOrderTimeline> = [];
    let latestOrderDetails = null;

    if (matchingOrders.length > 0) {
      const topOrder = await getOrderByNumber(matchingOrders[0].orderNumber);
      if (topOrder) {
        latestOrderTimeline = getPublicOrderTimeline(topOrder);
        latestOrderDetails = {
          orderNumber: topOrder.orderNumber,
          status: topOrder.status,
          paymentStatus: topOrder.paymentStatus,
          totalNprMinor: topOrder.totalNprMinor,
          currency: topOrder.currency,
          createdAt: topOrder.createdAt,
          secureToken: topOrder.secureToken,
          whatsappDelivered: Boolean(topOrder.fulfillmentWhatsappDelivered),
          deliveredAt: topOrder.fulfillmentDeliveredAt ?? null,
        };
      }
    }

    return NextResponse.json({
      ok: true,
      mode: "phone_lookup",
      phone: cleanPhone,
      vip: vipMember
        ? {
            isVip: vipMember.status === "ACTIVE",
            tier: vipMember.tier,
            tierName: vipMember.tierName,
            vipTag: vipMember.vipTag,
            tagMeta: vipTagMeta,
            status: vipMember.status,
            name: vipMember.name,
            expiresAt: vipMember.expiresAt,
            isLifetime: vipMember.isLifetime,
            verificationToken: vipMember.verificationToken,
            totalOrders: vipMember.totalOrders,
            totalSpentNpr: vipMember.totalSpentNpr,
          }
        : null,
      orders: matchingOrders,
      latestOrder: latestOrderDetails || (matchingOrders[0] ? { ...matchingOrders[0], timeline: [] } : null),
      timeline: latestOrderTimeline,
    });
  }

  // 2. ORDER NUMBER LOOKUP (Standard Order Tracking)
  if (!orderNumber) {
    return NextResponse.json(
      { ok: false, error: "Enter your Order Number or your Nepali Mobile Number." },
      { status: 400 },
    );
  }

  if (!email && !phone) {
    return NextResponse.json(
      { ok: false, error: "Provide the email or mobile phone used at checkout." },
      { status: 400 },
    );
  }

  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: "Order not found. Check the order number and try again." },
      { status: 404 },
    );
  }

  const emailMatch =
    email && normalizeEmail(email) === normalizeEmail(order.customerEmail);
  const phoneMatch =
    phone && normalizePhone(phone) === normalizePhone(order.customerPhone);

  if (!emailMatch && !phoneMatch) {
    return NextResponse.json(
      { ok: false, error: "Details do not match this order." },
      { status: 403 },
    );
  }

  // Also check if customer has a VIP tag
  const phoneToCheck = order.customerPhone || phone || "";
  const vipMember = phoneToCheck ? await getVipMemberByPhone(phoneToCheck) : null;
  const vipTagMeta = vipMember ? getVipTagMetadata(vipMember.vipTag) : null;

  return NextResponse.json({
    ok: true,
    mode: "order_lookup",
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalNprMinor: order.totalNprMinor,
      currency: order.currency,
      createdAt: order.createdAt,
      secureToken: order.secureToken,
      whatsappDelivered: Boolean(order.fulfillmentWhatsappDelivered),
      deliveredAt: order.fulfillmentDeliveredAt ?? null,
    },
    vip: vipMember
      ? {
          isVip: vipMember.status === "ACTIVE",
          tier: vipMember.tier,
          tierName: vipMember.tierName,
          vipTag: vipMember.vipTag,
          tagMeta: vipTagMeta,
          status: vipMember.status,
          name: vipMember.name,
          expiresAt: vipMember.expiresAt,
          isLifetime: vipMember.isLifetime,
        }
      : null,
    timeline: getPublicOrderTimeline(order),
  });
}
