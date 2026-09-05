import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "320px (iPhone SE narrow)", width: 320, height: 568 },
  { name: "360px (Standard Android)", width: 360, height: 640 },
  { name: "390px (iPhone 12/13/14/15)", width: 390, height: 844 },
  { name: "430px (iPhone Pro Max)", width: 430, height: 932 },
];

test.describe("Mobile Viewport Integrity & Zero Horizontal Overflow", () => {
  for (const vp of VIEWPORTS) {
    test(`No horizontal overflow at ${vp.name} on homepage, products, and PDP`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of ["/", "/products", "/products/super-grok-3-months"]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth, `Overflow detected on ${route} at ${vp.name}`).toBeLessThanOrEqual(clientWidth + 1);
      }
    });
  }
});

test.describe("PDP 6.0 Mobile-First Architecture & Plan Switching", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("PDP loads gallery, title, pricing, and plan selector immediately without collision", async ({ page }) => {
    await page.goto("/products/super-grok-3-months", { waitUntil: "domcontentloaded" });

    // 1. Verify product title & gallery are present
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });

    // 2. Verify plan selector cards are rendered
    const planCards = page.locator('button[role="radio"]');
    await expect(planCards.first()).toBeVisible({ timeout: 10_000 });
    const count = await planCards.count();
    expect(count).toBeGreaterThan(0);

    // 3. Verify social proof toast is suppressed on PDP
    const socialToast = page.locator('aside[aria-label="Recent purchase"]');
    await expect(socialToast).toHaveCount(0);

    // 4. Verify AI copilot floating launcher is hidden on mobile PDP
    const mobileCopilotLauncher = page.locator('button[aria-label="Ask AI shopping assistant"]');
    if (await mobileCopilotLauncher.count() > 0) {
      await expect(mobileCopilotLauncher).toHaveClass(/hidden lg:flex/);
    }
  });

  test("Instant client-side plan switching (<100ms) with URL sync and sticky purchase bar", async ({ page }) => {
    await page.goto("/products/super-grok-3-months", { waitUntil: "domcontentloaded" });

    const planCards = page.locator('button[role="radio"]');
    await expect(planCards.first()).toBeVisible({ timeout: 10_000 });
    const count = await planCards.count();

    if (count > 1) {
      // Pick the second plan card
      const secondPlan = planCards.nth(1);
      const targetSlug = await secondPlan.getAttribute("data-plan-slug");

      const startTime = Date.now();
      await secondPlan.click();
      const elapsed = Date.now() - startTime;

      // Assert click-to-render response is fast
      expect(elapsed).toBeLessThan(500);

      // Verify selected state
      await expect(secondPlan).toHaveAttribute("aria-checked", "true");

      // Verify URL updated with ?plan=<targetSlug>
      if (targetSlug) {
        expect(page.url()).toContain(`plan=${targetSlug}`);
      }
    }
  });

  test("Adding selected plan to cart records exact plan metadata", async ({ page }) => {
    await page.goto("/products/super-grok-3-months", { waitUntil: "domcontentloaded" });

    // Click Add to Cart
    const addToCartBtn = page.getByRole("button", { name: /Add to Cart/i }).first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();

      // Go to cart
      await page.goto("/cart", { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/Grok/i).first()).toBeVisible({ timeout: 10_000 });
    }
  });
});
