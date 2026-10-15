import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

async function run() {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 950 } });
  const page = await context.newPage();

  // 1. Visit Homepage
  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Take hero screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_hero_vip_buttons.png"), fullPage: false });
  console.log("Saved v3_hero_vip_buttons.png");

  // Scroll to Expert Recommendations & VIP Board
  console.log("Scrolling to Expert Recommendations & VIP Decision Board...");
  const recommendationsSection = page.locator("#expert-recommendations");
  if (await recommendationsSection.isVisible()) {
    await recommendationsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_expert_recommendations_board.png"), fullPage: false });
    console.log("Saved v3_expert_recommendations_board.png");
  }

  // 2. Visit Cursor Pro 12M Product Page
  console.log("Navigating to http://localhost:3000/products/cursor-pro-12m...");
  await page.goto("http://localhost:3000/products/cursor-pro-12m", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_cursor_pro_pricing.png"), fullPage: false });
  console.log("Saved v3_cursor_pro_pricing.png");

  await browser.close();
  console.log("Verification completed successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
