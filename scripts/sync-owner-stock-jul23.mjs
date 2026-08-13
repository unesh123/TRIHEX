/**
 * Owner stock sync — Jul 23 2026
 * - Images = buying USD (+ stock)
 * - Explicit sell NPR from owner message wins
 * - Else sell = cost NPR (USD×160) + 50%, round to 10
 * - Never create duplicate slugs; update existing
 *
 * Usage: node --env-file=.env.local scripts/sync-owner-stock-jul23.mjs
 */
import postgres from "postgres";
import { randomUUID } from "crypto";

const FX = 160;

function costNprFromUsd(usd) {
  return Math.round(usd * FX);
}
function sellFromUsd(usd, explicitSell) {
  if (explicitSell != null) return explicitSell;
  const cost = costNprFromUsd(usd);
  return Math.max(cost + 10, Math.round((cost * 1.5) / 10) * 10);
}
function usdMinor(usd) {
  return Math.round(usd * 100);
}

/**
 * @typedef {{
 *  slug: string,
 *  aliases?: string[],
 *  name: string,
 *  brandSlug: string,
 *  brandName: string,
 *  categorySlug: string,
 *  buyUsd: number,
 *  buyNpr?: number,
 *  sellNpr: number,
 *  stock: number | null,
 *  durationValue: number | null,
 *  durationUnit: 'DAY'|'WEEK'|'MONTH'|'YEAR'|'ONE_TIME'|null,
 *  shortDescription: string,
 *  features: string[],
 *  status: 'PUBLIC'|'DRAFT'|'BLOCKED',
 *  purchasable: boolean,
 * }} StockRow
 */

