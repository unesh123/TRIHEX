import { NextResponse } from "next/server";
import {
  getOrderByNumber,
  getPublicOrderTimeline,
} from "@/lib/checkout/order-store";
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
  if (!orderNumber) {
    return NextResponse.json(
      { ok: false, error: "Order number is required." },
      { status: 400 },
    );
  }

  const email = body.email?.trim();
  const phone = body.phone?.trim();

  if (!email && !phone) {
    return NextResponse.json(
      { ok: false, error: "Provide the email or phone used at checkout." },
      { status: 400 },
    );
  }

  if (phone && !isValidNepaliPhone(phone)) {
    return NextResponse.json(
      { ok: false, error: "Phone must be a valid Nepali mobile number." },
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

  return NextResponse.json({
    ok: true,
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
    timeline: getPublicOrderTimeline(order),
  });
}
