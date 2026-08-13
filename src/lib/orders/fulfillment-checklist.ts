/**
 * Order fulfillment checklist — complete only when WhatsApp delivered.
 */

export type FulfillmentChecklist = {
  activated: boolean;
  emailSent: boolean;
  whatsappDelivered: boolean;
  notes: string | null;
  deliveredAt: string | null;
};

export function isFulfillmentComplete(
  checklist: Pick<FulfillmentChecklist, "whatsappDelivered">,
): boolean {
  return checklist.whatsappDelivered === true;
}

export function fulfillmentStatusLabel(
  checklist: FulfillmentChecklist,
  paymentStatus: string,
  orderStatus: string,
): string {
  if (checklist.whatsappDelivered) return "Delivered";
  if (paymentStatus === "PAID" || orderStatus === "PAID") return "To deliver";
  if (paymentStatus === "UNDER_REVIEW") return "Payment review";
  return "Awaiting payment";
}

export function buildCustomerTimeline(input: {
  createdAt: string;
  paymentStatus: string;
  orderStatus: string;
  whatsappDelivered: boolean;
  deliveredAt: string | null;
}): Array<{ key: string; label: string; done: boolean; active: boolean; at?: string }> {
  const paid =
    input.paymentStatus === "PAID" ||
    input.orderStatus === "PAID" ||
    input.orderStatus === "COMPLETED" ||
    input.orderStatus === "FULFILLED";
  const underReview =
    input.paymentStatus === "UNDER_REVIEW" ||
    input.orderStatus === "PROCESSING";
  const delivered = input.whatsappDelivered;

  return [
    {
      key: "placed",
      label: "Order Placed",
      done: true,
      active: !underReview && !paid,
      at: input.createdAt,
    },
    {
      key: "review",
      label: "Payment Under Review",
      done: paid || delivered,
      active: underReview && !paid,
    },
    {
      key: "paid",
      label: "Paid",
      done: paid || delivered,
      active: paid && !delivered,
    },
    {
      key: "delivered",
      label: "Delivered",
      done: delivered,
      active: delivered,
      at: input.deliveredAt ?? undefined,
    },
  ];
}
