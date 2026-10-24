import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, inArray, desc, or, ilike } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/env";
import { getRepositories } from "@/lib/repositories";
import { randomUUID } from "crypto";
import { nanoid } from "nanoid";
import {
  getAllVipMembers,
  registerOrUpdateCustomerVip,
  allocateVipBonus,
  type VipTag,
  type VipMember,
} from "./vip-member-store";
import { resolveProofViewUrl } from "@/lib/storage/proof-url";

export interface VipOrderRow {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  customerCode?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  tier: "1_MONTH" | "6_MONTHS" | "LIFETIME" | "CUSTOM";
  tierTitle: string;
  amountNpr: number;
  amountMinor: number;
  orderStatus: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod: string;
  proofUrl: string | null;
  senderReference: string | null;
  placedAt: string;
  notes: string | null;
  itemsSummary: string;

  // Correlated member intelligence
  memberId?: string | null;
  currentVipTag?: VipTag;
  isMemberActive?: boolean;
  isLocked?: boolean;
  bonusDays?: number;
  bonusPerks?: string[];
  isVipPackage?: boolean;
}

// Zero fake/dummy orders in production - only live database records
const BASELINE_VIP_ORDERS: VipOrderRow[] = [];

// In-memory cache of live-updated VIP orders
let memoryVipOrders: VipOrderRow[] = [];

