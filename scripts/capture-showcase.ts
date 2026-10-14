import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  console.log("Navigating to https://trihexdigital.shop/vault...");
  await page.goto("https://trihexdigital.shop/vault", { waitUntil: "networkidle", timeout: 35000 });
  await page.waitForTimeout(3000);

  // Scroll down a bit to see showcase
  await page.evaluate(() => window.scrollBy(0, 350));
  await page.waitForTimeout(1000);

  const filePath = path.join(ARTIFACT_DIR, "live_vault_trix_showcase.png");
  await page.screenshot({ path: filePath });
  console.log("Saved screenshot:", filePath);

  // Also full page elite
  const elitePage = await context.newPage();
  await elitePage.goto("https://trihexdigital.shop/elite", { waitUntil: "networkidle", timeout: 35000 });
  await elitePage.evaluate(() => window.scrollBy(0, 1100));
  await elitePage.waitForTimeout(1000);
  const elitePath = path.join(ARTIFACT_DIR, "live_elite_trix_showcase.png");
  await elitePage.screenshot({ path: elitePath });
  console.log("Saved elite screenshot:", elitePath);

  await browser.close();
}

main().catch(console.error);
