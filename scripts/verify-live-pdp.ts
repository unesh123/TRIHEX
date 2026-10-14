import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const targets = [
    {
      name: "live_chatgpt_plans",
      url: "https://trihexdigital.shop/products/chatgpt-plus-1-month-fw",
    },
    {
      name: "live_capcut_plans",
      url: "https://trihexdigital.shop/products/capcut-pro-30-days",
    },
    {
      name: "live_elevenlabs_clean",
      url: "https://trihexdigital.shop/products/elevenlabs-creator-shared",
    },
    {
      name: "live_products_catalog",
      url: "https://trihexdigital.shop/products",
    },
  ];

  for (const t of targets) {
    console.log(`Navigating to ${t.url}...`);
    const page = await context.newPage();
    try {
      await page.goto(t.url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(2000);
      const filePath = path.join(ARTIFACT_DIR, `${t.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot to ${filePath}`);
    } catch (err) {
      console.error(`Error capturing ${t.name}:`, err);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("All live screenshots captured successfully.");
}

main().catch(console.error);
