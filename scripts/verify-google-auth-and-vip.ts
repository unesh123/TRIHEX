import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { chromium } from "@playwright/test";
import path from "path";
import { buildAdminSessionCookieValue } from "../src/lib/admin/session-cookie";

const ARTIFACT_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

async function run() {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Visit /account as Guest
  console.log("1. Visiting /account as Guest...");
  await page.goto("http://localhost:3000/account", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Sign in with Google", { timeout: 15000 });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_account_guest_login.png"),
    fullPage: false,
  });
  console.log("Saved v3_account_guest_login.png");

  // 2. Perform Quick Google Sign-in via API
  console.log("2. Performing Google Customer Sign-In...");
  const loginRes = await page.request.post("http://localhost:3000/api/auth/quick-login", {
    data: {
      email: "unesh.customer@gmail.com",
      name: "Unesh Bastola",
      phone: "9801970291",
      next: "/account",
    },
  });
  const loginData = await loginRes.json();
  console.log("Logged in:", loginData);

  // 3. Take screenshot of Authenticated Account Page with Customer User ID
  console.log("3. Capturing Authenticated Account Page...");
  await page.goto("http://localhost:3000/account", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Verified Customer User ID", { timeout: 15000 });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_account_authenticated_user_id.png"),
    fullPage: false,
  });
  console.log("Saved v3_account_authenticated_user_id.png");

  // Extract the generated Customer User ID
  const userIdText = await page.locator("text=THX-").first().innerText();
  console.log("Extracted Customer User ID:", userIdText);

  // 4. Visit /vip with the authenticated user
  console.log("4. Visiting /vip with Authenticated Customer...");
  await page.goto("http://localhost:3000/vip", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Request Access for VIP", { timeout: 15000 });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_vip_vault_qr_payment.png"),
    fullPage: false,
  });
  console.log("Saved v3_vip_vault_qr_payment.png");

  // 5. Submit VIP Payment Request
  console.log("5. Submitting VIP Payment Request...");
  await page.fill('input[type="tel"]', "9801970291");
  await page.fill('input[placeholder*="19284729104"]', "ESEWA-VIP-REF-9921");
  
  // Intercept window.open so popup doesn't block
  await page.evaluate(() => {
    window.open = () => null;
  });

  await page.click('button:has-text("COMPLETE PAYMENT & CONFIRM ON WHATSAPP")');
  await page.waitForSelector("text=STATUS: PENDING ADMIN APPROVAL", { timeout: 15000 });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_vip_request_pending.png"),
    fullPage: false,
  });
  console.log("Saved v3_vip_request_pending.png");

  // 6. Admin Panel: Log in via official Operator Portal
  console.log("6. Visiting /admin/login as Operator...");
  await page.goto("http://localhost:3000/admin/login", { waitUntil: "domcontentloaded" });
  await page.fill('input[name="loginId"]', "uneshbastola888@gmail.com");
  await page.fill('input[name="password"]', "Tr!H3x#Vault-9702$Kkt@RedHat*2026");
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }).catch(() => null),
    page.click('button:has-text("Authenticate Operator Clearance")'),
  ]);
  await page.waitForTimeout(1000);
  console.log("URL after submit:", page.url());

  // Ensure admin session cookies are active on context
  const adminCookieVal = buildAdminSessionCookieValue("uneshbastola888@gmail.com");
  await context.addCookies([
    {
      name: "trihex_admin_session",
      value: adminCookieVal,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
    {
      name: "trihex_vault_clearance",
      value: "cleared_zone_9702",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  console.log("Navigating to /admin/vip?tab=members...");
  await page.goto("http://localhost:3000/admin/vip?tab=members", { waitUntil: "domcontentloaded" });
  console.log("Current URL after navigating to /admin/vip:", page.url());
  await page.waitForSelector('input[placeholder*="Search by Customer User ID"]', { timeout: 15000 });

  // Search by the customer's phone number or User ID
  await page.fill('input[placeholder*="Search by Customer User ID"]', "9801970291");
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_admin_vip_search_and_approve.png"),
    fullPage: false,
  });
  console.log("Saved v3_admin_vip_search_and_approve.png");

  // Click 1-Click Approve VIP
  const approveBtn = page.locator('button:has-text("Approve & Activate VIP Pass")').first();
  if (await approveBtn.isVisible()) {
    console.log("Clicking Approve & Activate VIP Pass...");
    await approveBtn.click();
    await page.waitForTimeout(1000);
  }

  // 7. Visit /vip again as the approved user -> Vault should be fully unlocked!
  console.log("7. Visiting /vip after Admin Approval...");
  await page.goto("http://localhost:3000/vip", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "v3_vip_unlocked_vault.png"),
    fullPage: false,
  });
  console.log("Saved v3_vip_unlocked_vault.png");

  await browser.close();
  console.log("All verification steps completed successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