/** @type {StockRow[]} */
const ROWS = [
  // ── Owner-set sell prices (message) ─────────────────────────────
  {
    slug: "prime-video-6-months",
    aliases: [],
    name: "Prime Video — 6 Months",
    brandSlug: "amazon",
    brandName: "Amazon",
    categorySlug: "streaming",
    buyUsd: 2.5,
    buyNpr: 199,
    sellNpr: 399,
    stock: 1,
    durationValue: 6,
    durationUnit: "MONTH",
    shortDescription: "Amazon Prime Video — 6 months on your mail (official).",
    features: [
      "Prime Video access — about 6 months",
      "Activated on your email",
      "Full warranty window as supplied",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "netflix-private-1-month",
    aliases: ["netflix-1-month"],
    name: "Netflix — Private Profile (1 Month)",
    brandSlug: "netflix",
    brandName: "Netflix",
    categorySlug: "streaming",
    buyUsd: 1,
    buyNpr: 99,
    sellNpr: 299,
    stock: null,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "Netflix private profile — 1 month.",
    features: [
      "Private profile access — about 1 month",
      "Streaming on supported devices",
      "Delivery after payment verification",
      "WhatsApp support for activation",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "youtube-premium-family-1-month",
    aliases: ["youtube-premium-1-month"],
    name: "YouTube Premium — Family Invite (1 Month)",
    brandSlug: "youtube",
    brandName: "YouTube",
    categorySlug: "streaming",
    buyUsd: 0.6,
    buyNpr: 50,
    sellNpr: 200,
    stock: null,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "YouTube Premium via family invite — 1 month.",
    features: [
      "YouTube Premium (family invite)",
      "Ad-free viewing + background play (as included)",
      "About 1 month access",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "adobe-cc-4-months",
    aliases: ["adobe-cloud-4-months"],
    name: "Adobe Creative Cloud — 4 Months",
    brandSlug: "adobe",
    brandName: "Adobe",
    categorySlug: "design",
    buyUsd: 3,
    buyNpr: 299,
    sellNpr: 699,
    stock: null,
    durationValue: 4,
    durationUnit: "MONTH",
    shortDescription: "Adobe Creative Cloud Pro access — about 4 months.",
    features: [
      "Adobe CC apps as included in the plan",
      "About 4 months premium access",
      "Activation details after payment verification",
      "WhatsApp support for delivery questions",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "nordvpn-3-months",
    aliases: ["nordvpn-mail-3-months", "nordvpn-shared-3-months"],
    name: "NordVPN — 3 Months",
    brandSlug: "nordvpn",
    brandName: "NordVPN",
    categorySlug: "productivity",
    buyUsd: 2,
    buyNpr: 199,
    sellNpr: 799,
    stock: 0,
    durationValue: 3,
    durationUnit: "MONTH",
    shortDescription: "NordVPN — 3 months. Stock updates on WhatsApp when available.",
    features: [
      "NordVPN access — about 3 months",
      "Full warranty as supplied when in stock",
      "Check availability before paying",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: false, // stock 0
  },
  {
    slug: "spotify-premium-3-months",
    aliases: ["spotify-3-months"],
    name: "Spotify Premium — 3 Months",
    brandSlug: "spotify",
    brandName: "Spotify",
    categorySlug: "streaming",
    buyUsd: 3,
    buyNpr: 199,
    sellNpr: 599,
    stock: null,
    durationValue: 3,
    durationUnit: "MONTH",
    shortDescription: "Spotify Premium standard plan — activated on your new mail.",
    features: [
      "Spotify Premium — about 3 months",
      "Activated on your new email",
      "Ad-free listening (as included)",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "apple-music-6-months",
    aliases: [],
    name: "Apple Music — 6 Months",
    brandSlug: "apple",
    brandName: "Apple",
    categorySlug: "streaming",
    buyUsd: 5,
    buyNpr: 399,
    sellNpr: 799,
    stock: null,
    durationValue: 6,
    durationUnit: "MONTH",
    shortDescription: "Apple Music plan — about 6 months.",
    features: [
      "Apple Music access — about 6 months",
      "Activation steps shared after payment",
      "WhatsApp support for delivery",
      "No fake unlimited claims",
    ],
    status: "PUBLIC",
    purchasable: true,
  },

  // ── Image stock: existing / update (50% on FX when no owner sell) ─
  {
    slug: "prime-video-1-month",
    name: "Prime Video — 1 Month",
    brandSlug: "amazon",
    brandName: "Amazon",
    categorySlug: "streaming",
    buyUsd: 1,
    sellNpr: sellFromUsd(1),
    stock: 1,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "Amazon Prime Video — 1 month (25-day warranty window).",
    features: [
      "Prime Video — about 1 month",
      "Approx. 25-day warranty as supplied",
      "Activated on your email",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "soundcloud-artist-pro-1-month",
    name: "SoundCloud Artist Pro — 1 Month",
    brandSlug: "soundcloud",
    brandName: "SoundCloud",
    categorySlug: "streaming",
    buyUsd: 2.2,
    sellNpr: sellFromUsd(2.2),
    stock: 160,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "SoundCloud Artist Pro — 1 month, full warranty.",
    features: [
      "SoundCloud Artist Pro — about 1 month",
      "Full warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "vidiq-max-1-month",
    name: "VidIQ Max — 1 Month",
    brandSlug: "youtube",
    brandName: "YouTube",
    categorySlug: "creator-tools",
    buyUsd: 5,
    sellNpr: 1200, // keep live sell
    stock: 1,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "VidIQ Max — 1 month (25-day warranty).",
    features: [
      "VidIQ Max features as included",
      "About 1 month access",
      "Approx. 25-day warranty as supplied",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "adobe-cc-2-months",
    name: "Adobe Creative Cloud — 2 Months",
    brandSlug: "adobe",
    brandName: "Adobe",
    categorySlug: "design",
    buyUsd: 4,
    sellNpr: sellFromUsd(4),
    stock: 1,
    durationValue: 2,
    durationUnit: "MONTH",
    shortDescription: "Adobe CC — 2 months (no extended warranty on this lot).",
    features: [
      "Adobe Creative Cloud — about 2 months",
      "No extended warranty on this SKU",
      "Activation after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "adobe-cc-individual-1-year",
    name: "Adobe Creative Cloud Individual — 1 Year",
    brandSlug: "adobe",
    brandName: "Adobe",
    categorySlug: "design",
    buyUsd: 80,
    sellNpr: sellFromUsd(80),
    stock: 1,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription: "Adobe CC Individual — 1 year, full warranty.",
    features: [
      "Adobe Creative Cloud Individual — 1 year",
      "Full warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "microsoft-365-family-1-year",
    aliases: ["microsoft-365-pro-family-1-year"],
    name: "Microsoft 365 Family — 1 Year",
    brandSlug: "microsoft",
    brandName: "Microsoft",
    categorySlug: "productivity",
    buyUsd: 2.5,
    sellNpr: sellFromUsd(2.5),
    stock: null,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription: "Microsoft 365 Family user — 1 year, full warranty.",
    features: [
      "Microsoft 365 Family plan — about 1 year",
      "Full warranty as supplied",
      "Activation after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "replit-core-1-month",
    name: "Replit Core — 1 Month",
    brandSlug: "replit",
    brandName: "Replit",
    categorySlug: "developer-tools",
    buyUsd: 7,
    sellNpr: 1680,
    stock: 5,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "Replit Core — 1 month (25-day warranty).",
    features: [
      "Replit Core access — about 1 month",
      "Approx. 25-day warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "replit-core-12-months",
    name: "Replit Core — 12 Months",
    brandSlug: "replit",
    brandName: "Replit",
    categorySlug: "developer-tools",
    buyUsd: 40,
    sellNpr: 9600,
    stock: null,
    durationValue: 12,
    durationUnit: "MONTH",
    shortDescription: "Replit Core — 12 months (6-month warranty window).",
    features: [
      "Replit Core — about 12 months",
      "Approx. 6-month warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "grok-super-1-month",
    aliases: ["super-grok-1-month"],
    name: "Grok Super — 1 Month",
    brandSlug: "grok",
    brandName: "xAI Grok",
    categorySlug: "ai-tools",
    buyUsd: 1.8,
    sellNpr: sellFromUsd(1.8),
    stock: 0,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "Grok Super — 1 month (7-day warranty). Currently out of stock.",
    features: [
      "Grok Super access — about 1 month",
      "Approx. 7-day warranty as supplied",
      "Check availability before paying",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: false,
  },
  {
    slug: "grok-super-6-months",
    aliases: ["super-grok-6-months"],
    name: "Grok Super — 6 Months",
    brandSlug: "grok",
    brandName: "xAI Grok",
    categorySlug: "ai-tools",
    buyUsd: 15,
    sellNpr: 4399, // keep current live sell
    stock: 4,
    durationValue: 6,
    durationUnit: "MONTH",
    shortDescription: "Grok Super access — about 6 months.",
    features: [
      "Grok Super model access for 6 months",
      "Features as included in the Super plan",
      "Warranty window as supplied (~5 months)",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "grok-super-12-months",
    aliases: ["super-grok-12-months", "supergrok-12-months", "grok-super-1-year-fww"],
    name: "Grok Super — 12 Months",
    brandSlug: "grok",
    brandName: "xAI Grok",
    categorySlug: "ai-tools",
    buyUsd: 22,
    sellNpr: sellFromUsd(22),
    stock: 3,
    durationValue: 12,
    durationUnit: "MONTH",
    shortDescription: "Grok Super — 12 months.",
    features: [
      "Grok Super model access for 12 months",
      "Features as included in the Super plan",
      "Warranty window as supplied (~10 months)",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "elevenlabs-creator-12-months",
    name: "ElevenLabs Creator — 12 Months",
    brandSlug: "elevenlabs",
    brandName: "ElevenLabs",
    categorySlug: "ai-tools",
    buyUsd: 60,
    sellNpr: sellFromUsd(60),
    stock: null,
    durationValue: 12,
    durationUnit: "MONTH",
    shortDescription: "ElevenLabs Creator plan — 12 months (on mail).",
    features: [
      "ElevenLabs Creator plan — about 12 months",
      "Voice generation + cloning as included",
      "Delivered on mail after verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "cursor-pro-1-month",
    name: "Cursor Pro — 1 Month",
    brandSlug: "cursor",
    brandName: "Cursor",
    categorySlug: "developer-tools",
    buyUsd: 15.5,
    sellNpr: 3200, // was 2500 ≈ cost; raise for profit
    stock: null,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "Cursor Pro — 1 month full warranty on mail (fresh account).",
    features: [
      "Cursor Pro — about 1 month",
      "Official subscription / fresh account needed",
      "Full warranty as supplied (no void warranty)",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "capcut-team-pro-1-month-7-seats",
    aliases: ["capcut-pro-team-1-month"],
    name: "CapCut Team Pro — 1 Month (7 Seats)",
    brandSlug: "capcut",
    brandName: "CapCut",
    categorySlug: "video-editing",
    buyUsd: 12,
    sellNpr: sellFromUsd(12),
    stock: null,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "CapCut Team Pro — 1 month, 7 seats (25-day warranty).",
    features: [
      "CapCut Team Pro — about 1 month",
      "Up to 7 seats",
      "Approx. 25-day warranty as supplied",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "capcut-team-7-seats",
    aliases: ["capcut-team-method-7-seats"],
    name: "CapCut Team Method — 7 Seats",
    brandSlug: "capcut",
    brandName: "CapCut",
    categorySlug: "video-editing",
    buyUsd: 30,
    sellNpr: sellFromUsd(30),
    stock: 5,
    durationValue: null,
    durationUnit: "ONE_TIME",
    shortDescription: "CapCut team method pack — 7 seats.",
    features: [
      "CapCut team method — 7 seats",
      "Activation steps after payment verification",
      "WhatsApp support for delivery",
      "Stock limited — inquire if unsure",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "claude-max-x20-1-month",
    aliases: ["claude-x20-w30d", "claud-max-x20-1-month"],
    name: "Claude Max x20 — 1 Month",
    brandSlug: "claude",
    brandName: "Claude",
    categorySlug: "ai-tools",
    buyUsd: 115,
    sellNpr: sellFromUsd(115),
    stock: null,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "Claude Max x20 — 1 month. High-tier package — confirm on WhatsApp if unsure.",
    features: [
      "Claude Max x20 access — about 1 month",
      "High-usage tier as supplied",
      "Confirm package details before paying",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "perplexity-pro-1-year",
    aliases: ["perplexity-pro-12-months"],
    name: "Perplexity Pro — 1 Year",
    brandSlug: "perplexity",
    brandName: "Perplexity",
    categorySlug: "ai-tools",
    buyUsd: 40,
    sellNpr: sellFromUsd(40),
    stock: null,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription: "Perplexity Pro — 1 year.",
    features: [
      "Perplexity Pro — about 1 year",
      "Research / AI search features as included",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "gemini-pro-18-months-link",
    name: "Gemini Pro 5 TB — 18 Months",
    brandSlug: "gemini",
    brandName: "Google Gemini",
    categorySlug: "ai-tools",
    buyUsd: 2,
    sellNpr: 399,
    stock: 2,
    durationValue: 18,
    durationUnit: "MONTH",
    shortDescription: "Gemini 18-month link package (no warranty on this supplier lot).",
    features: [
      "Gemini / Google AI Pro style access — about 18 months",
      "Link activation as supplied",
      "No warranty on this supplier lot",
      "Delivery after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "chatgpt-go-3-months",
    name: "ChatGPT Go — 3 Months (Coupon)",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    buyUsd: 1,
    sellNpr: sellFromUsd(1),
    stock: 8,
    durationValue: 3,
    durationUnit: "MONTH",
    shortDescription: "ChatGPT Go — 3 months via coupon.",
    features: [
      "ChatGPT Go — about 3 months",
      "Coupon / redemption as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "chatgpt-plus-1-month-20d",
    name: "ChatGPT Plus — 1 Month (20-day warranty)",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    buyUsd: 6,
    sellNpr: sellFromUsd(6),
    stock: 4,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "ChatGPT Plus 1 month with ~20-day warranty window.",
    features: [
      "ChatGPT Plus — about 1 month",
      "Approx. 20-day warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "chatgpt-plus-1-month-no-warranty",
    name: "ChatGPT Plus — 1 Month (No Warranty)",
    brandSlug: "openai",
    brandName: "OpenAI",
    categorySlug: "ai-tools",
    buyUsd: 2.5,
    sellNpr: sellFromUsd(2.5),
    stock: 1,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "Budget ChatGPT Plus 1 month — no warranty SKU.",
    features: [
      "ChatGPT Plus — about 1 month",
      "No warranty on this SKU",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "coursera-premium-1-year",
    name: "Coursera Plus — 1 Year",
    brandSlug: "coursera",
    brandName: "Coursera",
    categorySlug: "learning",
    buyUsd: 10,
    sellNpr: 2400,
    stock: null,
    durationValue: 1,
    durationUnit: "YEAR",
    shortDescription: "Coursera Plus full-year learning access.",
    features: [
      "Coursera Plus catalogue access for 1 year",
      "Certificates where included in the plan",
      "Full warranty as supplied",
      "Activation after payment verification",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "gamma-ai-pro-1-month",
    name: "Gamma AI Pro — 1 Month",
    brandSlug: "gamma",
    brandName: "Gamma",
    categorySlug: "ai-tools",
    buyUsd: 3.5,
    sellNpr: 840,
    stock: 1,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "Gamma AI Pro — 1 month (25-day warranty).",
    features: [
      "Gamma AI Pro — about 1 month",
      "Approx. 25-day warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "manus-ai-pro-12-months",
    name: "Manus AI Pro — 12 Months",
    brandSlug: "manus",
    brandName: "Manus",
    categorySlug: "ai-tools",
    buyUsd: 48,
    sellNpr: 11520,
    stock: null,
    durationValue: 12,
    durationUnit: "MONTH",
    shortDescription: "Manus AI Pro — 12 months (6-month warranty).",
    features: [
      "Manus AI Pro — about 12 months",
      "Approx. 6-month warranty as supplied",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "google-ai-ultra-25k-1-month",
    name: "Google AI Ultra — 25K Credits (1 Month)",
    brandSlug: "gemini",
    brandName: "Google Gemini",
    categorySlug: "ai-tools",
    buyUsd: 33,
    sellNpr: sellFromUsd(33),
    stock: null,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription:
      "Google AI Ultra slot — 25K shared credits, family invite on mail (~15-day warranty).",
    features: [
      "25,000 shared credits",
      "Antigravity + Flow models as included",
      "Family invite delivered via mail",
      "About 1 month · ~15-day warranty as supplied",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  {
    slug: "veo-3-ultra-45k-1-month",
    name: "Veo 3 Ultra — 45K Credits (1 Month)",
    brandSlug: "gemini",
    brandName: "Google Gemini",
    categorySlug: "ai-tools",
    buyUsd: 7,
    sellNpr: sellFromUsd(7),
    stock: 10,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription:
      "Google Ultra 45K credits — low priority video, extension-based (~20-day warranty).",
    features: [
      "About 45,000 credits",
      "Low priority video generation",
      "Extension-based only · Antigravity not supported",
      "About 1 month · ~20-day warranty as supplied",
    ],
    status: "PUBLIC",
    purchasable: true,
  },
  // CapCut personal 1m — enable Buy Now (stock from prior)
  {
    slug: "capcut-pro-30-days",
    name: "CapCut Pro — 1 Month",
    brandSlug: "capcut",
    brandName: "CapCut",
    categorySlug: "video-editing",
    buyUsd: 1.75, // personal 1m (team $3 is a different SKU)
    sellNpr: 419,
    stock: 4,
    durationValue: 1,
    durationUnit: "MONTH",
    shortDescription: "CapCut Pro — about 1 month.",
    features: [
      "CapCut Pro features as included",
      "About 1 month access",
      "Delivery after payment verification",
      "WhatsApp support",
    ],
    status: "PUBLIC",
    purchasable: true,
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
    VALUES (${id}, ${name}, ${slug}, false, now(), now())
  `;
  return id;
}

async function ensureCategory(slug) {
  const existing = await sql`SELECT id FROM categories WHERE slug = ${slug} LIMIT 1`;
  if (existing[0]) return existing[0].id;
  // fallback ai-tools
  const fallback = await sql`SELECT id FROM categories WHERE slug = 'ai-tools' LIMIT 1`;
  return fallback[0]?.id ?? null;
}

async function findProduct(row) {
  const slugs = [row.slug, ...(row.aliases || [])];
  const found = await sql`
    SELECT id, slug, product_status FROM products WHERE slug = ANY(${slugs}) LIMIT 1
  `;
  return found[0] || null;
}

function assertProfit(row) {
  const costNpr = row.buyNpr ?? costNprFromUsd(row.buyUsd);
  if (row.sellNpr < costNpr) {
    throw new Error(
      `LOSS: ${row.slug} sell ${row.sellNpr} < cost ${costNpr}`,
    );
  }
  return { costNpr, profit: row.sellNpr - costNpr, marginPct: Math.round(((row.sellNpr - costNpr) / costNpr) * 100) };
}

const report = [];
let inserted = 0;
let updated = 0;

// Ensure streaming category exists
{
  const s = await sql`SELECT id FROM categories WHERE slug = 'streaming' LIMIT 1`;
  if (!s[0]) {
    await sql`
      INSERT INTO categories (id, name, slug, sort_order, created_at, updated_at)
      VALUES (${randomUUID()}, 'Streaming', 'streaming', 40, now(), now())
    `;
  }
  const c = await sql`SELECT id FROM categories WHERE slug = 'creator-tools' LIMIT 1`;
  if (!c[0]) {
    await sql`
      INSERT INTO categories (id, name, slug, sort_order, created_at, updated_at)
      VALUES (${randomUUID()}, 'Creator Tools', 'creator-tools', 35, now(), now())
    `;
  }
}

for (const row of ROWS) {
  const econ = assertProfit(row);
  const brandId = await ensureBrand(row.brandSlug, row.brandName);
  let categoryId = await ensureCategory(row.categorySlug);
  if (!categoryId) categoryId = await ensureCategory("ai-tools");

  const existing = await findProduct(row);
  const sellMinor = row.sellNpr * 100;
  const costUsdMinor = usdMinor(row.buyUsd);
  const featuresText = row.features.join("\n");
  const purchasable =
    row.purchasable && row.status === "PUBLIC" && (row.stock === null || row.stock > 0);
  const compliance =
    row.status === "PUBLIC" ? "APPROVED" : row.status === "BLOCKED" ? "REJECTED" : "DOCUMENTS_REQUIRED";

  if (existing) {
    await sql`
      UPDATE products SET
        name = ${row.name},
        slug = ${row.slug},
        short_description = ${row.shortDescription},
        long_description = ${featuresText},
        brand_id = ${brandId},
        category_id = ${categoryId},
        product_status = ${row.status},
        compliance_status = ${compliance},
        needs_data_verification = false,
        blocked_reason = null,
        published_at = CASE WHEN ${row.status} = 'PUBLIC' THEN coalesce(published_at, now()) ELSE published_at END,
        updated_at = now()
      WHERE id = ${existing.id}
    `;
    const variants = await sql`
      SELECT id FROM product_variants WHERE product_id = ${existing.id} AND active = true LIMIT 1
    `;
    if (variants[0]) {
      await sql`
        UPDATE product_variants SET
          variant_name = ${row.name},
          duration_value = ${row.durationValue},
          duration_unit = ${row.durationUnit},
          supplier_cost_usd_minor = ${costUsdMinor},
          supplier_cost_minor = ${costUsdMinor},
          manual_selling_price_npr_minor = ${sellMinor},
          pricing_mode = 'MANUAL_ONLY',
          purchasable = ${purchasable},
          seed_visible_quantity = ${row.stock},
          fx_rate_snapshot = ${FX * 100},
          updated_at = now()
        WHERE id = ${variants[0].id}
      `;
    }
    updated++;
    report.push(
      `UPDATE ${row.slug} | buy $${row.buyUsd} (~Rs.${econ.costNpr}) → sell Rs.${row.sellNpr} | profit Rs.${econ.profit} (${econ.marginPct}%) | stock=${row.stock} | buy=${purchasable}`,
    );
  } else {
    const productId = randomUUID();
    const variantId = randomUUID();
    const sku = `THX-${row.slug.slice(0, 18).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    await sql`
      INSERT INTO products (
        id, name, slug, short_description, long_description, brand_id, category_id,
        product_type, fulfillment_type, product_status, compliance_status,
        supply_authorization_type, vendor_proof_status, needs_data_verification,
        featured, published_at, created_at, updated_at, source_listing_text
      ) VALUES (
        ${productId}, ${row.name}, ${row.slug}, ${row.shortDescription}, ${featuresText},
        ${brandId}, ${categoryId}, 'DIGITAL_LICENSE', 'MANUAL_CUSTOMER_EMAIL_ACTIVATION',
        ${row.status}, ${compliance}, 'UNKNOWN', 'NOT_UPLOADED', false,
        false, ${row.status === "PUBLIC" ? new Date() : null}, now(), now(), ${row.name}
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
        ${costUsdMinor}, ${costUsdMinor}, ${sellMinor},
        'MANUAL_ONLY', ${purchasable}, ${row.stock}, ${FX * 100},
        true, 20000, now(), now()
      )
    `;
    inserted++;
    report.push(
      `NEW  ${row.slug} | buy $${row.buyUsd} (~Rs.${econ.costNpr}) → sell Rs.${row.sellNpr} | profit Rs.${econ.profit} (${econ.marginPct}%) | stock=${row.stock} | buy=${purchasable}`,
    );
  }
}

// Archive duplicate Super Grok drafts now that grok-super-* owns the line
for (const slug of ["super-grok-6-months", "super-grok-12-months"]) {
  await sql`
    UPDATE products SET product_status = 'ARCHIVED', updated_at = now()
    WHERE slug = ${slug} AND product_status <> 'ARCHIVED'
  `;
}
// Archive old nordvpn blocked duplicates if we created/updated nordvpn-3-months
for (const slug of ["nordvpn-mail-3-months", "nordvpn-shared-3-months"]) {
  const keep = await sql`SELECT id FROM products WHERE slug = 'nordvpn-3-months' LIMIT 1`;
  if (keep[0]) {
    await sql`
      UPDATE products SET product_status = 'ARCHIVED', updated_at = now()
      WHERE slug = ${slug} AND id <> ${keep[0].id}
    `;
  }
}

console.log("\n=== SYNC REPORT ===");
for (const line of report) console.log(line);
console.log(`\nInserted: ${inserted} | Updated: ${updated}`);

await sql.end({ timeout: 5 });
