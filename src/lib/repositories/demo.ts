/**
 * Explicit DEMO / TEST persistence adapters.
 * Never imported as a silent production fallback — selected only via resolvePersistenceMode().
 */

import { nanoid } from "nanoid";
import type { CreatedOrder } from "@/lib/checkout/create-order";
import type { ManualPaymentRecord } from "@/lib/payments/manual";
import type { AuditAction, AuditEvent } from "@/lib/audit/log";
import {
  reserveInventory,
  releaseReservation,
  seedMemoryLot,
  getInMemoryAvailable,
} from "@/lib/inventory/reserve";
import type {
  AuditRepository,
  BusinessSettingsRecord,
  InventoryRepository,
  OrdersRepository,
  PaymentsRepository,
  PricingRepository,
  Repositories,
  SettingsRepository,
  VariantPriceUpdate,
} from "./types";
import {
  DEFAULT_WHATSAPP_DISPLAY,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/whatsapp";

function createOrdersRepo(): OrdersRepository {
  const byId = new Map<string, CreatedOrder & { secureToken: string }>();
  const byNumber = new Map<string, CreatedOrder & { secureToken: string }>();
  const byToken = new Map<string, CreatedOrder & { secureToken: string }>();

  return {
    async save(order) {
      const stored = { ...order, secureToken: nanoid(32) };
      byId.set(stored.id, stored);
      byNumber.set(stored.orderNumber.toUpperCase(), stored);
      byToken.set(stored.secureToken, stored);
      return stored;
    },
    async getByNumber(orderNumber) {
      return byNumber.get(orderNumber.trim().toUpperCase()) ?? null;
    },
    async getBySecureToken(token) {
      return byToken.get(token) ?? null;
    },
    async updatePaymentStatus(orderId, paymentStatus, orderStatus) {
      const order = byId.get(orderId);
      if (!order) return;
      order.paymentStatus = paymentStatus as CreatedOrder["paymentStatus"];
      if (orderStatus) {
        (order as { status: string }).status = orderStatus;
      }
    },
    async listRecent(limit = 50) {
      return [...byId.values()]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
    },
  };
}

function createPaymentsRepo(): PaymentsRepository {
  const store = new Map<string, ManualPaymentRecord>();
  return {
    async submit(record) {
      store.set(record.id, record);
      return record;
    },
    async get(id) {
      return store.get(id) ?? null;
    },
    async list() {
      return [...store.values()].sort((a, b) =>
        b.submittedAt.localeCompare(a.submittedAt),
      );
    },
    async save(record) {
      store.set(record.id, record);
      return record;
    },
    async findByReference(reference) {
      return [...store.values()].filter(
        (r) =>
          (r.referenceCode ?? "").toLowerCase() === reference.toLowerCase(),
      );
    },
    async findByProofHash(hash) {
      return [...store.values()].filter((r) => r.proofContentHash === hash);
    },
  };
}

function createInventoryRepo(): InventoryRepository {
  return {
    async receive(input) {
      const lotId = `lot_${input.variantId}_${nanoid(6)}`;
      const existing = getInMemoryAvailable(input.variantId);
      seedMemoryLot({
        lotId,
        variantId: input.variantId,
        quantityAvailable: existing + input.quantity,
      });
      return { lotId };
    },
    async reserve(input) {
      return reserveInventory(input);
    },
    async release(reservationId, actorId) {
      const r = await releaseReservation(reservationId, actorId);
      return r.ok ? { ok: true } : { ok: false, error: r.error };
    },
    async convertToSold(input) {
      // Demo: release reservation conceptually as sold by marking released after deduct
      const r = await releaseReservation(input.reservationId, input.actorId);
      if (!r.ok) return { ok: false, error: r.error };
      return { ok: true };
    },
    async getAvailable(variantId) {
      return getInMemoryAvailable(variantId);
    },
  };
}

function createAuditRepo(): AuditRepository {
  const events: AuditEvent[] = [];
  return {
    async append(input) {
      const event: AuditEvent = {
        id: nanoid(),
        action: input.action,
        actorId: input.actorId ?? null,
        actorRole: input.actorRole ?? null,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata ?? {},
        ipHash: input.ipHash ?? null,
        createdAt: new Date().toISOString(),
      };
      events.push(event);
      return event;
    },
    async recent(limit = 50) {
      return events.slice(-limit).reverse();
    },
  };
}

function createSettingsRepo(): SettingsRepository {
  let settings: BusinessSettingsRecord = {
    businessName: "TRIHEX DIGITAL",
    tagline: "Verified Digital Access. Fairly Priced.",
    whatsappDisplay: DEFAULT_WHATSAPP_DISPLAY,
    whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
    customerServiceEmail: null,
    announcementBarText: null,
    announcementBarActive: false,
    ordersPaused: false,
    ordersPausedReason: null,
  };
  return {
    async get() {
      return { ...settings };
    },
    async update(patch) {
      settings = { ...settings, ...patch };
      return { ...settings };
    },
  };
}

function createPricingRepo(): PricingRepository {
  const prices = new Map<
    string,
    {
      manualSellingPriceNprMinor: number | null;
      fxRateSnapshot: number | null;
      pricingMode: string;
    }
  >();
  const history: Array<{
    id: string;
    variantId: string;
    manualSellingPriceNprMinor: number | null;
    overrideReason: string | null;
    createdAt: string;
  }> = [];

  // Seed Gemini NPR 300
  prices.set("GEM-UPG-18M-001", {
    manualSellingPriceNprMinor: 30000,
    fxRateSnapshot: 16000,
    pricingMode: "MANUAL_ONLY",
  });

  return {
    async updateVariantPrice(input: VariantPriceUpdate) {
      prices.set(input.variantId, {
        manualSellingPriceNprMinor: input.manualSellingPriceNprMinor,
        fxRateSnapshot: input.fxRateSnapshot,
        pricingMode: input.pricingMode,
      });
      history.push({
        id: nanoid(),
        variantId: input.variantId,
        manualSellingPriceNprMinor: input.manualSellingPriceNprMinor,
        overrideReason: input.overrideReason ?? null,
        createdAt: new Date().toISOString(),
      });
    },
    async getVariantPricing(variantId) {
      return prices.get(variantId) ?? null;
    },
    async listPriceHistory(variantId, limit = 20) {
      return history
        .filter((h) => h.variantId === variantId)
        .slice(-limit)
        .reverse();
    },
  };
}

export function createDemoRepositories(
  mode: "demo" | "test" = "demo",
): Repositories {
  return {
    mode,
    orders: createOrdersRepo(),
    payments: createPaymentsRepo(),
    inventory: createInventoryRepo(),
    audit: createAuditRepo(),
    settings: createSettingsRepo(),
    pricing: createPricingRepo(),
  };
}

// silence unused AuditAction import warning if any
export type { AuditAction };
