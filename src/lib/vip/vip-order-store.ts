import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, inArray, desc, or, ilike } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/env";
import { getRepositories } from "@/lib/repositories";
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
}

// Baseline realistic seed VIP orders for immediate administration
const BASELINE_VIP_ORDERS: VipOrderRow[] = [
  {
    id: "ord-vip-life-001",
    orderNumber: "THX-261017-965347",
    customerName: "Binod Adhikari",
    customerPhone: "9801234567",
    customerEmail: "binod.ai@gmail.com",
    tier: "LIFETIME",
    tierTitle: "Lifetime VIP Pass (Permanent Unrestricted)",
    amountNpr: 7999,
    amountMinor: 799900,
    orderStatus: "PROCESSING",
    paymentStatus: "UNDER_REVIEW",
    fulfillmentStatus: "NOT_STARTED",
    paymentMethod: "BANK_TRANSFER",
    proofUrl: "/media/payments/bank-qr.webp",
    senderReference: "NBL-TX-99812",
    placedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    notes: "Customer deposited Rs. 7,999 via Nabil Bank Mobile QR. Requesting immediate VIP Vault access.",
    itemsSummary: "Permanent Lifetime VIP Pack (All Vault Drops Unlocked)",
    memberId: null,
    currentVipTag: "VIP",
    isMemberActive: false,
    isLocked: false,
    bonusDays: 0,
    bonusPerks: ["Priority Founder Hotline", "Uncapped AI Model Leaks"],
  },
  {
    id: "ord-vip-6m-002",
    orderNumber: "THX-261017-267073",
    customerName: "Ramesh Shrestha",
    customerPhone: "9841399201",
    customerEmail: "ramesh.kth@gmail.com",
    tier: "6_MONTHS",
    tierTitle: "6 Months VIP Pass (180 Days)",
    amountNpr: 5999,
    amountMinor: 599900,
    orderStatus: "PAID",
    paymentStatus: "PAID",
    fulfillmentStatus: "DELIVERED",
    paymentMethod: "ESEWA_MANUAL",
    proofUrl: "/media/payments/bank-qr.webp",
    senderReference: "ESW-VIP-88219",
    placedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    notes: "6-Month VIP pass activated. VIP tag PRO granted with bonus 30 days.",
    itemsSummary: "6 Months VIP Pass (180 Days Full Vault Access)",
    memberId: "vip-client-kth-01",
    currentVipTag: "PRO",
    isMemberActive: true,
    isLocked: false,
    bonusDays: 30,
    bonusPerks: ["Midjourney Pro Prompts Pack"],
  },
  {
    id: "ord-vip-1m-003",
    orderNumber: "THX-261016-512084",
    customerName: "Anita Gurung",
    customerPhone: "9818442099",
    customerEmail: "anita.gurung@outlook.com",
    tier: "1_MONTH",
    tierTitle: "1 Month VIP Pass (30 Days)",
    amountNpr: 3999,
    amountMinor: 399900,
    orderStatus: "PAID",
    paymentStatus: "PAID",
    fulfillmentStatus: "DELIVERED",
    paymentMethod: "KHALTI_MANUAL",
    proofUrl: null,
    senderReference: "KHLT-772910",
    placedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    notes: "1-Month VIP subscription activated via Khalti.",
    itemsSummary: "1 Month VIP Pass (30 Days Full Access)",
    memberId: "vip-client-pkr-02",
    currentVipTag: "VIP",
    isMemberActive: true,
    isLocked: false,
    bonusDays: 7,
    bonusPerks: ["Standard Fast-Track Support"],
  },
];

// In-memory cache of live-updated VIP orders
let memoryVipOrders: VipOrderRow[] = [...BASELINE_VIP_ORDERS];

