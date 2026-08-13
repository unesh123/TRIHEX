/**
 * PostgreSQL repositories (Drizzle).
 * Used when DATABASE_URL is configured and persistence mode is postgres.
 */

import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import type { CreatedOrder } from "@/lib/checkout/create-order";
import type { ManualPaymentRecord } from "@/lib/payments/manual";
import type { AuditEvent } from "@/lib/audit/log";
import type {
  AuditRepository,
  BusinessSettingsRecord,
  InventoryRepository,
  OrdersRepository,
  PaymentsRepository,
  PricingRepository,
  Repositories,
  SettingsRepository,
} from "./types";
import {
  DEFAULT_WHATSAPP_DISPLAY,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/whatsapp";

function createOrdersRepo(): OrdersRepository {
  return {
    async save(order: CreatedOrder) {
      const db = requireDb();
      const secureToken = nanoid(32);

      await db.transaction(async (tx) => {
        await tx.insert(schema.orders).values({
          id: order.id,
          humanReadableOrderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          customerName: order.customerName,
          subtotalMinor: order.subtotalNprMinor,
          grandTotalMinor: order.totalNprMinor,
          currency: "NPR",
          orderStatus: "AWAITING_PAYMENT",
          paymentStatus: order.paymentStatus === "PENDING" ? "PENDING" : "UNPAID",
          fulfillmentStatus: "NOT_STARTED",
          secureToken,
          orderNotes: order.notes,
          placedAt: new Date(order.createdAt),
        });

        for (const line of order.lines) {
          await tx.insert(schema.orderItems).values({
            orderId: order.id,
            variantId: line.variantId ?? null,
            productName: line.productName,
            variantName: line.variantName,
            sku: line.variantSku,
            quantity: line.quantity,
            unitPriceMinor: line.unitPriceNprMinor,
            totalMinor: line.lineTotalNprMinor,
            supplierCostSnapshotMinor: line.pricing.supplierCostConvertedNprMinor,
            profitSnapshotMinor: line.pricing.profitAmountNprMinor,
            warrantySnapshot: {
              tier: line.warrantyTier ?? "none",
              label: line.warrantyLabel ?? "No warranty",
              guaranteeDays: line.warrantyGuaranteeDays ?? 0,
            },
          });

          // Stock is deducted when admin Approves payment (see deductStockForPaidOrder).
          // Do not decrement here — unpaid/rejected orders must not consume stock.
        }

        await tx.insert(schema.orderStatusHistory).values({
          orderId: order.id,
          fromStatus: null,
          toStatus: "AWAITING_PAYMENT",
          statusType: "order",
          reason: "Order created",
        });
      });

      return { ...order, secureToken };
    },

    async getByNumber(orderNumber) {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.orders)
        .where(
          eq(
            schema.orders.humanReadableOrderNumber,
            orderNumber.trim().toUpperCase(),
          ),
        )
        .limit(1);
      if (!rows[0]) return null;
      return mapOrderRow(rows[0]);
    },

    async getBySecureToken(token) {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.secureToken, token))
        .limit(1);
      if (!rows[0]) return null;
      return mapOrderRow(rows[0]);
    },

    async updatePaymentStatus(orderId, paymentStatus, orderStatus) {
      const db = requireDb();
      await db
        .update(schema.orders)
        .set({
          paymentStatus: paymentStatus as never,
          ...(orderStatus
            ? {
                orderStatus: orderStatus as never,
              }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.orders.id, orderId));
    },

    async listRecent(limit = 50) {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.orders)
        .orderBy(desc(schema.orders.createdAt))
        .limit(limit);
      return rows.map(mapOrderRow);
    },
  };
}

