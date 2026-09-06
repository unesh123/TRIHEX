import { NextResponse } from "next/server";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { or, eq, inArray, desc } from "drizzle-orm";
import { getMerchCardBySlug } from "@/lib/catalog/merchandising";

export const dynamic = "force-dynamic";

export interface SocialProofEvent {
  id: string;
  name: string;
  city: string;
  product: string;
  slug: string;
  timeAgo: string;
  tag: string;
}

function maskCustomerName(fullName?: string | null): string {
  if (!fullName || fullName.trim().length === 0) {
    return "Verified Buyer";
  }
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    const first = parts[0];
    return first.length > 2
      ? `${first.slice(0, 1).toUpperCase()}${first.slice(1, 3)}...`
      : first;
  }
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || "";
  return `${first} ${lastInitial ? `${lastInitial}.` : ""}`.trim();
}

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return "Recently";
  const then = new Date(date).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(1, Math.floor((now - then) / 60000));

  if (diffMinutes < 2) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 14) return `${diffDays}d ago`;
  return `${diffDays}d ago`;
}

function resolveProductSlug(productName: string, sku: string): { name: string; slug: string } {
  // Check if SKU directly matches merchandising catalog
  const merch = getMerchCardBySlug(sku.toLowerCase());
  if (merch) {
    return { name: merch.title, slug: merch.slug };
  }

  // Common known mappings
  const norm = (productName + " " + sku).toLowerCase();
  if (norm.includes("cursor")) return { name: "Cursor Pro 12M", slug: "cursor-pro-12m" };
  if (norm.includes("chatgpt")) return { name: "ChatGPT Plus Dedicated", slug: "chatgpt-plus-1-month-fw" };
  if (norm.includes("claude")) return { name: "Claude Code API Access", slug: "claude-code-api-access" };
  if (norm.includes("gemini") || norm.includes("google ai")) return { name: "Google AI Pro 5TB", slug: "gemini-pro-18-months-link" };
  if (norm.includes("elevenlabs")) return { name: "ElevenLabs Creator Voice", slug: "elevenlabs-creator-shared" };
  if (norm.includes("canva")) return { name: "Canva Pro 1-Year", slug: "canva-pro-1-year" };
  if (norm.includes("manus")) return { name: "Manus AI Pro Agent", slug: "manus-ai-pro-12m" };
  if (norm.includes("capcut")) return { name: "CapCut Pro Video Suite", slug: "capcut-pro-30-days" };
  if (norm.includes("udemy") || norm.includes("16")) return { name: "Udemy 16 AI Agent Pack", slug: "udemy-16-developer-ai-agent-pack" };
  if (norm.includes("money") || norm.includes("aimoney")) return { name: "AI Money Maker Course", slug: "ai-money-maker-digital-course-2026" };
  if (norm.includes("psychology") || norm.includes("closing")) return { name: "The Psychology of Closing", slug: "the-psychology-of-closing-bundle" };
  if (norm.includes("rebel") || norm.includes("passive")) return { name: "The Passive Rebel", slug: "the-passive-rebel-antisocial-leads" };

  return { name: productName, slug: "catalog" };
}

export async function GET() {
  try {
    const db = requireDb();

    // Query real verified/paid/processing orders
    const recentOrders = await db
      .select({
        id: schema.orders.id,
        customerName: schema.orders.customerName,
        placedAt: schema.orders.placedAt,
        createdAt: schema.orders.createdAt,
        orderStatus: schema.orders.orderStatus,
        paymentStatus: schema.orders.paymentStatus,
      })
      .from(schema.orders)
      .where(
        or(
          inArray(schema.orders.orderStatus, [
            "PAID",
            "COMPLETED",
            "PROCESSING",
            "FULFILLED",
          ]),
          inArray(schema.orders.paymentStatus, ["PAID"])
        )
      )
      .orderBy(desc(schema.orders.createdAt))
      .limit(10);

    if (!recentOrders || recentOrders.length === 0) {
      return NextResponse.json({ ok: true, events: [] });
    }

    // Load order items for these orders
    const orderIds = recentOrders.map((o) => o.id);
    const items = await db
      .select({
        orderId: schema.orderItems.orderId,
        productName: schema.orderItems.productName,
        sku: schema.orderItems.sku,
      })
      .from(schema.orderItems)
      .where(inArray(schema.orderItems.orderId, orderIds));

    const events: SocialProofEvent[] = [];

    for (const order of recentOrders) {
      const orderItemsList = items.filter((it) => it.orderId === order.id);
      const primaryItem = orderItemsList[0];
      if (!primaryItem) continue;

      const { name: productName, slug: productSlug } = resolveProductSlug(
        primaryItem.productName,
        primaryItem.sku
      );

      events.push({
        id: `sp-${order.id.slice(0, 8)}`,
        name: maskCustomerName(order.customerName),
        city: "Nepal",
        product: productName,
        slug: productSlug,
        timeAgo: formatTimeAgo(order.placedAt || order.createdAt),
        tag: "Verified Order",
      });
    }

    return NextResponse.json({
      ok: true,
      events,
    });
  } catch {
    // If DB is unavailable or unseeded, safely return empty array — zero fake social proof
    return NextResponse.json({ ok: true, events: [] });
  }
}
