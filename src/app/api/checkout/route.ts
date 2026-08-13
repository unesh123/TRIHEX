import { NextResponse } from "next/server";
import {
  createOrder,
  type PaymentMethodPreference,
} from "@/lib/checkout/create-order";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CheckoutBody {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: PaymentMethodPreference;
  lines?: {
    productSlug: string;
    variantSku: string;
    quantity: number;
    warranty?: "none" | "protected";
  }[];
  customerNotes?: string;
  marketingConsent?: boolean;
  whatsAppUpdatesConsent?: boolean;
}

const ALLOWED_METHODS: PaymentMethodPreference[] = [
  "ESEWA_MANUAL",
  "KHALTI_MANUAL",
  "BANK_TRANSFER",
];

export async function POST(request: Request) {
  try {
    let body: CheckoutBody;
    try {
      body = (await request.json()) as CheckoutBody;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    if (!body.paymentMethod || !ALLOWED_METHODS.includes(body.paymentMethod)) {
      return NextResponse.json(
        { ok: false, error: "Select a valid payment method." },
        { status: 400 },
      );
    }

    const result = await createOrder({
      customerName: body.customerName ?? "",
      customerEmail: body.customerEmail ?? "",
      customerPhone: body.customerPhone ?? "",
      paymentMethod: body.paymentMethod,
      lines: body.lines ?? [],
      customerNotes: body.customerNotes,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, code: result.code },
        { status: result.code === "NOT_FOUND" ? 404 : 422 },
      );
    }

    // createOrder already persists the order — do not save again
    const order = result.order;

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
      secureToken: order.secureToken,
      totalNprMinor: order.totalNprMinor,
      paymentMethod: order.paymentMethod,
      marketingConsent: Boolean(body.marketingConsent),
      whatsAppUpdatesConsent: Boolean(body.whatsAppUpdatesConsent),
    });
  } catch (err) {
    console.error("[checkout] failed", err);
    const message =
      err instanceof Error ? err.message : "Checkout failed unexpectedly.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