function mapOrderRow(
  row: typeof schema.orders.$inferSelect,
): CreatedOrder & { secureToken: string } {
  return {
    id: row.id,
    orderNumber: row.humanReadableOrderNumber,
    status: String(row.orderStatus),
    paymentStatus: String(row.paymentStatus),
    customerName: row.customerName ?? "",
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone ?? "",
    paymentMethod: "BANK_TRANSFER",
    lines: [],
    subtotalNprMinor: row.subtotalMinor,
    totalNprMinor: row.grandTotalMinor,
    currency: "NPR",
    createdAt: (row.placedAt ?? row.createdAt).toISOString(),
    notes: row.orderNotes,
    secureToken: row.secureToken,
    fulfillmentActivated: row.fulfillmentActivated,
    fulfillmentEmailSent: row.fulfillmentEmailSent,
    fulfillmentWhatsappDelivered: row.fulfillmentWhatsappDelivered,
    fulfillmentNotes: row.fulfillmentNotes,
    fulfillmentDeliveredAt: row.fulfillmentDeliveredAt?.toISOString() ?? null,
    fulfillmentStatus: String(row.fulfillmentStatus),
  };
}

function createPaymentsRepo(): PaymentsRepository {
  return {
    async submit(record) {
      const db = requireDb();
      await db.insert(schema.manualPaymentSubmissions).values({
        id: record.id,
        orderId: record.orderId,
        method: record.method as never,
        senderName: record.payerName ?? "Unknown",
        senderReference: record.referenceCode ?? `ref-${record.id}`,
        amountMinor: record.amountNprMinor,
        proofImageUrl: record.proofUrl,
        proofContentHash: record.proofContentHash ?? null,
        status: "SUBMITTED",
      });
      return record;
    },
    async get(id) {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.manualPaymentSubmissions)
        .where(eq(schema.manualPaymentSubmissions.id, id))
        .limit(1);
      if (!rows[0]) return null;
      return mapPayment(rows[0]);
    },
    async list() {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.manualPaymentSubmissions)
        .orderBy(desc(schema.manualPaymentSubmissions.createdAt));
      return rows.map(mapPayment);
    },
    async save(record) {
      const db = requireDb();
      const { resolveProfileIdForActor } = await import(
        "@/lib/auth/resolve-profile-id"
      );
      const reviewerId = await resolveProfileIdForActor(record.reviewedBy);

      try {
        await db
          .update(schema.manualPaymentSubmissions)
          .set({
            status: record.status as never,
            reviewerId,
            rejectionReason: record.rejectionReason,
            reviewedAt: record.reviewedAt ? new Date(record.reviewedAt) : null,
          })
          .where(eq(schema.manualPaymentSubmissions.id, record.id));
      } catch (err) {
        // Last resort: approve/reject without reviewer FK if profile missing
        console.error(
          "[payments] save with reviewer failed, retrying without reviewerId",
          err,
        );
        await db
          .update(schema.manualPaymentSubmissions)
          .set({
            status: record.status as never,
            reviewerId: null,
            rejectionReason: record.rejectionReason,
            reviewedAt: record.reviewedAt ? new Date(record.reviewedAt) : null,
          })
          .where(eq(schema.manualPaymentSubmissions.id, record.id));
      }
      return { ...record, reviewedBy: reviewerId };
    },
    async findByReference(reference) {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.manualPaymentSubmissions)
        .where(eq(schema.manualPaymentSubmissions.senderReference, reference));
      return rows.map(mapPayment);
    },
    async findByProofHash(hash: string) {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.manualPaymentSubmissions)
        .where(eq(schema.manualPaymentSubmissions.proofContentHash, hash));
      return rows.map(mapPayment);
    },
  };
}

function mapPayment(
  row: typeof schema.manualPaymentSubmissions.$inferSelect,
): ManualPaymentRecord {
  return {
    id: row.id,
    orderId: row.orderId,
    method: row.method as ManualPaymentRecord["method"],
    status: row.status as ManualPaymentRecord["status"],
    amountNprMinor: row.amountMinor,
    referenceCode: row.senderReference,
    proofUrl: row.proofImageUrl,
    proofContentHash: row.proofContentHash,
    payerName: row.senderName,
    notes: null,
    submittedAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewedBy: row.reviewerId,
    rejectionReason: row.rejectionReason,
  };
}

