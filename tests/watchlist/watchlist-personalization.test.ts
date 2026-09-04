import { describe, it, expect, beforeEach } from "vitest";
import {
  createWatchlistAlert,
  getWatchlistAlerts,
  toggleWatchlistAlert,
  deleteWatchlistAlert,
  evaluateWatchlistTriggers,
  resetWatchlistsStoreForTest,
} from "@/lib/watchlist/store";
import { getPersonalizedRecommendations } from "@/lib/personalization/user-intent";

describe("Watchlist Engine & Personalization System", () => {
  beforeEach(() => {
    resetWatchlistsStoreForTest([]);
  });

  it("creates, queries, toggles, and deletes watchlist alerts", async () => {
    const alert = await createWatchlistAlert({
      userId: "test-user-1",
      entityType: "FOREX",
      entityId: "USD",
      condition: "RATE_ABOVE",
      targetValue: "135.00",
      channel: "BROWSER",
    });

    expect(alert.id).toBeDefined();
    expect(alert.enabled).toBe(true);

    const list = await getWatchlistAlerts("test-user-1");
    expect(list.length).toBe(1);
    expect(list[0].entityId).toBe("USD");

    // Toggle paused
    await toggleWatchlistAlert(alert.id, false, "test-user-1");
    const toggledList = await getWatchlistAlerts("test-user-1");
    expect(toggledList[0].enabled).toBe(false);

    // Delete
    await deleteWatchlistAlert(alert.id, "test-user-1");
    const emptyList = await getWatchlistAlerts("test-user-1");
    expect(emptyList.length).toBe(0);
  });

  it("evaluates live forex rate thresholds for trigger notifications", async () => {
    // Create an alert with a low target that will definitely trigger with real/baseline rates (~134-135)
    const alert = await createWatchlistAlert({
      userId: "test-user-2",
      entityType: "FOREX",
      entityId: "USD",
      condition: "RATE_ABOVE",
      targetValue: "100.00",
      channel: "BROWSER",
    });

    const triggers = await evaluateWatchlistTriggers("test-user-2");
    expect(triggers.length).toBe(1);
    expect(triggers[0].alertId).toBe(alert.id);
    expect(triggers[0].triggered).toBe(true);
    expect(triggers[0].reason).toContain("USD sell rate is Rs.");
  });

  it("generates personalized recommendations for returning users with browsing history", async () => {
    const recommendations = await getPersonalizedRecommendations({
      recentProductSlugs: ["jetbrains-all-products-pack"],
      recentCategories: ["Developer Tools"],
      savedEntityIds: [],
    });

    expect(recommendations.length).toBeGreaterThanOrEqual(1);
    expect(recommendations[0].title).toBeDefined();
    expect(recommendations[0].url).toBeDefined();
  });

  it("provides cold-start recommendations when user has no browsing history", async () => {
    const coldRecommendations = await getPersonalizedRecommendations({
      recentProductSlugs: [],
      recentCategories: [],
      savedEntityIds: [],
    });

    expect(coldRecommendations.length).toBeGreaterThanOrEqual(1);
    expect(coldRecommendations[0].badge).toBeDefined();
  });
});
