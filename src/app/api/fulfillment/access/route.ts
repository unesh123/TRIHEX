import { NextResponse } from "next/server";
import {
  verifySignedDeliveryToken,
  getDeliverableBySecretId,
} from "@/lib/fulfillment/secrets-store";
import { getOrderByNumber } from "@/lib/checkout/order-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing fulfillment token. Please use the secure delivery link from your verified order page.",
      },
      { status: 400 }
    );
  }

  const payload = verifySignedDeliveryToken(token);
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This delivery link has expired or the cryptographic signature is invalid. If you purchased this package, please message TRIHEX Support on WhatsApp with your order number for a refreshed access token.",
      },
      { status: 403 }
    );
  }

  // Cross-verify with database order status
  try {
    const order = await getOrderByNumber(payload.orderNumber);
    if (order) {
      const isPaid =
        order.status === "PAID" ||
        order.status === "COMPLETED" ||
        order.paymentStatus === "PAID" ||
        order.paymentStatus === "VERIFIED";

      if (!isPaid) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Payment verification for this order is still pending. Once verified by our operations team, access will automatically unlock.",
          },
          { status: 402 }
        );
      }
    }
  } catch (err) {
    console.warn("Fulfillment access DB verification warning:", err);
  }

  const deliverable = getDeliverableBySecretId(payload.secretId);
  if (!deliverable) {
    return NextResponse.json(
      {
        ok: false,
        error: "Deliverable package not found in server secret registry.",
      },
      { status: 404 }
    );
  }

  if (deliverable.downloadUrl) {
    return NextResponse.redirect(deliverable.downloadUrl, 307);
  }

  return NextResponse.json({
    ok: true,
    title: deliverable.title,
    instructions: deliverable.accessInstructions,
    licenseCode: deliverable.licenseCode ?? null,
  });
}