export async function createVipOrder(data: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  tierId: string;
  tierName?: string;
  amountNpr: number;
  paymentMethod?: string;
  transactionReference?: string;
  status?: string;
  deviceTelemetry?: string;
  notes?: string;
}): Promise<VipOrderRow> {
  const tier = (data.tierId as "1_MONTH" | "6_MONTHS" | "LIFETIME" | "CUSTOM") || "1_MONTH";
  const tierTitles: Record<string, string> = {
    "1_MONTH": "1 Month VIP Pass (30 Days)",
    "6_MONTHS": "6 Months VIP Pass (180 Days)",
    "LIFETIME": "Lifetime VIP Pass (Permanent Unrestricted)",
    "CUSTOM": "VIP Custom Clearance",
  };

  const id = `ord-vip-${Date.now().toString(36)}`;
  const orderNumber = `THX-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: VipOrderRow = {
    id,
    orderNumber,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    tier,
    tierTitle: data.tierName || tierTitles[tier] || "VIP Access Pass",
    amountNpr: data.amountNpr,
    amountMinor: data.amountNpr * 100,
    orderStatus: data.status === "ACTIVE" ? "PAID" : "PROCESSING",
    paymentStatus: data.status === "ACTIVE" ? "PAID" : "UNDER_REVIEW",
    fulfillmentStatus: data.status === "ACTIVE" ? "DELIVERED" : "NOT_STARTED",
    paymentMethod: data.paymentMethod || "BANK_QR",
    proofUrl: null,
    senderReference: data.transactionReference || null,
    placedAt: new Date().toISOString(),
    notes: data.notes || "VIP access request submitted.",
    itemsSummary: `${tierTitles[tier] || "VIP Pass"} (Full Vault Access)`,
    isMemberActive: data.status === "ACTIVE",
    currentVipTag: data.status === "ACTIVE" ? "VIP" : "NORMAL",
  };

  memoryVipOrders.unshift(newOrder);
  return newOrder;
}

export async function getAllVipOrders(): Promise<VipOrderRow[]> {
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

            if (isVipSku || isVipAmount || isVipNotes) {
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
              } else if (ord.grandTotalMinor === 399900) {
                tier = "1_MONTH";
                tierTitle = "1 Month VIP Pass (30 Days)";
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

              results.push({
                id: ord.id,
                orderNumber: ord.orderNumber,
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
                itemsSummary:
                  matchingItems.map((i) => `${i.productName} (${i.variantName})`).join(", ") ||
                  tierTitle,
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

        await db
          .update(schema.orders)
          .set(updates)
          .where(eq(schema.orders.id, orderId));
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

  const all = await getAllVipOrders();
  return all.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
}

export async function approveVipOrderAndActivateMember(
  orderId: string,
  options: {
    bonusDays?: number;
    bonusPerk?: string;
    customTag?: VipTag;
    adminNotes?: string;
  }
): Promise<{ order: VipOrderRow | null; member: VipMember | null }> {
  // Update order to PAID and FULFILLED
  const updatedOrder = await updateVipOrderStatus(
    orderId,
    "FULFILLED",
    options.adminNotes || "Approved & VIP Activated by Administrator"
  );

  if (!updatedOrder) {
    return { order: null, member: null };
  }

  const isLifetime = updatedOrder.tier === "LIFETIME";
  const defaultTag: VipTag =
    options.customTag || (updatedOrder.tier === "6_MONTHS" ? "PRO" : "VIP");

  // Activate member profile
  const member = await registerOrUpdateCustomerVip({
    phone: updatedOrder.customerPhone,
    name: updatedOrder.customerName,
    email: updatedOrder.customerEmail,
    tier: updatedOrder.tier,
    vipTag: defaultTag,
    status: "ACTIVE",
    amountNpr: updatedOrder.amountNpr,
    adminNotes: `Activated from VIP Order #${updatedOrder.orderNumber}. ${options.adminNotes || ""}`,
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
  updatedOrder.bonusDays = finalMember.bonusDays || 0;
  updatedOrder.bonusPerks = finalMember.bonusPerks || [];

  return { order: updatedOrder, member: finalMember };
}
