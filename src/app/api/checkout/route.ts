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

    // Automatically register customer mobile number in VIP intelligence store for instant phone tracking
    if (body.customerPhone && body.customerPhone.trim().length >= 7) {
      try {
        const { registerOrUpdateCustomerVip } = await import("@/lib/vip/vip-member-store");

        // Detect if this order contains a VIP Pass
        const vipLine = body.lines?.find((l) =>
          l.productSlug?.startsWith("trihex-vip-pass") || l.variantSku?.startsWith("THX-VIP-")
        );
        let vipTier: "1_MONTH" | "6_MONTHS" | "LIFETIME" | "NORMAL" = "NORMAL";
        let vipTag: "VIP" | "PRO" | "STARTER" | "NORMAL" = "NORMAL";
        let isLifetime = false;

        if (vipLine) {
          const s = (vipLine.productSlug + " " + vipLine.variantSku).toLowerCase();
          if (s.includes("life")) {
            vipTier = "LIFETIME";
            vipTag = "VIP";
            isLifetime = true;
          } else if (s.includes("6-month") || s.includes("6m")) {
            vipTier = "6_MONTHS";
            vipTag = "PRO";
          } else {
            vipTier = "1_MONTH";
            vipTag = "VIP";
          }
        }

        await registerOrUpdateCustomerVip({
          phone: body.customerPhone.trim(),
          name: body.customerName?.trim(),
          email: body.customerEmail?.trim(),
          tier: vipTier,
          vipTag: vipTag,
          status: "PENDING_VERIFICATION",
          amountNpr: Math.round(order.totalNprMinor / 100),
          adminNotes: vipLine
            ? `VIP Pass Order #${order.orderNumber} (${vipTier}). Method: ${order.paymentMethod}`
            : `Storefront Order #${order.orderNumber}. Method: ${order.paymentMethod}`,
        });
      } catch (syncErr) {
        console.warn("[checkout] VIP member sync note:", syncErr);
      }
    }

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
