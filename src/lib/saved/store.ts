import { SavedItem, SavedEntityType, SavedItemMetadata } from "./types";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getDealCandidateById } from "@/lib/deals/store";
import { getPromptById, getPromptBySlug } from "@/lib/prompts/store";
import { getSkillBySlug } from "@/lib/skills/store";
import { listPublicProducts } from "@/lib/catalog/storefront-catalog";

// In-memory mirror for low-latency reads and offline tests
let inMemorySavedItems: SavedItem[] = [];

/**
 * Hydrates title, URL, and category badge from corresponding entity store.
 */
export async function hydrateSavedItemMetadata(
  entityType: SavedEntityType,
  entityId: string
): Promise<SavedItemMetadata> {
  switch (entityType) {
    case "DEAL": {
      const deal = getDealCandidateById(entityId);
      if (deal) {
        return {
          title: deal.title,
          description: deal.summary,
          url: "/deals",
          badge: deal.dealType,
          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          priceOrValue: deal.detectedValueNprMinor
            ? `Value: NPR ${(deal.detectedValueNprMinor / 100).toLocaleString()}`
            : "Free / Discount",
        };
      }
      break;
    }
    case "PROMPT": {
      const prompt = getPromptById(entityId) || getPromptBySlug(entityId);
      if (prompt) {
        return {
          title: prompt.title,
          description: prompt.description,
          url: `/prompts/${prompt.slug}`,
          badge: prompt.category,
          badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          priceOrValue: `${prompt.variables.length} Variables`,
        };
      }
      break;
    }
    case "SKILL": {
      const skill = getSkillBySlug(entityId);
      if (skill) {
        return {
          title: skill.name,
          description: skill.summary,
          url: "/skills",
          badge: skill.category,
          badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          priceOrValue: `${skill.files.length} Files`,
        };
      }
      break;
    }
    case "PRODUCT": {
      try {
        const products = await listPublicProducts();
        const prod = products.find((p) => p.slug === entityId || (p as any).id === entityId);
        if (prod) {
          return {
            title: prod.name,
            description: prod.shortDescription || "",
            url: `/products/${prod.slug}`,
            badge: prod.brandName || "Software",
            badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
            priceOrValue: prod.priceNprMinor != null
              ? `NPR ${(prod.priceNprMinor / 100).toLocaleString()}`
              : "Price on request",
          };
        }
      } catch (err) {
        console.error("[saved-store] Failed to load product for saved item:", err);
      }
      break;
    }
  }

  return {
    title: entityId,
    description: "",
    url: "#",
    badge: entityType,
    badgeColor: "bg-slate-800 text-slate-300 border-white/10",
  };
}

/**
 * Returns list of saved items for a user/guest with metadata populated.
 */
export async function getSavedItems(userId: string): Promise<SavedItem[]> {
  const db = getDb();
  let rawItems: Array<{ id: string; userId: string; entityType: string; entityId: string; createdAt: Date | string }> = [];

  if (db) {
    try {
      const rows = await db
        .select()
        .from(schema.savedItems)
        .where(eq(schema.savedItems.userId, userId));
      rawItems = rows;
    } catch (e) {
      console.error("[saved-store] DB read failed, falling back to memory:", e);
      rawItems = inMemorySavedItems.filter((i) => i.userId === userId);
    }
  } else {
    rawItems = inMemorySavedItems.filter((i) => i.userId === userId);
  }

  const results: SavedItem[] = [];
  for (const row of rawItems) {
    const entityType = row.entityType as SavedEntityType;
    const metadata = await hydrateSavedItemMetadata(entityType, row.entityId);
    results.push({
      id: row.id,
      userId: row.userId,
      entityType,
      entityId: row.entityId,
      createdAt: typeof row.createdAt === "string" ? row.createdAt : row.createdAt.toISOString(),
      metadata,
    });
  }

  return results;
}

/**
 * Checks if a specific item is currently saved by user/guest.
 */
export async function isItemSaved(
  userId: string,
  entityType: SavedEntityType,
  entityId: string
): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(schema.savedItems)
        .where(
          and(
            eq(schema.savedItems.userId, userId),
            eq(schema.savedItems.entityType, entityType),
            eq(schema.savedItems.entityId, entityId)
          )
        )
        .limit(1);
      return !!row;
    } catch (e) {
      console.error("[saved-store] DB check failed, checking memory:", e);
    }
  }

  return inMemorySavedItems.some(
    (i) => i.userId === userId && i.entityType === entityType && i.entityId === entityId
  );
}

/**
 * Toggles bookmark: adds if not saved, removes if already saved.
 */
export async function toggleSavedItem(
  userId: string,
  entityType: SavedEntityType,
  entityId: string
): Promise<{ saved: boolean; count: number }> {
  const existingIdx = inMemorySavedItems.findIndex(
    (i) => i.userId === userId && i.entityType === entityType && i.entityId === entityId
  );

  const db = getDb();

  if (existingIdx >= 0) {
    // Remove
    inMemorySavedItems.splice(existingIdx, 1);
    if (db) {
      try {
        await db
          .delete(schema.savedItems)
          .where(
            and(
              eq(schema.savedItems.userId, userId),
              eq(schema.savedItems.entityType, entityType),
              eq(schema.savedItems.entityId, entityId)
            )
          );
      } catch (e) {
        console.error("[saved-store] DB delete error:", e);
      }
    }
    const currentCount = inMemorySavedItems.filter((i) => i.userId === userId).length;
    return { saved: false, count: currentCount };
  } else {
    // Add
    const now = new Date();
    const newItem: SavedItem = {
      id: `save-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      entityType,
      entityId,
      createdAt: now.toISOString(),
    };
    inMemorySavedItems.unshift(newItem);

    if (db) {
      try {
        await db.insert(schema.savedItems).values({
          userId,
          entityType,
          entityId,
          createdAt: now,
        }).onConflictDoNothing();
      } catch (e) {
        console.error("[saved-store] DB insert error:", e);
      }
    }

    const currentCount = inMemorySavedItems.filter((i) => i.userId === userId).length;
    return { saved: true, count: currentCount };
  }
}

/**
 * Merges guest bookmarks into authenticated user account upon login.
 */
export async function mergeGuestSavedItems(
  guestUserId: string,
  authUserId: string
): Promise<number> {
  let mergedCount = 0;
  const guestItems = await getSavedItems(guestUserId);

  for (const item of guestItems) {
    const alreadySaved = await isItemSaved(authUserId, item.entityType, item.entityId);
    if (!alreadySaved) {
      await toggleSavedItem(authUserId, item.entityType, item.entityId);
      mergedCount++;
    }
    // Remove guest item
    await toggleSavedItem(guestUserId, item.entityType, item.entityId);
  }

  return mergedCount;
}

/** Reset in-memory saved store for tests */
export function resetSavedItemsForTest(items?: SavedItem[]): void {
  inMemorySavedItems = items ? [...items] : [];
}
