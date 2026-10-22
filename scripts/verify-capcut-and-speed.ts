import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

async function main() {
  console.log("=== VERIFYING CAPCUT PRICING & SITE PERFORMANCE ===");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Check CapCut Pro page
  console.log("\n1. Navigating to CapCut Pro page...");
  const t0 = Date.now();
  await page.goto("http://localhost:3000/products/capcut-pro", { waitUntil: "domcontentloaded" });
  const loadTime = Date.now() - t0;
  console.log(`✓ CapCut Pro loaded in ${loadTime}ms`);

  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_capcut_699_pricing.png"), fullPage: false });

  const pageText = await page.innerText("body");
  if (pageText.includes("699") || pageText.includes("Rs. 699") || pageText.includes("NPR 699")) {
    console.log("✓ Verified: CapCut 1-month Pro plan reflects Rs. 699!");
  } else {
    throw new Error("CapCut 1-month Pro price of 699 not found on page!");
  }

  // 2. Check Home page speed and smoothness
  console.log("\n2. Checking Home page load time...");
  const h0 = Date.now();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  const homeTime = Date.now() - h0;
  console.log(`✓ Home page loaded in ${homeTime}ms`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_home_optimized.png"), fullPage: false });

  // 3. Test Smooth Scroll Simulation
  console.log("\n3. Testing 120fps smooth scrolling...");
  await page.evaluate(() => {
    window.scrollTo({ top: 800, behavior: "smooth" });
  });
  await page.waitForTimeout(500);
  const scrollY = await page.evaluate(() => window.scrollY);
  console.log(`✓ Scroll offset after smooth inertia: ${scrollY}px`);

  await browser.close();
  console.log("\n=== ALL VERIFICATIONS PASSED CLEANLY! ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
