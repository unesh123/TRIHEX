import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] || "http://localhost:3107";
const out = process.argv[3] || "artifacts/artwork-check";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    for (const slug of ["elevenlabs-creator-shared", "museai"]) {
      const response = await page.goto(`${base}/products/${slug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.locator("h1").waitFor();
      await page.waitForFunction(() => Array.from(document.images).some(img => img.src.includes("artwork") && img.getBoundingClientRect().width > 0 && img.complete && img.naturalWidth > 0), undefined, { timeout: 30000 });
      await page.screenshot({ path: `${out}/${slug}-${viewport.width}.png`, fullPage: false });
      const body = await page.locator("body").innerText();
      const images = await page.locator('img[src*="artwork"]').evaluateAll(nodes => nodes.map(n => ({ src: n.currentSrc, loaded: n.complete && n.naturalWidth > 0 })));
      results.push({ slug, width: viewport.width, status: response.status(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), images, hasOffer: body.includes("Only NPR 1,000"), hasTokens: /1\s*Billion Tokens/i.test(body), errors: [...errors] });
    }
    await context.close();
  }
  fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
