/**
 * Inventory ledger helpers and stock state computation.
 * Available-to-sell is always derived — never a manually typed badge.
 */

export const InventoryMovementType = {
  RECEIVE: "RECEIVE",
  RESERVE: "RESERVE",
  RELEASE: "RELEASE",
  SELL: "SELL",
  RETURN: "RETURN",
  WRITE_OFF: "WRITE_OFF",
  CORRECTION: "CORRECTION",
} as const;
export type InventoryMovementType =
  (typeof InventoryMovementType)[keyof typeof InventoryMovementType];

export const StockState = {
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  PREORDER_DISABLED: "PREORDER_DISABLED",
  PAUSED: "PAUSED",
} as const;
export type StockState = (typeof StockState)[keyof typeof StockState];

export interface LotQuantities {
  quantityAvailable: number;
  quantityReserved: number;
  quantitySold: number;
  quantityReceived: number;
  status: string;
}

export function computeAvailableToSell(
  lots: LotQuantities[],
  activeReservationQuantity = 0,
): number {
  const sumAvailable = lots
    .filter((l) => l.status === "ACTIVE" || l.status === "RECEIVED")
    .reduce((acc, l) => acc + l.quantityAvailable, 0);

  // activeReservationQuantity is already deducted from quantityAvailable in
  // ledger-correct systems; pass 0 when lots already reflect reservations.
  // When reservations are tracked separately:
  const available = sumAvailable - activeReservationQuantity;
  return Math.max(0, available);
}

export function deriveStockState(opts: {
  availableToSell: number;
  lowStockThreshold: number;
  paused?: boolean;
  preorderDisabled?: boolean;
}): StockState {
  if (opts.paused) return "PAUSED";
  if (opts.availableToSell <= 0) {
    return opts.preorderDisabled ? "PREORDER_DISABLED" : "OUT_OF_STOCK";
  }
  if (opts.availableToSell <= opts.lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export function stockStateLabel(state: StockState): string {
  switch (state) {
    case "IN_STOCK":
      return "In stock";
    case "LOW_STOCK":
      return "Low stock";
    case "OUT_OF_STOCK":
      return "Out of stock";
    case "PREORDER_DISABLED":
      return "Unavailable";
    case "PAUSED":
      return "Paused";
  }
}

/**
 * Validate a movement would not drive available below zero.
 */
export function validateMovement(opts: {
  beforeAvailable: number;
  quantityDelta: number;
  type: InventoryMovementType;
}): { ok: boolean; afterAvailable: number; error?: string } {
  const after = opts.beforeAvailable + opts.quantityDelta;
  if (after < 0) {
    return {
      ok: false,
      afterAvailable: opts.beforeAvailable,
      error: `Inventory movement ${opts.type} would result in negative stock (${after}).`,
    };
  }
  return { ok: true, afterAvailable: after };
}

export const RESERVATION_TTL_MINUTES = 30;
