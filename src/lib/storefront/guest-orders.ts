/**
 * Guest order history on the customer device (localStorage).
 * Works without login — order number + secure token for tracking.
 */

export const GUEST_ORDERS_KEY = "trihex_guest_orders";

export type GuestOrderRecord = {
  orderNumber: string;
  secureToken: string | null;
  totalNprMinor: number;
  paymentMethod: string;
  placedAt: string;
  /** Local hint — server is source of truth via track */
  paymentStatus: string;
  orderStatus: string;
  proofUploaded: boolean;
  itemsSummary: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readGuestOrders(): GuestOrderRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(GUEST_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { orders?: GuestOrderRecord[] };
    return Array.isArray(parsed.orders) ? parsed.orders : [];
  } catch {
    return [];
  }
}

export function saveGuestOrder(order: GuestOrderRecord): void {
  if (!canUseStorage()) return;
  const existing = readGuestOrders().filter(
    (o) => o.orderNumber !== order.orderNumber,
  );
  const next = [order, ...existing].slice(0, 40);
  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify({ orders: next }));
}

export function updateGuestOrderStatus(
  orderNumber: string,
  patch: Partial<
    Pick<GuestOrderRecord, "paymentStatus" | "orderStatus" | "proofUploaded">
  >,
): void {
  if (!canUseStorage()) return;
  const orders = readGuestOrders().map((o) =>
    o.orderNumber === orderNumber ? { ...o, ...patch } : o,
  );
  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify({ orders }));
}
