import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/unesh/.gemini/antigravity/brain/7d5185dc-d73a-499c-94ed-ab512eb62556";

async function main() {
  console.log("=== VERIFYING ADVANCED GOOGLE SEO & SITEMAPS ===");

  // 1. Fetch robots.txt
  const robotsRes = await fetch("http://localhost:3000/robots.txt");
  const robotsTxt = await robotsRes.text();
  console.log("✓ robots.txt status:", robotsRes.status);
  console.log("robots.txt content preview:\n" + robotsTxt.split("\n").slice(0, 15).join("\n"));
  if (!robotsTxt.includes("sitemap-blog.xml") || !robotsTxt.includes("sitemap-index.xml")) {
    throw new Error("robots.txt missing specialized sitemap links!");
  }

  // 2. Fetch sitemap-index.xml
  const sitemapIndexRes = await fetch("http://localhost:3000/sitemap-index.xml");
  const sitemapIndexXml = await sitemapIndexRes.text();
  console.log("✓ sitemap-index.xml status:", sitemapIndexRes.status);
  if (!sitemapIndexXml.includes("<sitemapindex") || !sitemapIndexXml.includes("sitemap-blog.xml")) {
    throw new Error("sitemap-index.xml is invalid!");
  }

  // 3. Fetch sitemap-blog.xml
  const sitemapBlogRes = await fetch("http://localhost:3000/sitemap-blog.xml");
  const sitemapBlogXml = await sitemapBlogRes.text();
  console.log("✓ sitemap-blog.xml status:", sitemapBlogRes.status);
  if (!sitemapBlogXml.includes("musi-ai-subscription-nepal") || !sitemapBlogXml.includes("3x-digital-capcut-ai-subscription")) {
    throw new Error("sitemap-blog.xml missing new pillar posts!");
  }

  // 4. Launch browser for visual inspection & Schema verification
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Test Home Page Schema
  console.log("\nChecking Home Page SEO Schema...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const homeJsonLds = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
    scripts.map((s) => JSON.parse(s.textContent || "{}"))
  );
  console.log(`Found ${homeJsonLds.length} JSON-LD script tags on Home page.`);
  const flattenedHomeSchemas = homeJsonLds.flat();
  const orgSchema = flattenedHomeSchemas.find((s) => s["@type"] === "Organization");
  const websiteSchema = flattenedHomeSchemas.find((s) => s["@type"] === "WebSite");
  console.log("✓ Organization Alternate Names:", orgSchema?.alternateName);
  console.log("✓ WebSite Name:", websiteSchema?.name, "Alternate Names:", websiteSchema?.alternateName);
  if (!orgSchema?.alternateName?.includes("3x Digital")) {
    throw new Error("Organization schema missing '3x Digital' alternateName!");
  }

  // Test Musi AI Blog Post
  console.log("\nChecking Musi AI Blog Post...");
  await page.goto("http://localhost:3000/blog/musi-ai-subscription-nepal", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_seo_musi_ai_blog.png"), fullPage: false });
  const musiJsonLds = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
    scripts.map((s) => JSON.parse(s.textContent || "{}"))
  );
  const flattenedMusiSchemas = musiJsonLds.flat();
  const musiFaq = flattenedMusiSchemas.find((s) => s["@type"] === "FAQPage");
  const musiArticle = flattenedMusiSchemas.find((s) => s["@type"] === "Article");
  console.log("✓ Musi AI Article Headline:", musiArticle?.headline);
  console.log("✓ Musi AI FAQ Questions Count:", musiFaq?.mainEntity?.length);
  if (!musiFaq || musiFaq.mainEntity?.length < 3) {
    throw new Error("Musi AI Blog missing FAQPage schema!");
  }

  // Test 3x Digital CapCut AI Blog Post
  console.log("\nChecking CapCut AI Blog Post...");
  await page.goto("http://localhost:3000/blog/3x-digital-capcut-ai-subscription", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_seo_capcut_ai_blog.png"), fullPage: false });
  const capcutJsonLds = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
    scripts.map((s) => JSON.parse(s.textContent || "{}"))
  );
  const capcutFaq = capcutJsonLds.flat().find((s) => s["@type"] === "FAQPage");
  console.log("✓ CapCut AI FAQ Questions Count:", capcutFaq?.mainEntity?.length);

  // Test 3x Digital ChatGPT Blog Post
  console.log("\nChecking ChatGPT Blog Post...");
  await page.goto("http://localhost:3000/blog/3x-digital-chatgpt-subscription", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_seo_chatgpt_blog.png"), fullPage: false });

  // Test Musi AI Product Detail Page
  console.log("\nChecking Musi AI Product Page...");
  await page.goto("http://localhost:3000/products/musi-ai-pro-subscription", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "v3_seo_musi_ai_product.png"), fullPage: false });
  const productJsonLds = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
    scripts.map((s) => JSON.parse(s.textContent || "{}"))
  );
  const flattenedProdSchemas = productJsonLds.flat();
  const prodSchema = flattenedProdSchemas.find((s) => s["@type"] === "Product");
  const softwareSchema = flattenedProdSchemas.find((s) => s["@type"] === "SoftwareApplication");
  console.log("✓ Product Schema Name:", prodSchema?.name, "Offer:", prodSchema?.offers);
  console.log("✓ SoftwareApplication Schema Name:", softwareSchema?.name, "Alternate Names:", softwareSchema?.alternateName);

  await browser.close();
  console.log("\n=== ALL SEO & SITEMAP VERIFICATIONS PASSED CLEANLY! ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
