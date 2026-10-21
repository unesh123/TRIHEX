import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  recordProductView,
  getRecentlyViewedProducts,
  clearRecentlyViewedProducts,
} from "@/lib/storefront/recently-viewed";

describe("Storefront Recently Viewed Products Tracker", () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    });
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
    });
  });

  it("records new product view and prepends to history", () => {
    recordProductView({
      slug: "gemini-pro-18-months",
      title: "Gemini Advanced 18 Months",
      priceNprMinor: 39900,
      brandFamily: "gemini",
    });

    const items = getRecentlyViewedProducts();
    expect(items).toHaveLength(1);
    expect(items[0].slug).toBe("gemini-pro-18-months");
    expect(items[0].title).toBe("Gemini Advanced 18 Months");
    expect(items[0].viewedAt).toBeGreaterThan(0);
  });

  it("deduplicates multiple visits to the same slug", () => {
    recordProductView({
      slug: "chatgpt-plus-1-month",
      title: "ChatGPT Plus 1 Month",
      priceNprMinor: 69900,
      brandFamily: "chatgpt",
    });

    recordProductView({
      slug: "gemini-pro-18-months",
      title: "Gemini Advanced 18 Months",
      priceNprMinor: 39900,
      brandFamily: "gemini",
    });

    // Re-visit chatgpt
    recordProductView({
      slug: "chatgpt-plus-1-month",
      title: "ChatGPT Plus 1 Month",
      priceNprMinor: 69900,
      brandFamily: "chatgpt",
    });

    const items = getRecentlyViewedProducts();
    expect(items).toHaveLength(2);
    // Most recent is first
    expect(items[0].slug).toBe("chatgpt-plus-1-month");
    expect(items[1].slug).toBe("gemini-pro-18-months");
  });

  it("clears history on user request", () => {
    recordProductView({
      slug: "canva-pro-1-year",
      title: "Canva Pro 1 Year",
      priceNprMinor: 49900,
      brandFamily: "canva",
    });

    expect(getRecentlyViewedProducts()).toHaveLength(1);

    clearRecentlyViewedProducts();
    expect(getRecentlyViewedProducts()).toHaveLength(0);
  });
});
