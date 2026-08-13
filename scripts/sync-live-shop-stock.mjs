/**
 * Live shop stock sync — owner buy USD + sell NPR.
 * Usage: node --env-file=.env.local scripts/sync-live-shop-stock.mjs
 */
import postgres from "postgres";
import { randomUUID } from "crypto";

const FX = 160;

function costNpr(usd) {
  return Math.round(usd * FX);
}
function usdMinor(usd) {
  return Math.round(usd * 100);
}

/** @type {Array<{
 *  slug: string,
 *  aliases?: string[],
 *  name: string,
 *  brandSlug: string,
 *  brandName: string,
 *  categorySlug: string,
 *  buyUsd: number,
 *  sellNpr: number,
 *  stock: number | null,
 *  durationValue: number | null,
 *  durationUnit: string | null,
 *  shortDescription: string,
 *  features: string[],
 *  status?: 'PUBLIC'|'DRAFT',
 * }>} */
const ROWS = [
  // ── ChatGPT ─────────────────────────────────────────────────────
  {
    slug: "chatgpt-plus-apple-pay-1d",
    name: "ChatGPT Plus — Apple Pay Trial (1-day warranty)",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    buyUsd: 2.4,
    sellNpr: 699,
    stock: 24,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription:
      "ChatGPT Plus 1-month trial via Apple Pay — very durable, 1-day warranty.",
    features: [
      "ChatGPT Plus access — about 1 month",
      "100% payment via Apple Pay",
      "1-day warranty window",
      "Delivery after payment verification",
    ],
  },
  {
    slug: "chatgpt-plus-apple-pay-full-warranty",
    name: "ChatGPT Plus — Apple Pay Trial (Full Warranty)",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    buyUsd: 6.68,
    sellNpr: 1399,
    stock: 15,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription:
      "ChatGPT Plus 1-month trial via Apple Pay — full warranty.",
    features: [
      "ChatGPT Plus access — about 1 month",
      "100% payment via Apple Pay",
      "Full warranty as supplied",
      "Delivery after payment verification",
    ],
  },
  {
    slug: "chatgpt-plus-1-month-1d",
    name: "ChatGPT Plus — 1 Month (1-day warranty)",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    buyUsd: 1.4,
    sellNpr: 599,
    stock: 16,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "ChatGPT Plus 1 month — 1-day warranty.",
    features: [
      "ChatGPT Plus — about 1 month",
      "1-day warranty window",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
  {
    slug: "chatgpt-plus-1-month-2d",
    name: "ChatGPT Plus — 1 Month (2-day warranty)",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    buyUsd: 1.8,
    sellNpr: 699,
    stock: 29,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "ChatGPT Plus 1 month — 2-day warranty.",
    features: [
      "ChatGPT Plus — about 1 month",
      "2-day warranty window",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
  {
    slug: "chatgpt-plus-mail-icloud-no-warranty",
    name: "ChatGPT Plus — Mail / iCloud (No Warranty)",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    buyUsd: 0.08,
    sellNpr: 499,
    stock: 26,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "ChatGPT Plus via mail/iCloud — no warranty SKU.",
    features: [
      "ChatGPT Plus — mail / iCloud delivery",
      "No warranty on this SKU",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
  {
    slug: "chatgpt-plus-1-month-fw",
    aliases: ["chatgpt-plus-account-1-month-full-warranty"],
    name: "ChatGPT Plus — 1 Month (Full Warranty)",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    buyUsd: 7.2,
    sellNpr: 1399,
    stock: 7,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "ChatGPT Plus account — 1 month, full warranty.",
    features: [
      "ChatGPT Plus account — about 1 month",
      "Full warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },

  // ── CapCut ──────────────────────────────────────────────────────
  {
    slug: "capcut-pro-30-days",
    name: "CapCut Pro — 1 Month (25-day warranty)",
    brandSlug: "capcut",
    brandName: "CapCut",
    categorySlug: "video-editing",
    buyUsd: 2,
    sellNpr: 499,
    stock: 2,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "CapCut Pro — 1 month with ~25-day warranty.",
    features: [
      "CapCut Pro — about 1 month",
      "Approx. 25-day warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
  {
    slug: "capcut-pro-team-1-month",
    aliases: ["capcut-team-pro-1-month-7-seats", "capcut-pro-team-1-month-full"],
    name: "CapCut Pro Team — 1 Month (Full Warranty)",
    brandSlug: "capcut",
    brandName: "CapCut",
    categorySlug: "video-editing",
    buyUsd: 2.24,
    sellNpr: 599,
    stock: 76,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "CapCut Pro Team — 1 month, full warranty.",
    features: [
      "CapCut Pro Team — about 1 month",
      "Full warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
  {
    slug: "capcut-pro-6-months",
    aliases: ["capcut-pro-5-6-months-personal"],
    name: "CapCut Pro — 5–6 Months (Personal Login)",
    brandSlug: "capcut",
    brandName: "CapCut",
    categorySlug: "video-editing",
    buyUsd: 12.68,
    sellNpr: 2999,
    stock: 35,
    durationValue: 6,
    durationUnit: "MONTH",
    shortDescription:
      "CapCut Pro personal login email — about 5–6 months, full warranty.",
    features: [
      "CapCut Pro personal login — about 5–6 months",
      "Full warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },

  // ── Grok ────────────────────────────────────────────────────────
  {
    slug: "grok-super-12-months",
    aliases: ["grok-super-1-year", "grok-super-1-year-fww"],
    name: "Grok Super — 1 Year (Full Warranty)",
    brandSlug: "grok",
    brandName: "xAI Grok",
    categorySlug: "ai-tools",
    buyUsd: 40,
    sellNpr: 7900,
    stock: 11,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription: "Grok Super — 1 year, full warranty.",
    features: [
      "Grok Super access — about 1 year",
      "Full warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
  {
    slug: "grok-upgrade-own-account-1-month",
    name: "Grok Super Upgrade — Own Account (1 Month)",
    brandSlug: "grok",
    brandName: "xAI Grok",
    categorySlug: "ai-tools",
    buyUsd: 16,
    sellNpr: 3999,
    stock: null,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription:
      "1-month Grok Super upgrade on your own account — full warranty.",
    features: [
      "Upgrade on your own Grok / X account",
      "About 1 month Super access",
      "Full warranty as supplied",
      "Delivery after payment verification",
    ],
  },

  // ── Gemini / Veo ────────────────────────────────────────────────
  {
    slug: "google-5tb-pixel-no-warranty",
    aliases: ["gemini-ai-pro-5tb-12m-mail-a", "gemini-5tb-pixel"],
    name: "Google 5 TB Pixel — No Warranty",
    brandSlug: "gemini",
    brandName: "Google Gemini",
    categorySlug: "ai-tools",
    buyUsd: 2,
    sellNpr: 499,
    stock: 49,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription: "Google 5 TB Pixel package — no warranty.",
    features: [
      "Google / Gemini 5 TB style access",
      "No warranty on this SKU",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
  {
    slug: "gemini-pro-cdk-12-months",
    name: "Gemini CDK Pro — 1 Year (No Warranty)",
    brandSlug: "gemini",
    brandName: "Google Gemini",
    categorySlug: "ai-tools",
    buyUsd: 1,
    sellNpr: 399,
    stock: 17,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription: "CDK Gemini Pro — 1 year, no warranty.",
    features: [
      "Gemini CDK redeem / activation — about 1 year",
      "No warranty on this SKU",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
  {
    slug: "gemini-pro-18-months-link",
    aliases: ["gemini-ai-pro-18-months-linh"],
    name: "Gemini AI Pro — 18 Months (No Warranty)",
    brandSlug: "gemini",
    brandName: "Google Gemini",
    categorySlug: "ai-tools",
    buyUsd: 0.84,
    sellNpr: 399,
    stock: 350,
    durationValue: 18,
    durationUnit: "MONTH",
    shortDescription: "Gemini AI Pro link — 18 months, no warranty.",
    features: [
      "Gemini AI Pro — about 18 months",
      "Link activation as supplied",
      "No warranty on this SKU",
      "Delivery after payment verification",
    ],
  },
  {
    slug: "gemini-ai-5tb-upgrade-1-year",
    name: "Gemini AI 5 TB Upgrade — 1 Year (No Warranty)",
    brandSlug: "gemini",
    brandName: "Google Gemini",
    categorySlug: "ai-tools",
    buyUsd: 4,
    sellNpr: 799,
    stock: null,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription: "1-year Gemini AI 5 TB upgrade — no warranty.",
    features: [
      "Gemini AI 5 TB upgrade — about 1 year",
      "No warranty on this SKU",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },

  // ── Canva ───────────────────────────────────────────────────────
  {
    slug: "canva-edu-1-year",
    aliases: ["canva-education-own-account-1-year"],
    name: "Canva Education — Own Account (1 Year)",
    brandSlug: "canva",
    brandName: "Canva",
    categorySlug: "design",
    buyUsd: 0.4,
    sellNpr: 199,
    stock: null,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription:
      "Canva Education on your own account — 1 year, full warranty.",
    features: [
      "Canva Education — about 1 year",
      "Own account activation",
      "Full warranty as supplied",
      "Education eligibility may apply",
    ],
  },

  // ── Microsoft 365 ───────────────────────────────────────────────
  {
    slug: "microsoft-365-5-devices-1-year",
    name: "Microsoft 365 — 5 Devices (1 Year)",
    brandSlug: "microsoft",
    brandName: "Microsoft",
    categorySlug: "productivity",
    buyUsd: 1.56,
    sellNpr: 699,
    stock: 4,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription:
      "Microsoft 365 for 5 devices — 1 year (up to ~1 month warranty).",
    features: [
      "Microsoft 365 — up to 5 devices",
      "About 1 year access",
      "Warranty up to ~1 month as supplied",
      "Delivery after payment verification",
    ],
  },
  {
    slug: "microsoft-365-family-trial-1-year",
    aliases: ["microsoft-365-family-1-year"],
    name: "Microsoft 365 Family Trial — 1 Year (Play Store)",
    brandSlug: "microsoft",
    brandName: "Microsoft",
    categorySlug: "productivity",
    buyUsd: 7.96,
    sellNpr: 1699,
    stock: 16,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription:
      "Microsoft Family trial via Play Store — 1 year, full warranty.",
    features: [
      "Microsoft 365 Family trial — about 1 year",
      "Play Store / CHPlay style activation as supplied",
      "Full warranty as supplied",
      "Delivery after payment verification",
    ],
  },

  // ── VPN / HMA ───────────────────────────────────────────────────
  {
    slug: "hma-vpn-key-20-30-days",
    name: "HMA VPN Key — Android / PC (20–30 Days)",
    brandSlug: "hma",
    brandName: "HMA VPN",
    categorySlug: "productivity",
    buyUsd: 0.28,
    sellNpr: 299,
    stock: 29,
    durationValue: 30,
    durationUnit: "DAY",
    shortDescription: "HMA VPN key for Android/PC — about 20–30 days.",
    features: [
      "HMA VPN key — Android / PC",
      "About 20–30 days access",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },

  // ── Duolingo ────────────────────────────────────────────────────
  {
    slug: "duolingo-super-1-year",
    name: "Super Duolingo — 1 Year Upgrade",
    brandSlug: "duolingo",
    brandName: "Duolingo",
    categorySlug: "learning",
    buyUsd: 7.24,
    sellNpr: 1699,
    stock: 11,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription: "Super Duolingo 1-year upgrade — full warranty.",
    features: [
      "Super Duolingo upgrade — about 1 year",
      "Full warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },

  // ── Mail ────────────────────────────────────────────────────────
  {
    slug: "outlook-trust-mail",
    name: "Outlook Trust Mail",
    brandSlug: "microsoft",
    brandName: "Microsoft",
    categorySlug: "productivity",
    buyUsd: 0.08,
    sellNpr: 199,
    stock: 100,
    durationValue: null,
    durationUnit: "ONE_TIME",
    shortDescription: "Outlook trust mail — no warranty.",
    features: [
      "Outlook trust mail account",
      "No warranty on this SKU",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },

  // ── Scribd ──────────────────────────────────────────────────────
  {
    slug: "scribd-premium-trial",
    name: "Scribd Premium / Trial (7 Days–1 Month)",
    brandSlug: "scribd",
    brandName: "Scribd",
    categorySlug: "learning",
    buyUsd: 1,
    sellNpr: 299,
    stock: 4,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription:
      "Scribd Premium/trial — about 7 days to 1 month, full warranty.",
    features: [
      "Scribd Premium / trial access",
      "About 7 days to 1 month as supplied",
      "Full warranty as supplied",
      "Delivery after payment verification",
    ],
  },

  // ── Test (storefront-visible per owner) ─────────────────────────
  {
    slug: "trihex-test-sku",
    name: "TRIHEX Test SKU",
    brandSlug: "trihex",
    brandName: "TRIHEX",
    categorySlug: "digital-assets",
    buyUsd: 0.01,
    sellNpr: 199,
    stock: 64,
    durationValue: null,
    durationUnit: "ONE_TIME",
    shortDescription: "Internal test listing for checkout verification.",
    features: [
      "Test SKU for store verification",
      "Not a consumer digital subscription",
      "Used for checkout / payment testing",
    ],
    status: "DRAFT",
  },

  // ── Windows ─────────────────────────────────────────────────────
  {
    slug: "windows-10-11-pro-retail-key",
    name: "Windows 10 / 11 Pro — Retail Key",
    brandSlug: "microsoft",
    brandName: "Microsoft",
    categorySlug: "productivity",
    buyUsd: 2.8,
    sellNpr: 599,
    stock: 7,
    durationValue: null,
    durationUnit: "ONE_TIME",
    shortDescription: "Windows 10/11 Pro retail key — no warranty.",
    features: [
      "Windows 10 / 11 Pro retail key",
      "No warranty on this SKU",
      "Key delivered after payment verification",
      "WhatsApp support",
    ],
  },

  // ── Zoom ────────────────────────────────────────────────────────
  {
    slug: "zoom-pro-14-days",
    name: "Zoom Pro — 14 Days",
    brandSlug: "zoom",
    brandName: "Zoom",
    categorySlug: "productivity",
    buyUsd: 0.6,
    sellNpr: 399,
    stock: 2,
    durationValue: 14,
    durationUnit: "DAY",
    shortDescription: "Zoom Pro — 14 days, full warranty.",
    features: [
      "Zoom Pro — about 14 days",
      "Full warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
  {
    slug: "zoom-pro-28-days",
    name: "Zoom Pro — 28 Days",
    brandSlug: "zoom",
    brandName: "Zoom",
    categorySlug: "productivity",
    buyUsd: 1.48,
    sellNpr: 699,
    stock: 4,
    durationValue: 28,
    durationUnit: "DAY",
    shortDescription: "Zoom Pro — 28 days, full warranty.",
    features: [
      "Zoom Pro — about 28 days",
      "Full warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
  },
];

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  prepare: false,
  max: 1,
});

async function ensureBrand(slug, name) {
  const existing = await sql`SELECT id FROM brands WHERE slug = ${slug} LIMIT 1`;
  if (existing[0]) return existing[0].id;
  const id = randomUUID();
  await sql`
    INSERT INTO brands (id, name, slug, is_own_brand, created_at, updated_at)
    VALUES (${id}, ${name}, ${slug}, ${slug === "trihex"}, now(), now())
  `;
  return id;
}

async function ensureCategory(slug) {
  const existing =
    await sql`SELECT id FROM categories WHERE slug = ${slug} LIMIT 1`;
  if (existing[0]) return existing[0].id;
  const fallback =
    await sql`SELECT id FROM categories WHERE slug = 'ai-tools' LIMIT 1`;
  return fallback[0]?.id ?? null;
}

async function findProduct(row) {
  const slugs = [row.slug, ...(row.aliases || [])];
  const found = await sql`
    SELECT id, slug FROM products WHERE slug = ANY(${slugs})
    ORDER BY CASE WHEN slug = ${row.slug} THEN 0 ELSE 1 END
    LIMIT 1
  `;
  return found[0] || null;
}

let inserted = 0;
let updated = 0;
const report = [];

for (const row of ROWS) {
  const cost = costNpr(row.buyUsd);
  if (row.sellNpr < cost) {
    throw new Error(`LOSS ${row.slug}: sell ${row.sellNpr} < cost ${cost}`);
  }
  const profit = row.sellNpr - cost;
  const margin = Math.round((profit / cost) * 100);
  const status = row.status ?? "PUBLIC";
  const purchasable =
    status === "PUBLIC" && (row.stock === null || row.stock > 0);
  const brandId = await ensureBrand(row.brandSlug, row.brandName);
  const categoryId =
    (await ensureCategory(row.categorySlug)) ||
    (await ensureCategory("ai-tools"));
  const featuresText = row.features.join("\n");
  const sellMinor = row.sellNpr * 100;
  const costUsd = usdMinor(row.buyUsd);
  const compliance = status === "PUBLIC" ? "APPROVED" : "DOCUMENTS_REQUIRED";

  const existing = await findProduct(row);
  if (existing) {
    await sql`
      UPDATE products SET
        name = ${row.name},
        slug = ${row.slug},
        short_description = ${row.shortDescription},
        long_description = ${featuresText},
        brand_id = ${brandId},
        category_id = ${categoryId},
        product_status = ${status},
        compliance_status = ${compliance},
        needs_data_verification = false,
        blocked_reason = null,
        published_at = CASE
          WHEN ${status} = 'PUBLIC' THEN coalesce(published_at, now())
          ELSE published_at END,
        updated_at = now()
      WHERE id = ${existing.id}
    `;
    await sql`
      UPDATE product_variants SET
        active = true,
        variant_name = ${row.name},
        duration_value = ${row.durationValue},
        duration_unit = ${row.durationUnit},
        supplier_cost_usd_minor = ${costUsd},
        supplier_cost_minor = ${costUsd},
        manual_selling_price_npr_minor = ${sellMinor},
        pricing_mode = 'MANUAL_ONLY',
        purchasable = ${purchasable},
        seed_visible_quantity = ${row.stock},
        fx_rate_snapshot = ${FX * 100},
        updated_at = now()
      WHERE product_id = ${existing.id}
    `;
    updated++;
    report.push(
      `UPD ${row.slug} | buy $${row.buyUsd} (Rs.${cost}) → sell Rs.${row.sellNpr} | +Rs.${profit} (${margin}%) | stock=${row.stock}`,
    );
  } else {
    const productId = randomUUID();
    const variantId = randomUUID();
    const sku = `THX-${row.slug.replace(/[^a-z0-9]/gi, "").slice(0, 16).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    await sql`
      INSERT INTO products (
        id, name, slug, short_description, long_description, brand_id, category_id,
        product_type, fulfillment_type, product_status, compliance_status,
        supply_authorization_type, vendor_proof_status, needs_data_verification,
        featured, published_at, created_at, updated_at, source_listing_text
      ) VALUES (
        ${productId}, ${row.name}, ${row.slug}, ${row.shortDescription}, ${featuresText},
        ${brandId}, ${categoryId}, 'DIGITAL_LICENSE', 'MANUAL_CUSTOMER_EMAIL_ACTIVATION',
        ${status}, ${compliance}, 'UNKNOWN', 'NOT_UPLOADED', false,
        false, ${status === "PUBLIC" ? new Date() : null}, now(), now(), ${row.name}
      )
    `;
    await sql`
      INSERT INTO product_variants (
        id, product_id, sku, variant_name, duration_value, duration_unit,
        supplier_cost_usd_minor, supplier_cost_minor, manual_selling_price_npr_minor,
        pricing_mode, purchasable, seed_visible_quantity, fx_rate_snapshot,
        active, minimum_profit_npr_minor, created_at, updated_at
      ) VALUES (
        ${variantId}, ${productId}, ${sku}, ${row.name}, ${row.durationValue}, ${row.durationUnit},
        ${costUsd}, ${costUsd}, ${sellMinor},
        'MANUAL_ONLY', ${purchasable}, ${row.stock}, ${FX * 100},
        true, 20000, now(), now()
      )
    `;
    inserted++;
    report.push(
      `NEW ${row.slug} | buy $${row.buyUsd} (Rs.${cost}) → sell Rs.${row.sellNpr} | +Rs.${profit} (${margin}%) | stock=${row.stock}`,
    );
  }
}

console.log("\n=== LIVE SHOP STOCK SYNC ===");
for (const line of report) console.log(line);
console.log(`\nInserted: ${inserted} | Updated: ${updated}`);
await sql.end({ timeout: 5 });