function createInventoryRepo(): InventoryRepository {
  return {
    async receive(input) {
      const db = requireDb();
      const lotId = crypto.randomUUID();
      await db.transaction(async (tx) => {
        await tx.insert(schema.inventoryLots).values({
          id: lotId,
          variantId: input.variantId,
          quantityReceived: input.quantity,
          quantityAvailable: input.quantity,
          quantityReserved: 0,
          quantitySold: 0,
          unitCostMinor: input.unitCostMinor,
          costCurrency: input.costCurrency,
          status: "ACTIVE",
        });
        await tx.insert(schema.inventoryMovements).values({
          variantId: input.variantId,
          inventoryLotId: lotId,
          type: "RECEIVE",
          quantityDelta: input.quantity,
          beforeQuantity: 0,
          afterQuantity: input.quantity,
          reason: input.reason ?? "Stock received",
          actorId: input.actorId,
          idempotencyKey: input.idempotencyKey,
        });
      });
      return { lotId };
    },

    async reserve(input) {
      const db = requireDb();
      try {
        const result = await db.execute(
          sql`SELECT reserve_stock(
            ${input.variantId}::uuid,
            ${input.quantity}::int,
            ${input.orderId}::uuid,
            NULL::uuid,
            30,
            ${input.actorId}::uuid,
            ${input.idempotencyKey}
          ) AS reservation_id`,
        );
        const rows = result as unknown as { reservation_id: string }[];
        const reservationId =
          Array.isArray(rows) && rows[0]
            ? (rows[0] as { reservation_id: string }).reservation_id
            : nanoid();
        const reservation = {
          id: String(reservationId),
          variantId: input.variantId,
          lotId: null,
          quantity: input.quantity,
          status: "ACTIVE" as const,
          orderId: input.orderId ?? null,
          expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
          createdAt: new Date().toISOString(),
        };
        return { ok: true as const, reservation };
      } catch (e) {
        return {
          ok: false as const,
          error: e instanceof Error ? e.message : "Reservation failed",
        };
      }
    },

    async release(reservationId, actorId) {
      const db = requireDb();
      try {
        await db.execute(
          sql`SELECT release_reservation(${reservationId}::uuid, ${actorId}::uuid, ${`release:${reservationId}`})`,
        );
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Release failed",
        };
      }
    },

    async convertToSold(input) {
      const db = requireDb();
      try {
        await db.execute(
          sql`SELECT convert_reservation_to_sale(
            ${input.reservationId}::uuid,
            ${input.orderItemId}::uuid,
            ${input.actorId}::uuid,
            ${input.idempotencyKey}
          )`,
        );
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Convert to sold failed",
        };
      }
    },

    async getAvailable(variantId) {
      const db = requireDb();
      const rows = await db
        .select({
          available: sql<number>`coalesce(sum(${schema.inventoryLots.quantityAvailable}), 0)`,
        })
        .from(schema.inventoryLots)
        .where(eq(schema.inventoryLots.variantId, variantId));
      return Number(rows[0]?.available ?? 0);
    },
  };
}

function createAuditRepo(): AuditRepository {
  return {
    async append(input) {
      const db = requireDb();
      const id = crypto.randomUUID();
      const createdAt = new Date();
      await db.insert(schema.auditLogs).values({
        id,
        actorId: input.actorId,
        actorRole: input.actorRole,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata ?? {},
        ipHash: input.ipHash,
        createdAt,
      });
      const event: AuditEvent = {
        id,
        action: input.action,
        actorId: input.actorId ?? null,
        actorRole: input.actorRole ?? null,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata ?? {},
        ipHash: input.ipHash ?? null,
        createdAt: createdAt.toISOString(),
      };
      return event;
    },
    async recent(limit = 50) {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.auditLogs)
        .orderBy(desc(schema.auditLogs.createdAt))
        .limit(limit);
      return rows.map((r) => ({
        id: r.id,
        action: r.action as AuditEvent["action"],
        actorId: r.actorId,
        actorRole: r.actorRole,
        entityType: r.entityType,
        entityId: r.entityId,
        metadata: (r.metadata as Record<string, unknown>) ?? {},
        ipHash: r.ipHash,
        createdAt: r.createdAt.toISOString(),
      }));
    },
  };
}

