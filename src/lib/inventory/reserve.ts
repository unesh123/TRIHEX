import { nanoid } from "nanoid";
import { RESERVATION_TTL_MINUTES } from "@/lib/inventory/ledger";
import { appendAuditEvent } from "@/lib/audit/log";

/**
 * Inventory reservation helper.
 *
 * Concurrency notes:
 * - With a database, use a single transaction that:
 *   1) SELECT … FOR UPDATE on the target lot row(s)
 *   2) Check quantity_available >= qty
 *   3) UPDATE lot: available -= qty, reserved += qty
 *   4) INSERT reservation + movement rows
 * - Never check-then-write outside a lock/transaction — two concurrent
 *   checkouts can oversell.
 * - When DATABASE_URL is absent, this module uses an in-memory mutex map
 *   keyed by variantId for demo/tests only (single Node process).
 */

export interface ReservationRecord {
  id: string;
  variantId: string;
  lotId: string | null;
  quantity: number;
  status: "ACTIVE" | "CONVERTED" | "RELEASED" | "EXPIRED";
  orderId: string | null;
  expiresAt: string;
  createdAt: string;
}

interface MemoryLot {
  lotId: string;
  variantId: string;
  quantityAvailable: number;
  quantityReserved: number;
}

const memoryLots = new Map<string, MemoryLot>();
const memoryReservations = new Map<string, ReservationRecord>();

/** Per-variant async mutex for in-memory concurrency safety (demo/tests). */
const variantLocks = new Map<string, Promise<void>>();

async function withVariantLock<T>(
  variantId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = variantLocks.get(variantId) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  variantLocks.set(
    variantId,
    prev.then(() => gate),
  );
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (variantLocks.get(variantId) === gate) {
      // cleaned when chain advances
    }
  }
}

/** Seed or upsert an in-memory lot for demos/tests. */
export function seedMemoryLot(input: {
  lotId?: string;
  variantId: string;
  quantityAvailable: number;
}): MemoryLot {
  const lotId = input.lotId ?? `lot_${input.variantId}`;
  const existing = memoryLots.get(lotId);
  const lot: MemoryLot = {
    lotId,
    variantId: input.variantId,
    quantityAvailable: input.quantityAvailable,
    quantityReserved: existing?.quantityReserved ?? 0,
  };
  memoryLots.set(lotId, lot);
  return lot;
}

export function getMemoryLot(lotId: string): MemoryLot | undefined {
  return memoryLots.get(lotId);
}

export function getMemoryReservation(
  reservationId: string,
): ReservationRecord | undefined {
  return memoryReservations.get(reservationId);
}

export async function reserveInventory(input: {
  variantId: string;
  quantity: number;
  orderId?: string | null;
  lotId?: string | null;
  actorId?: string | null;
}): Promise<{ ok: true; reservation: ReservationRecord } | { ok: false; error: string }> {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return { ok: false, error: "Reservation quantity must be a positive integer." };
  }

  // TODO: When DATABASE_URL is set, run SELECT FOR UPDATE + update in a transaction.
  if (process.env.DATABASE_URL) {
    // Placeholder: callers should implement DB path; fall through to memory only for demos.
  }

  return withVariantLock(input.variantId, async () => {
    const lot =
      (input.lotId ? memoryLots.get(input.lotId) : undefined) ??
      [...memoryLots.values()].find((l) => l.variantId === input.variantId);

    if (!lot) {
      return {
        ok: false,
        error: `No inventory lot found for variant ${input.variantId}. Seed a memory lot or use DB.`,
      };
    }

    if (lot.quantityAvailable < input.quantity) {
      return {
        ok: false,
        error: `Insufficient stock: need ${input.quantity}, available ${lot.quantityAvailable}.`,
      };
    }

    lot.quantityAvailable -= input.quantity;
    lot.quantityReserved += input.quantity;
    memoryLots.set(lot.lotId, lot);

    const now = Date.now();
    const reservation: ReservationRecord = {
      id: nanoid(),
      variantId: input.variantId,
      lotId: lot.lotId,
      quantity: input.quantity,
      status: "ACTIVE",
      orderId: input.orderId ?? null,
      expiresAt: new Date(now + RESERVATION_TTL_MINUTES * 60_000).toISOString(),
      createdAt: new Date(now).toISOString(),
    };
    memoryReservations.set(reservation.id, reservation);

    await appendAuditEvent({
      action: "INVENTORY_RESERVED",
      actorId: input.actorId,
      entityType: "inventory_reservation",
      entityId: reservation.id,
      metadata: {
        variantId: input.variantId,
        quantity: input.quantity,
        lotId: lot.lotId,
        orderId: input.orderId ?? null,
      },
    });

    return { ok: true, reservation };
  });
}

