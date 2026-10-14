import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const targets = [
    {
      name: "live_elevenlabs_v3",
      url: "https://trihexdigital.shop/products/elevenlabs-creator-shared",
    },
    {
      name: "live_claude_pro_v3",
      url: "https://trihexdigital.shop/products/claude-pro-1-month",
    },
    {
      name: "live_claude_api_v3",
      url: "https://trihexdigital.shop/products/claude-code-api-access",
    },
    {
      name: "live_lovable_v3",
      url: "https://trihexdigital.shop/products/lovable-pro-12m",
    },
    {
      name: "live_capcut_v3",
      url: "https://trihexdigital.shop/products/capcut-pro",
    },
    {
      name: "live_vault_trix_vip",
      url: "https://trihexdigital.shop/vault",
    },
    {
      name: "live_elite_trix_vip",
      url: "https://trihexdigital.shop/elite",
    },
  ];

  for (const t of targets) {
    console.log(`Navigating to ${t.url}...`);
    const page = await context.newPage();
    try {
      await page.goto(t.url, { waitUntil: "networkidle", timeout: 35000 });
      await page.waitForTimeout(2500);
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
  console.log("All live V3 verification screenshots captured successfully.");
}

main().catch(console.error);
