const { chromium } = require("playwright");
const path = require("path");

async function main() {
  console.log("Launching browser for verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const artifactDir = "C:\\Users\\unesh\\.gemini\\antigravity\\brain\\7d5185dc-d73a-499c-94ed-ab512eb62556";

  // 1. Verify /deals & in-app DealClaimModal
  console.log("Navigating to http://localhost:3000/deals...");
  await page.goto("http://localhost:3000/deals", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Find a Claim button and click it
  const claimButton = page.locator('button:has-text("Claim Deal"), button:has-text("Access Perk")').first();
  if (await claimButton.count() > 0) {
    console.log("Clicking Claim Deal button to test in-app modal...");
    await claimButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, "v3_deals_modal.png") });
    console.log("Captured v3_deals_modal.png");
  }

  // 2. Verify /compare & Attraction Pop-up
  console.log("Navigating to http://localhost:3000/compare...");
  await page.goto("http://localhost:3000/compare", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Click Architect's Match Verdict button
  const verdictBtn = page.locator('button:has-text("View Architect\'s Match Verdict")');
  if (await verdictBtn.count() > 0) {
    console.log("Clicking Architect's Match Verdict button...");
    await verdictBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, "v3_compare_attraction.png") });
    console.log("Captured v3_compare_attraction.png");
  }

  // 3. Verify /vip & VIP Pricing Cards + Checkout Modal
  console.log("Navigating to http://localhost:3000/vip...");
  await page.goto("http://localhost:3000/vip", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Scroll to #vip-pricing
  const pricingSection = page.locator('#vip-pricing');
  if (await pricingSection.count() > 0) {
    await pricingSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, "v3_vip_pricing_tiers.png") });
    console.log("Captured v3_vip_pricing_tiers.png");

    // Click on 6 Months VIP Pass activation
    const activateBtn = page.locator('button:has-text("Activate 6 Months VIP Pass"), button:has-text("Activate 1 Month VIP Pass")').first();
    if (await activateBtn.count() > 0) {
      console.log("Clicking Activate VIP button...");
      await activateBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(artifactDir, "v3_vip_checkout.png") });
      console.log("Captured v3_vip_checkout.png");
    }
  }

  await browser.close();
  console.log("Verification finished successfully!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
