import { describe, it, expect, beforeEach } from "vitest";
import {
  getSavedItems,
  toggleSavedItem,
  isItemSaved,
  mergeGuestSavedItems,
  resetSavedItemsForTest,
} from "@/lib/saved/store";

describe("Personalization & Saved Items Engine", () => {
  beforeEach(() => {
    resetSavedItemsForTest();
  });

  it("toggles item bookmarking on and off", async () => {
    const userId = "guest_test_user_1";
    const entityType = "DEAL";
    const entityId = "deal-digitalocean-credits";

    // 1. Initial state: not saved
    expect(await isItemSaved(userId, entityType, entityId)).toBe(false);

    // 2. Toggle ON
    const added = await toggleSavedItem(userId, entityType, entityId);
    expect(added.saved).toBe(true);
    expect(added.count).toBe(1);
    expect(await isItemSaved(userId, entityType, entityId)).toBe(true);

    // 3. Verify retrieved list
    const items = await getSavedItems(userId);
    expect(items.length).toBe(1);
    expect(items[0].entityId).toBe(entityId);
    expect(items[0].metadata?.title).toBeDefined();

    // 4. Toggle OFF
    const removed = await toggleSavedItem(userId, entityType, entityId);
    expect(removed.saved).toBe(false);
    expect(removed.count).toBe(0);
    expect(await isItemSaved(userId, entityType, entityId)).toBe(false);
  });

  it("isolates saved items between different users and guests", async () => {
    await toggleSavedItem("user_A", "PROMPT", "pc-linux-terminal");
    await toggleSavedItem("user_B", "SKILL", "supabase-fullstack-ops");

    const itemsA = await getSavedItems("user_A");
    const itemsB = await getSavedItems("user_B");

    expect(itemsA.length).toBe(1);
    expect(itemsA[0].entityId).toBe("pc-linux-terminal");

    expect(itemsB.length).toBe(1);
    expect(itemsB[0].entityId).toBe("supabase-fullstack-ops");
  });

  it("merges guest session bookmarks into user account seamlessly upon login", async () => {
    const guestId = "guest_temp_999";
    const authUserId = "user_real_456";

    // Guest saves two items
    await toggleSavedItem(guestId, "DEAL", "deal-digitalocean-credits");
    await toggleSavedItem(guestId, "PROMPT", "pc-linux-terminal");

    // Authenticated user already had one of them
    await toggleSavedItem(authUserId, "DEAL", "deal-digitalocean-credits");

    // Merge guest items into user account
    const mergedCount = await mergeGuestSavedItems(guestId, authUserId);
    expect(mergedCount).toBe(1); // Only the prompt was newly merged

    // Authenticated user now has both items
    const userItems = await getSavedItems(authUserId);
    expect(userItems.length).toBe(2);
    expect(await isItemSaved(authUserId, "DEAL", "deal-digitalocean-credits")).toBe(true);
    expect(await isItemSaved(authUserId, "PROMPT", "pc-linux-terminal")).toBe(true);

    // Guest session is cleaned up
    const guestItems = await getSavedItems(guestId);
    expect(guestItems.length).toBe(0);
  });
});
