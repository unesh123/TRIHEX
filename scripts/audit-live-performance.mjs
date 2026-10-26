import { chromium } from "playwright";

const base = process.argv[2] || "https://trihexdigital.shop";
const routes = ["/", "/products", "/products/museai", "/vip", "/admin/login"];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
];

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const route of routes) {
      const page = await context.newPage();
      const errors = [];
      const failedRequests = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("requestfailed", (request) => {
        failedRequests.push({ url: request.url(), error: request.failure()?.errorText });
      });
      const startedAt = Date.now();
      const response = await page.goto(base + route, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await page.waitForTimeout(2_000);
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        const resources = performance.getEntriesByType("resource");
        const byType = {};
        for (const entry of resources) {
          const type = entry.initiatorType || "other";
          byType[type] ??= { count: 0, transferBytes: 0, decodedBytes: 0 };
          byType[type].count += 1;
          byType[type].transferBytes += entry.transferSize || 0;
          byType[type].decodedBytes += entry.decodedBodySize || 0;
        }
        return {
          domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? null,
          loadMs: navigation?.loadEventEnd ?? null,
          transferBytes: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
          decodedBytes: resources.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0),
          requests: resources.length,
          byType,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          images: Array.from(document.images).length,
          incompleteImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth === 0).length,
        };
      });
      results.push({
        viewport: viewport.name,
        route,
        status: response?.status() ?? null,
        wallMs: Date.now() - startedAt,
        ...metrics,
        overflow: metrics.scrollWidth > metrics.clientWidth + 1,
        errors: [...new Set(errors)],
        failedRequests,
      });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.status !== 200 || result.overflow || result.errors.length)) {
  process.exitCode = 1;
}
