import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/bot-defense";
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
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limit = checkRateLimit(clientIp, { maxRequests: 20, windowMs: 60 * 1000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many checkout attempts. Please wait a moment." },
        { status: 429 },
      );
    }

    let body: CheckoutBody & { __website_hp?: string };
    try {
      body = (await request.json()) as CheckoutBody & { __website_hp?: string };
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    // Bot honeypot check
    if (body.__website_hp && body.__website_hp.trim().length > 0) {
      return NextResponse.json(
        { ok: false, error: "Automated submission rejected." },
        { status: 403 },
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
