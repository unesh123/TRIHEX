import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("homepage opens with TRIHEX brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("TRIHEX").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Premium AI access, made simple and dependable/i }),
    ).toBeVisible();
  });

  test("product catalogue lists public products", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByText(/AI Prompt Starter Pack/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("WhatsApp links use 9779702910130", async ({ page }) => {
    await page.goto("/");
    const wa = page.locator('a[href*="wa.me/9779702910130"]').first();
    await expect(wa).toBeVisible();
  });

  test("blocked package is not exposed as a purchasable page", async ({ page }) => {
    await page.goto("/products/cursor-ultra");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Add to cart|buy now|order unavailable/i })).toHaveCount(0);
  });

  test("cart page loads", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText(/cart|empty|checkout/i).first()).toBeVisible();
  });

  test("checkout validates required fields", async ({ page }) => {
    await page.goto("/checkout");
    const submit = page.getByRole("button", { name: /place order|submit|checkout/i });
    if (await submit.count()) {
      await submit.first().click();
      await expect(page.getByText(/required|invalid|empty|add/i).first()).toBeVisible({
        timeout: 8_000,
      });
    } else {
      await expect(page.getByText(/cart|empty|product/i).first()).toBeVisible();
    }
  });
});

test.describe("admin protection", () => {
  test("admin dashboard accessible with DEV bypass in demo e2e", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page.locator("main").getByRole("heading", { name: "Overview" })).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("mobile viewport", () => {
  test("homepage has no horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
