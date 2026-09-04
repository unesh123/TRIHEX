/**
 * Public customer-facing order timeline.
 */

import type { StoredOrder } from "@/lib/checkout/order-store";
import { buildCustomerTimeline } from "@/lib/orders/fulfillment-checklist";

export type PublicOrderTimelineEvent = {
  at: string;
  status: string;
  message: string;
  done?: boolean;
  active?: boolean;
};

export function getPublicOrderTimeline(
  order: StoredOrder,
): PublicOrderTimelineEvent[] {
  const steps = buildCustomerTimeline({
    createdAt: order.createdAt,
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    whatsappDelivered: Boolean(order.fulfillmentWhatsappDelivered),
    deliveredAt: order.fulfillmentDeliveredAt ?? null,
  });

  const messageMap: Record<string, string> = {
    placed: "Order received. Ready for eSewa, Khalti, or mobile banking payment.",
    review: "Payment proof uploaded. Operations desk verifying receipt.",
    paid: "Payment verified. Subscription provisioning in progress.",
    delivered: "Fulfillment delivered. Access unlocked and warranty guarantee active.",
  };

  return steps.map((s) => ({
    at: s.at ?? order.createdAt,
    status: s.label,
    message: messageMap[s.key] ?? s.label,
    done: s.done,
    active: s.active,
  }));
}