export function listActiveReservations(): ReservationRecord[] {
  return [...memoryReservations.values()].filter((r) => r.status === "ACTIVE");
}

/** Release all reservations past expiresAt (cron / demo). */
export async function releaseExpiredReservations(
  actorId?: string | null,
): Promise<{ released: number; errors: string[] }> {
  const now = Date.now();
  const expired = [...memoryReservations.values()].filter(
    (r) => r.status === "ACTIVE" && Date.parse(r.expiresAt) <= now,
  );

  let released = 0;
  const errors: string[] = [];

  for (const reservation of expired) {
    const result = await releaseReservation(reservation.id, actorId);
    if (result.ok) {
      const updated = memoryReservations.get(reservation.id);
      if (updated) {
        memoryReservations.set(reservation.id, { ...updated, status: "EXPIRED" });
      }
      released += 1;
    } else {
      errors.push(result.error);
    }
  }

  return { released, errors };
}

export async function releaseReservation(
  reservationId: string,
  actorId?: string | null,
): Promise<{ ok: true; reservation: ReservationRecord } | { ok: false; error: string }> {
  const reservation = memoryReservations.get(reservationId);
  if (!reservation) {
    return { ok: false, error: "Reservation not found." };
  }
  if (reservation.status !== "ACTIVE") {
    return { ok: false, error: `Reservation is ${reservation.status}, cannot release.` };
  }

  return withVariantLock(reservation.variantId, async () => {
    const current = memoryReservations.get(reservationId);
    if (!current || current.status !== "ACTIVE") {
      return { ok: false, error: "Reservation no longer active." };
    }

    if (current.lotId) {
      const lot = memoryLots.get(current.lotId);
      if (lot) {
        lot.quantityAvailable += current.quantity;
        lot.quantityReserved = Math.max(0, lot.quantityReserved - current.quantity);
        memoryLots.set(lot.lotId, lot);
      }
    }

    const updated: ReservationRecord = { ...current, status: "RELEASED" };
    memoryReservations.set(reservationId, updated);

    await appendAuditEvent({
      action: "INVENTORY_RELEASED",
      actorId,
      entityType: "inventory_reservation",
      entityId: reservationId,
      metadata: { quantity: current.quantity, variantId: current.variantId },
    });

    return { ok: true, reservation: updated };
  });
}

/** Test helpers */
export function resetInMemoryInventory(): void {
  memoryLots.clear();
  memoryReservations.clear();
  variantLocks.clear();
}

export function seedInMemoryLot(variantId: string, quantityAvailable: number): void {
  seedMemoryLot({ variantId, quantityAvailable });
}

export function getInMemoryAvailable(variantId: string): number {
  return [...memoryLots.values()]
    .filter((l) => l.variantId === variantId)
    .reduce((sum, l) => sum + l.quantityAvailable, 0);
}

export async function reserveStockInMemory(input: {
  variantId: string;
  quantity: number;
  idempotencyKey?: string;
}): Promise<ReservationRecord> {
  const result = await reserveInventory({
    variantId: input.variantId,
    quantity: input.quantity,
  });
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.reservation;
}
