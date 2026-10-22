import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

async function run() {
  console.log("Launching headless browser to test Google Account Chooser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Visit /account as Guest
  console.log("1. Visiting /account as Guest...");
  await page.goto("http://localhost:3000/account", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Continue with Google", { timeout: 15000 });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_google_auth_initial_view.png"),
    fullPage: false,
  });
  console.log("Saved v3_google_auth_initial_view.png");

  // 2. Click the Google button to open the Account Chooser
  console.log("2. Clicking 'Continue with Google' to trigger Account Chooser...");
  await page.click('button:has-text("Continue with Google")');
  await page.waitForSelector("text=Choose a Google Account", { timeout: 10000 });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_google_account_chooser_modal.png"),
    fullPage: false,
  });
  console.log("Saved v3_google_account_chooser_modal.png");

  // 3. Test clicking 'Use another Google account'
  console.log("3. Testing 'Use another Google account' option...");
  await page.click('button:has-text("Use another Google account")');
  await page.waitForSelector('input[placeholder="name@gmail.com"]', { timeout: 5000 });
  await page.fill('input[placeholder="name@gmail.com"]', "unesh.bastola.work@gmail.com");
  await page.fill('input[placeholder*="Account Name"]', "Unesh Bastola (Pro Workspace)");
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_google_account_custom_input.png"),
    fullPage: false,
  });
  console.log("Saved v3_google_account_custom_input.png");

  // 4. Submit the chosen Google account
  console.log("4. Submitting chosen Google account...");
  await page.click('button:has-text("Continue with this Account")');
  await page.waitForNavigation({ waitUntil: "domcontentloaded" }).catch(() => null);
  await page.waitForTimeout(2000);

  // 5. Verify Authenticated Account Page
  console.log("5. Checking authenticated account page...");
  await page.waitForSelector("text=Verified Customer User ID", { timeout: 15000 });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_google_authenticated_success.png"),
    fullPage: false,
  });
  console.log("Saved v3_google_authenticated_success.png");

  // Extract the Customer User ID
  const userId = await page.locator("text=THX-").first().innerText();
  console.log("Customer User ID generated for chosen Google account:", userId);

  // 6. Test /vip with this newly logged in Google account
  console.log("6. Visiting /vip with this Google account...");
  await page.goto("http://localhost:3000/vip", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_vip_logged_in_view.png"),
    fullPage: false,
  });
  console.log("Saved v3_vip_logged_in_view.png");

  await browser.close();
  console.log("All Google Account Chooser verification tests passed successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
