/**
 * Order / payment / fulfillment state machines with explicit transition guards.
 */

export const OrderStatus = {
  DRAFT: "DRAFT",
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PAYMENT_REVIEW: "PAYMENT_REVIEW",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  PARTIALLY_FULFILLED: "PARTIALLY_FULFILLED",
  FULFILLED: "FULFILLED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUND_PENDING: "REFUND_PENDING",
  REFUNDED: "REFUNDED",
  DISPUTED: "DISPUTED",
  EXPIRED: "EXPIRED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  UNPAID: "UNPAID",
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
  REFUNDED: "REFUNDED",
  CHARGEBACK: "CHARGEBACK",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const FulfillmentStatus = {
  NOT_STARTED: "NOT_STARTED",
  QUEUED: "QUEUED",
  NEEDS_CUSTOMER_INFO: "NEEDS_CUSTOMER_INFO",
  IN_PROGRESS: "IN_PROGRESS",
  DELIVERED: "DELIVERED",
  CUSTOMER_CONFIRMED: "CUSTOMER_CONFIRMED",
  FAILED: "FAILED",
  REPLACEMENT_REQUIRED: "REPLACEMENT_REQUIRED",
  CANCELLED: "CANCELLED",
} as const;
export type FulfillmentStatus =
  (typeof FulfillmentStatus)[keyof typeof FulfillmentStatus];

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["AWAITING_PAYMENT", "CANCELLED", "EXPIRED"],
  AWAITING_PAYMENT: ["PAYMENT_REVIEW", "PAID", "CANCELLED", "EXPIRED", "FAILED" as OrderStatus].filter(
    Boolean,
  ) as OrderStatus[],
  PAYMENT_REVIEW: ["PAID", "AWAITING_PAYMENT", "CANCELLED", "EXPIRED"],
  PAID: ["PROCESSING", "REFUND_PENDING", "DISPUTED", "CANCELLED"],
  PROCESSING: ["PARTIALLY_FULFILLED", "FULFILLED", "REFUND_PENDING", "DISPUTED"],
  PARTIALLY_FULFILLED: ["FULFILLED", "REFUND_PENDING", "DISPUTED"],
  FULFILLED: ["COMPLETED", "REFUND_PENDING", "DISPUTED"],
  COMPLETED: ["REFUND_PENDING", "DISPUTED"],
  CANCELLED: [],
  REFUND_PENDING: ["REFUNDED", "DISPUTED", "PAID", "PROCESSING"],
  REFUNDED: [],
  DISPUTED: ["REFUND_PENDING", "REFUNDED", "COMPLETED", "CANCELLED"],
  EXPIRED: [],
};

// Fix AWAITING_PAYMENT - remove invalid FAILED
ORDER_TRANSITIONS.AWAITING_PAYMENT = [
  "PAYMENT_REVIEW",
  "PAID",
  "CANCELLED",
  "EXPIRED",
];

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID: ["PENDING", "CANCELLED"],
  PENDING: ["UNDER_REVIEW", "PAID", "FAILED", "CANCELLED"],
  UNDER_REVIEW: ["PAID", "FAILED", "CANCELLED", "PENDING"],
  PAID: ["PARTIALLY_REFUNDED", "REFUNDED", "CHARGEBACK"],
  FAILED: ["PENDING", "CANCELLED"],
  CANCELLED: [],
  PARTIALLY_REFUNDED: ["REFUNDED", "CHARGEBACK"],
  REFUNDED: [],
  CHARGEBACK: [],
};

const FULFILLMENT_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  NOT_STARTED: ["QUEUED", "CANCELLED"],
  QUEUED: ["NEEDS_CUSTOMER_INFO", "IN_PROGRESS", "CANCELLED"],
  NEEDS_CUSTOMER_INFO: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["DELIVERED", "FAILED", "REPLACEMENT_REQUIRED", "CANCELLED"],
  DELIVERED: ["CUSTOMER_CONFIRMED", "REPLACEMENT_REQUIRED", "FAILED"],
  CUSTOMER_CONFIRMED: [],
  FAILED: ["REPLACEMENT_REQUIRED", "QUEUED", "CANCELLED"],
  REPLACEMENT_REQUIRED: ["QUEUED", "IN_PROGRESS", "CANCELLED"],
  CANCELLED: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionPayment(
  from: PaymentStatus,
  to: PaymentStatus,
): boolean {
  return PAYMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionFulfillment(
  from: FulfillmentStatus,
  to: FulfillmentStatus,
): boolean {
  return FULFILLMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Invalid order transition: ${from} → ${to}`);
  }
}

export function assertPaymentTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Invalid payment transition: ${from} → ${to}`);
  }
}

export function assertFulfillmentTransition(
  from: FulfillmentStatus,
  to: FulfillmentStatus,
): void {
  if (!canTransitionFulfillment(from, to)) {
    throw new Error(`Invalid fulfillment transition: ${from} → ${to}`);
  }
}

/** UNPAID order cannot be fulfilled */
export function canFulfillOrder(opts: {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}): boolean {
  if (opts.paymentStatus !== "PAID") return false;
  return ["PAID", "PROCESSING", "PARTIALLY_FULFILLED"].includes(opts.orderStatus);
}