export async function createVipOrder(data: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  tierId?: string;
  tier?: "1_MONTH" | "6_MONTHS" | "LIFETIME" | "CUSTOM" | string;
  tierName?: string;
  amountNpr: number;
  paymentMethod?: string;
  transactionReference?: string;
  status?: string;
  deviceTelemetry?: string;
  notes?: string;
}): Promise<VipOrderRow> {
  const rawTier = data.tier || data.tierId || "1_MONTH";
  const tier = (rawTier as "1_MONTH" | "6_MONTHS" | "LIFETIME" | "CUSTOM") || "1_MONTH";
  const tierTitles: Record<string, string> = {
    "1_MONTH": "1 Month VIP Pass (30 Days)",
    "6_MONTHS": "6 Months VIP Pass (180 Days)",
    "LIFETIME": "Lifetime VIP Pass (Permanent Unrestricted)",
    "CUSTOM": "VIP Custom Clearance",
  };

  const id = randomUUID();
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const orderNumber = `THX-${dateStr}-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanEmail = data.customerEmail.toLowerCase().trim();
  const cleanPhone = data.customerPhone.trim();
  const cleanName = data.customerName.trim() || cleanEmail.split("@")[0];
  const amountMinor = data.amountNpr * 100;

  const newOrder: VipOrderRow = {
    id,
    orderNumber,
    customerName: cleanName,
    customerPhone: cleanPhone,
    customerEmail: cleanEmail,
    tier,
    tierTitle: data.tierName || tierTitles[tier] || "VIP Access Pass",
    amountNpr: data.amountNpr,
    amountMinor,
    orderStatus: data.status === "ACTIVE" ? "PAID" : "PROCESSING",
    paymentStatus: data.status === "ACTIVE" ? "PAID" : "UNDER_REVIEW",
    fulfillmentStatus: data.status === "ACTIVE" ? "DELIVERED" : "NOT_STARTED",
    paymentMethod: data.paymentMethod || "BANK_QR",
    proofUrl: null,
    senderReference: data.transactionReference || null,
    placedAt: new Date().toISOString(),
    notes: data.notes || `[VIP ACCESS REQUEST] Tier: ${tier} | Ref: ${data.transactionReference || "QR"}`,
    itemsSummary: `${tierTitles[tier] || "VIP Pass"} (Full Vault Access)`,
    isMemberActive: data.status === "ACTIVE",
    currentVipTag: data.status === "ACTIVE" ? "VIP" : "NORMAL",
  };

  // 1. Immediately persist to PostgreSQL Database if configured
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        // Ensure customer profile exists or find existing
        let profileId: string | null = null;
        try {
          const existingProfiles = await db
            .select({ id: schema.profiles.id })
            .from(schema.profiles)
            .where(eq(schema.profiles.email, cleanEmail))
            .limit(1);

          if (existingProfiles.length > 0) {
            profileId = existingProfiles[0].id;
            if (cleanPhone) {
              await db
                .update(schema.profiles)
                .set({ phone: cleanPhone, updatedAt: new Date() })
                .where(eq(schema.profiles.id, profileId))
                .catch(() => null);
            }
          } else {
            const newAuthUserId = randomUUID();
            const inserted = await db
              .insert(schema.profiles)
              .values({
                authUserId: newAuthUserId,
                email: cleanEmail,
                fullName: cleanName,
                phone: cleanPhone || null,
                role: "CUSTOMER",
                accountStatus: "ACTIVE",
              })
              .returning({ id: schema.profiles.id })
              .catch(() => null);
            if (inserted && inserted[0]) {
              profileId = inserted[0].id;
            }
          }
        } catch (err) {
          console.warn("[VipOrderStore] Profile correlation note:", err);
        }

        if (profileId) {
          newOrder.customerId = profileId;
        }
        newOrder.customerCode = `THX-USR-${cleanPhone ? cleanPhone.slice(-4) : cleanEmail.slice(0, 4).toUpperCase()}`;

        // Insert Order into schema.orders
        const secureToken = nanoid(32);
        await db.insert(schema.orders).values({
          id,
          humanReadableOrderNumber: orderNumber,
          customerId: profileId,
          customerEmail: cleanEmail,
          customerPhone: cleanPhone,
          customerName: cleanName,
          subtotalMinor: amountMinor,
          grandTotalMinor: amountMinor,
          currency: "NPR",
          orderStatus: data.status === "ACTIVE" ? "PAID" : "PROCESSING",
          paymentStatus: data.status === "ACTIVE" ? "PAID" : "UNDER_REVIEW",
          fulfillmentStatus: data.status === "ACTIVE" ? "DELIVERED" : "NOT_STARTED",
          secureToken,
          orderNotes: newOrder.notes,
          placedAt: new Date(),
        });

        // Insert Order Item into schema.orderItems
        await db.insert(schema.orderItems).values({
          orderId: id,
          productName: "TRIHEX VIP VAULT",
          variantName: newOrder.tierTitle,
          sku: `THX-VIP-${tier}`,
          quantity: 1,
          unitPriceMinor: amountMinor,
          totalMinor: amountMinor,
        });

        // Insert Manual Payment Record into schema.manualPaymentSubmissions
        const paymentMethodEnumVal =
          data.paymentMethod === "ESEWA"
            ? "ESEWA_MANUAL"
            : data.paymentMethod === "KHALTI"
            ? "KHALTI_MANUAL"
            : "BANK_TRANSFER";

        await db.insert(schema.manualPaymentSubmissions).values({
          orderId: id,
          method: paymentMethodEnumVal,
          senderName: cleanName,
          senderReference: data.transactionReference || `QR-VIP-${Math.floor(1000 + Math.random() * 9000)}`,
          amountMinor,
          status: "SUBMITTED",
          paymentDate: new Date(),
        });

        console.log(`[VipOrderStore] Successfully persisted VIP order ${orderNumber} to PostgreSQL database!`);
      }
    } catch (dbErr) {
      console.error("[VipOrderStore] Failed to persist order to PostgreSQL:", dbErr);
    }
  }

  // 2. Also keep in local fast memory
  memoryVipOrders.unshift(newOrder);
  return newOrder;
}

export async function getAllVipOrders(includeAllStoreOrders = true): Promise<VipOrderRow[]> {
  const members = await getAllVipMembers();
  const results: VipOrderRow[] = [];

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        // Query recent orders from Postgres
        const dbOrders = await db
          .select({
            id: schema.orders.id,
            orderNumber: schema.orders.humanReadableOrderNumber,
            customerId: schema.orders.customerId,
            customerName: schema.orders.customerName,
            customerEmail: schema.orders.customerEmail,
            customerPhone: schema.orders.customerPhone,
            grandTotalMinor: schema.orders.grandTotalMinor,
            orderStatus: schema.orders.orderStatus,
            paymentStatus: schema.orders.paymentStatus,
            fulfillmentStatus: schema.orders.fulfillmentStatus,
            placedAt: schema.orders.placedAt,
            createdAt: schema.orders.createdAt,
            orderNotes: schema.orders.orderNotes,
          })
          .from(schema.orders)
          .orderBy(desc(schema.orders.createdAt))
          .limit(100);

        const orderIds = dbOrders.map((o) => o.id);

        if (orderIds.length > 0) {
          const [dbItems, dbProofs] = await Promise.all([
            db
              .select({
                orderId: schema.orderItems.orderId,
                productName: schema.orderItems.productName,
                variantName: schema.orderItems.variantName,
                sku: schema.orderItems.sku,
                totalMinor: schema.orderItems.totalMinor,
              })
              .from(schema.orderItems)
              .where(inArray(schema.orderItems.orderId, orderIds)),

            db
              .select({
                orderId: schema.manualPaymentSubmissions.orderId,
                method: schema.manualPaymentSubmissions.method,
                proofImageUrl: schema.manualPaymentSubmissions.proofImageUrl,
                senderReference: schema.manualPaymentSubmissions.senderReference,
              })
              .from(schema.manualPaymentSubmissions)
              .where(inArray(schema.manualPaymentSubmissions.orderId, orderIds)),
          ]);

          for (const ord of dbOrders) {
            const matchingItems = dbItems.filter((i) => i.orderId === ord.id);
            const proof = dbProofs.find((p) => p.orderId === ord.id);

            // Detect if this is a VIP package order
            const isVipSku = matchingItems.some(
              (i) => i.sku.toUpperCase().includes("VIP") || i.productName.toUpperCase().includes("VIP")
            );
            const isVipAmount = [399900, 599900, 799900].includes(ord.grandTotalMinor);
            const isVipNotes = (ord.orderNotes || "").toUpperCase().includes("VIP");
            const isVipNumber = (ord.orderNumber || "").toUpperCase().includes("VIP");
            const isVipPackage = Boolean(isVipSku || isVipAmount || isVipNotes || isVipNumber);

            if (!includeAllStoreOrders && !isVipPackage) {
              continue;
            }

            let tier: VipOrderRow["tier"] = "1_MONTH";
            let tierTitle = "1 Month VIP Pass (30 Days)";

            if (
              matchingItems.some((i) => i.sku.includes("LIFE") || i.variantName.toLowerCase().includes("life")) ||
              ord.grandTotalMinor === 799900
            ) {
              tier = "LIFETIME";
              tierTitle = "Lifetime VIP Pass (Permanent Unrestricted)";
            } else if (
              matchingItems.some((i) => i.sku.includes("6M") || i.variantName.toLowerCase().includes("6 month")) ||
              ord.grandTotalMinor === 599900
            ) {
              tier = "6_MONTHS";
              tierTitle = "6 Months VIP Pass (180 Days)";
            } else if (ord.grandTotalMinor === 399900 || isVipPackage) {
              tier = "1_MONTH";
              tierTitle = "1 Month VIP Pass (30 Days)";
            } else {
              tier = "1_MONTH";
              tierTitle = matchingItems[0]?.productName ? `Store: ${matchingItems[0].productName}` : "Storefront Order";
            }

            // Correlate with member store
            const phoneClean = (ord.customerPhone || "").replace(/\D/g, "");
            const matchingMember = members.find(
              (m) =>
                (phoneClean && m.phone.replace(/\D/g, "").includes(phoneClean)) ||
                (ord.customerEmail && m.email.toLowerCase() === ord.customerEmail.toLowerCase())
            );

            let viewProofUrl: string | null = proof?.proofImageUrl || null;
            if (viewProofUrl && viewProofUrl.startsWith("storage://")) {
              viewProofUrl = await resolveProofViewUrl(viewProofUrl);
            }

            const customerCode =
              matchingMember?.verificationToken ||
              (phoneClean ? `THX-USR-${phoneClean.slice(-4)}` : `THX-USR-${(ord.customerEmail || "9702").slice(0, 4).toUpperCase()}`);

            const itemsSummary =
              matchingItems.map((i) => `${i.productName} (${i.variantName})`).join(", ") ||
              (isVipPackage ? tierTitle : "Store Order");

            results.push({
              id: ord.id,
              orderNumber: ord.orderNumber,
              customerId: ord.customerId || matchingMember?.id || null,
              customerCode,
              customerName: ord.customerName || "Customer",
              customerPhone: ord.customerPhone || "",
              customerEmail: ord.customerEmail,
              tier,
              tierTitle,
              amountNpr: Math.round(ord.grandTotalMinor / 100),
              amountMinor: ord.grandTotalMinor,
              orderStatus: ord.orderStatus,
              paymentStatus: ord.paymentStatus,
              fulfillmentStatus: ord.fulfillmentStatus,
              paymentMethod: proof?.method || "BANK_TRANSFER",
              proofUrl: viewProofUrl,
              senderReference: proof?.senderReference || null,
              placedAt: ord.placedAt ? ord.placedAt.toISOString() : ord.createdAt.toISOString(),
              notes: ord.orderNotes,
              itemsSummary,
              isVipPackage,
              memberId: matchingMember ? matchingMember.id : null,
              currentVipTag: matchingMember ? matchingMember.vipTag : "NORMAL",
              isMemberActive: matchingMember ? matchingMember.status === "ACTIVE" : false,
              isLocked: matchingMember ? Boolean(matchingMember.isLocked) : false,
              bonusDays: matchingMember?.bonusDays || 0,
              bonusPerks: matchingMember?.bonusPerks || [],
            });
          }
        }
      }
    } catch (err) {
      console.warn("[VipOrderStore] DB query note:", err);
    }
  }

  // Merge in any in-memory orders that aren't already captured
  for (const memOrder of memoryVipOrders) {
    const exists = results.some(
      (r) => r.orderNumber.toLowerCase() === memOrder.orderNumber.toLowerCase()
    );
    if (!exists) {
      // Re-correlate with latest member state
      const phoneClean = memOrder.customerPhone.replace(/\D/g, "");
      const matchingMember = members.find(
        (m) =>
          (phoneClean && m.phone.replace(/\D/g, "").includes(phoneClean)) ||
          m.email.toLowerCase() === memOrder.customerEmail.toLowerCase()
      );

      results.push({
        ...memOrder,
        memberId: matchingMember ? matchingMember.id : memOrder.memberId,
        currentVipTag: matchingMember ? matchingMember.vipTag : memOrder.currentVipTag,
        isMemberActive: matchingMember ? matchingMember.status === "ACTIVE" : memOrder.isMemberActive,
        isLocked: matchingMember ? Boolean(matchingMember.isLocked) : memOrder.isLocked,
        bonusDays: matchingMember?.bonusDays || memOrder.bonusDays,
        bonusPerks: matchingMember?.bonusPerks || memOrder.bonusPerks,
      });
    }
  }

  // Sort by placedAt desc
  return results.sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );
}

export async function updateVipOrderStatus(
  orderId: string,
  newStatus: string,
  notes?: string
): Promise<VipOrderRow | null> {
  const now = new Date();

  // 1. Update in Postgres if DB is configured
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        const updates: Partial<typeof schema.orders.$inferInsert> = {
          orderStatus: newStatus as any,
          updatedAt: now,
        };

        if (newStatus === "PAID") {
          updates.paymentStatus = "PAID";
        } else if (newStatus === "FULFILLED") {
          updates.orderStatus = "FULFILLED";
          updates.paymentStatus = "PAID";
          updates.fulfillmentStatus = "DELIVERED";
          updates.fulfillmentActivated = true;
          updates.fulfillmentWhatsappDelivered = true;
          updates.fulfillmentDeliveredAt = now;
        } else if (newStatus === "CANCELLED") {
          updates.paymentStatus = "CANCELLED";
          updates.fulfillmentStatus = "CANCELLED";
        } else if (newStatus === "PROCESSING") {
          updates.paymentStatus = "UNDER_REVIEW";
        }

        if (notes) {
          updates.internalNotes = notes;
        }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
        const whereClause = isUuid
          ? or(eq(schema.orders.id, orderId), eq(schema.orders.humanReadableOrderNumber, orderId))
          : eq(schema.orders.humanReadableOrderNumber, orderId);

        await db
          .update(schema.orders)
          .set(updates)
          .where(whereClause);

        if (newStatus === "PAID" || newStatus === "FULFILLED") {
          if (isUuid) {
            await db
              .update(schema.manualPaymentSubmissions)
              .set({ status: "VERIFIED" })
              .where(eq(schema.manualPaymentSubmissions.orderId, orderId))
              .catch(() => null);
          }
        }
      }
    } catch (err) {
      console.warn("[VipOrderStore] DB update status error:", err);
    }
  }

  // 2. Update memory store
  const idx = memoryVipOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
  if (idx >= 0) {
    const prev = memoryVipOrders[idx];
    const updated: VipOrderRow = {
      ...prev,
      orderStatus: newStatus,
      paymentStatus:
        newStatus === "PAID" || newStatus === "FULFILLED"
          ? "PAID"
          : newStatus === "CANCELLED"
          ? "CANCELLED"
          : newStatus === "PROCESSING"
          ? "UNDER_REVIEW"
          : prev.paymentStatus,
      fulfillmentStatus: newStatus === "FULFILLED" ? "DELIVERED" : prev.fulfillmentStatus,
      notes: notes ? `${prev.notes || ""} | ${notes}` : prev.notes,
    };
    memoryVipOrders[idx] = updated;
    return updated;
  }

  const all = await getAllVipOrders(true);
  return all.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
}

export async function changeVipOrderTier(
  orderId: string,
  newTier: "1_MONTH" | "6_MONTHS" | "LIFETIME" | "CUSTOM",
  options?: {
    customDays?: number;
    amountNpr?: number;
    adminNotes?: string;
  }
): Promise<{ order: VipOrderRow | null; member: VipMember | null }> {
  const tierTitles: Record<string, string> = {
    "1_MONTH": "1 Month VIP Pass (30 Days)",
    "6_MONTHS": "6 Months VIP Pass (180 Days)",
    "LIFETIME": "Lifetime VIP Pass (Permanent Unrestricted)",
    "CUSTOM": `${options?.customDays || 30} Days VIP Custom Clearance`,
  };

  const tierPrices: Record<string, number> = {
    "1_MONTH": 3999,
    "6_MONTHS": 5999,
    "LIFETIME": 7999,
    "CUSTOM": options?.amountNpr || 3999,
  };

  const amountNpr = options?.amountNpr ?? tierPrices[newTier] ?? 3999;
  const amountMinor = amountNpr * 100;
  const tierTitle = tierTitles[newTier] || "VIP Access Pass";
  const now = new Date();

  let updatedMember: VipMember | null = null;

  // 1. Update in Postgres
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
        const whereClause = isUuid
          ? or(eq(schema.orders.id, orderId), eq(schema.orders.humanReadableOrderNumber, orderId))
          : eq(schema.orders.humanReadableOrderNumber, orderId);

        const existingOrders = await db.select().from(schema.orders).where(whereClause).limit(1);
        if (existingOrders.length > 0) {
          const ord = existingOrders[0];
          await db
            .update(schema.orders)
            .set({
              subtotalMinor: amountMinor,
              grandTotalMinor: amountMinor,
              orderNotes: options?.adminNotes
                ? `[DURATION ADJUSTED TO ${newTier}] ${options.adminNotes}`
                : `[DURATION ADJUSTED TO ${newTier}] Admin override duration`,
              updatedAt: now,
            })
            .where(whereClause);

          await db
            .update(schema.orderItems)
            .set({
              productName: "TRIHEX VIP VAULT",
              variantName: tierTitle,
              sku: `THX-VIP-${newTier}`,
              unitPriceMinor: amountMinor,
              totalMinor: amountMinor,
            })
            .where(eq(schema.orderItems.orderId, ord.id));

          // Also update or register member with new duration
          updatedMember = await registerOrUpdateCustomerVip({
            phone: ord.customerPhone || "",
            email: ord.customerEmail,
            name: ord.customerName || undefined,
            tier: newTier,
            amountNpr,
            adminNotes: `Duration set to ${tierTitle} by Admin.`,
          });
        }
      }
    } catch (err) {
      console.error("[VipOrderStore] changeVipOrderTier DB error:", err);
    }
  }

  // 2. Update memory store
  const idx = memoryVipOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
  if (idx >= 0) {
    const prev = memoryVipOrders[idx];
    const updated: VipOrderRow = {
      ...prev,
      tier: newTier,
      tierTitle,
      amountNpr,
      amountMinor,
      notes: options?.adminNotes ? `${prev.notes || ""} | [TIER CHANGED: ${newTier}]` : prev.notes,
    };
    memoryVipOrders[idx] = updated;
    if (!updatedMember) {
      updatedMember = await registerOrUpdateCustomerVip({
        phone: prev.customerPhone,
        email: prev.customerEmail,
        name: prev.customerName,
        tier: newTier,
        amountNpr,
      });
    }
    return { order: updated, member: updatedMember };
  }

  const all = await getAllVipOrders(true);
  const found = all.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
  return { order: found, member: updatedMember };
}

export async function approveVipOrderAndActivateMember(
  orderId: string,
  options: {
    bonusDays?: number;
    bonusPerk?: string;
    customTag?: VipTag;
    adminNotes?: string;
    overrideTier?: "1_MONTH" | "6_MONTHS" | "LIFETIME" | "CUSTOM";
    overrideAmountNpr?: number;
    customDays?: number;
  }
): Promise<{ order: VipOrderRow | null; member: VipMember | null }> {
  // If overrideTier is specified (e.g. customer requested 6 months but admin grants 1 month), update tier first!
  if (options.overrideTier) {
    await changeVipOrderTier(orderId, options.overrideTier, {
      customDays: options.customDays,
      amountNpr: options.overrideAmountNpr,
      adminNotes: options.adminNotes,
    });
  }

  // Update order to PAID and FULFILLED
  const updatedOrder = await updateVipOrderStatus(
    orderId,
    "FULFILLED",
    options.adminNotes || "Approved & VIP Activated by Administrator"
  );

  if (!updatedOrder) {
    return { order: null, member: null };
  }

  const effectiveTier = options.overrideTier || updatedOrder.tier;
  const isLifetime = effectiveTier === "LIFETIME";
  const defaultTag: VipTag =
    options.customTag || (effectiveTier === "6_MONTHS" ? "PRO" : "VIP");

  // Activate member profile
  const member = await registerOrUpdateCustomerVip({
    phone: updatedOrder.customerPhone,
    name: updatedOrder.customerName,
    email: updatedOrder.customerEmail,
    tier: effectiveTier,
    vipTag: defaultTag,
    status: "ACTIVE",
    amountNpr: options.overrideAmountNpr || updatedOrder.amountNpr,
    adminNotes: `Activated from VIP Order #${updatedOrder.orderNumber}. Plan: ${effectiveTier}. ${options.adminNotes || ""}`,
  });

  // Apply VIP bonus if specified
  let finalMember = member;
  if (options.bonusDays && options.bonusDays > 0) {
    const upgraded = await allocateVipBonus(member.id, options.bonusDays, options.bonusPerk);
    if (upgraded) {
      finalMember = upgraded;
    }
  }

  // Sync memory order with new member state
  updatedOrder.isMemberActive = true;
  updatedOrder.currentVipTag = defaultTag;
  updatedOrder.memberId = finalMember.id;
  updatedOrder.tier = effectiveTier;
  updatedOrder.bonusDays = finalMember.bonusDays || 0;
  updatedOrder.bonusPerks = finalMember.bonusPerks || [];

  return { order: updatedOrder, member: finalMember };
}
