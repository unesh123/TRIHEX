/**
 * Order store facade — delegates to repositories.
 * In-memory Maps removed from the production path.
 */

import type { CreatedOrder } from "@/lib/checkout/create-order";
import { getRepositories } from "@/lib/repositories";
import {
  getPublicOrderTimeline as buildTimeline,
  type PublicOrderTimelineEvent,
} from "@/lib/checkout/order-timeline";

export interface StoredOrder extends CreatedOrder {
  secureToken: string;
}

export type { PublicOrderTimelineEvent };

export async function saveOrder(order: CreatedOrder): Promise<StoredOrder> {
  const repos = getRepositories();
  return repos.orders.save(order);
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<StoredOrder | null> {
  const repos = getRepositories();
  return repos.orders.getByNumber(orderNumber);
}

export async function getOrderBySecureToken(
  token: string,
): Promise<StoredOrder | null> {
  const repos = getRepositories();
  return repos.orders.getBySecureToken(token);
}

export function getPublicOrderTimeline(
  order: StoredOrder,
): PublicOrderTimelineEvent[] {
  return buildTimeline(order);
}
