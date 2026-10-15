import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

async function run() {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  // 1. Visit /skills
  console.log("Navigating to http://localhost:3000/skills...");
  await page.goto("http://localhost:3000/skills", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Take skills page screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_skills_hub.png"), fullPage: false });
  console.log("Saved v3_skills_hub.png");

  // Filter skills by AI Engineering
  console.log("Clicking AI Engineering filter pill...");
  const aiFilterBtn = page.getByRole("button", { name: /AI Engineering/i });
  if (await aiFilterBtn.isVisible()) {
    await aiFilterBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_skills_filtered.png"), fullPage: false });
    console.log("Saved v3_skills_filtered.png");
  }

  // 2. Open Command Palette via window event
  console.log("Opening Command Palette...");
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  });
  await page.waitForTimeout(600);

  // Take initial command palette screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_search_initial.png"), fullPage: false });
  console.log("Saved v3_search_initial.png");

  // Type "AI" into the search input
  console.log("Typing 'AI' into search input...");
  const searchInput = page.locator("input[placeholder*='agent skills']");
  await searchInput.fill("AI");
  await page.waitForTimeout(1000);

  // Take screenshot with results
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_search_ai_results.png"), fullPage: false });
  console.log("Saved v3_search_ai_results.png");

  // 3. Test scrolling inside the results container
  console.log("Scrolling the results container...");
  const scrollContainer = page.locator("div[data-lenis-prevent='true'].overflow-y-auto");
  if (await scrollContainer.isVisible()) {
    // Scroll down 400px
    await scrollContainer.evaluate((el) => {
      el.scrollTop = 450;
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_search_scrolled.png"), fullPage: false });
    console.log("Saved v3_search_scrolled.png");
  }

  // 4. Test clicking category filter tab "GitHub Repos" or "Agent Skills"
  console.log("Testing category filter tab in search modal...");
  const githubRepoTab = page.locator("button:has-text('GitHub Repos')");
  if (await githubRepoTab.isVisible()) {
    await githubRepoTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_search_github_repos.png"), fullPage: false });
    console.log("Saved v3_search_github_repos.png");
  }

  await browser.close();
  console.log("Verification completed successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