function createSettingsRepo(): SettingsRepository {
  return {
    async get() {
      const db = requireDb();
      const rows = await db.select().from(schema.businessSettings).limit(1);
      if (!rows[0]) {
        return {
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
      }
      const row = rows[0];
      const social = (row.socialLinks ?? {}) as Record<string, string>;
      return {
        businessName: row.businessName,
        tagline: social.tagline ?? "Verified Digital Access. Fairly Priced.",
        whatsappDisplay: social.whatsappDisplay ?? DEFAULT_WHATSAPP_DISPLAY,
        whatsappNumber: social.whatsappNumber ?? DEFAULT_WHATSAPP_NUMBER,
        customerServiceEmail: row.customerServiceEmail,
        announcementBarText: row.announcementBarText,
        announcementBarActive: row.announcementBarActive,
        ordersPaused: social.ordersPaused === "true",
        ordersPausedReason: social.ordersPausedReason ?? null,
      } satisfies BusinessSettingsRecord;
    },
    async update(patch, actorId) {
      void actorId;
      const db = requireDb();
      const current = await this.get();
      const next = { ...current, ...patch };
      const existing = await db.select().from(schema.businessSettings).limit(1);
      const socialLinks = {
        tagline: next.tagline,
        whatsappDisplay: next.whatsappDisplay,
        whatsappNumber: next.whatsappNumber,
        ordersPaused: String(next.ordersPaused),
        ordersPausedReason: next.ordersPausedReason ?? "",
      };
      if (existing[0]) {
        await db
          .update(schema.businessSettings)
          .set({
            businessName: next.businessName,
            customerServiceEmail: next.customerServiceEmail,
            announcementBarText: next.announcementBarText,
            announcementBarActive: next.announcementBarActive,
            socialLinks,
            updatedAt: new Date(),
          })
          .where(eq(schema.businessSettings.id, existing[0].id));
      } else {
        await db.insert(schema.businessSettings).values({
          businessName: next.businessName,
          customerServiceEmail: next.customerServiceEmail,
          announcementBarText: next.announcementBarText,
          announcementBarActive: next.announcementBarActive,
          socialLinks,
        });
      }
      return next;
    },
  };
}

function createPricingRepo(): PricingRepository {
  return {
    async updateVariantPrice(input) {
      const db = requireDb();
      await db.transaction(async (tx) => {
        await tx
          .update(schema.productVariants)
          .set({
            manualSellingPriceNprMinor: input.manualSellingPriceNprMinor,
            pricingMode:
              input.pricingMode as never,
            fxRateSnapshot: input.fxRateSnapshot,
            updatedAt: new Date(),
          })
          .where(eq(schema.productVariants.id, input.variantId));

        await tx.insert(schema.supplierCostHistory).values({
          variantId: input.variantId,
          costMinor: input.manualSellingPriceNprMinor,
          currency: "NPR",
          recordedBy: input.actorId,
        });
      });
    },
    async getVariantPricing(variantId) {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.productVariants)
        .where(eq(schema.productVariants.id, variantId))
        .limit(1);
      if (!rows[0]) return null;
      return {
        manualSellingPriceNprMinor: rows[0].manualSellingPriceNprMinor,
        fxRateSnapshot: rows[0].fxRateSnapshot,
        pricingMode: rows[0].pricingMode,
      };
    },
    async listPriceHistory(variantId, limit = 20) {
      const db = requireDb();
      const rows = await db
        .select()
        .from(schema.supplierCostHistory)
        .where(eq(schema.supplierCostHistory.variantId, variantId))
        .orderBy(desc(schema.supplierCostHistory.createdAt))
        .limit(limit);
      return rows.map((r) => ({
        id: r.id,
        manualSellingPriceNprMinor: r.costMinor,
        overrideReason: null,
        createdAt: r.createdAt.toISOString(),
      }));
    },
  };
}

export function createPostgresRepositories(): Repositories {
  return {
    mode: "postgres",
    orders: createOrdersRepo(),
    payments: createPaymentsRepo(),
    inventory: createInventoryRepo(),
    audit: createAuditRepo(),
    settings: createSettingsRepo(),
    pricing: createPricingRepo(),
  };
}
