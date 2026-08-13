/**
 * July 2026 new stock batch — USDT×160 cost, sell at +50% margin (editable in admin).
 * Dedupes by slug/aliases; keep lowest cost when matching an existing product.
 */
export type StockRisk = "SELL" | "REVIEW" | "BLOCK" | "SKIP";

export type NewStockItem = {
  slug: string;
  name: string;
  /** Match existing DB rows by these slugs before insert */
  aliases?: string[];
  brandSlug: string;
  categorySlug: string;
  usdt: number | null;
  /** Cost NPR = usdt × 160 (null if price unknown) */
  costNpr: number | null;
  /** Sell NPR at +50% (null if unknown) */
  sellNpr: number | null;
  /** Compare-at / list feel (~2× sell or given) */
  compareAtNpr?: number | null;
  stock: number | null;
  risk: StockRisk;
  featured?: boolean;
  shortDescription: string;
  features: string[];
  /** Notes for IMAGES_STILL_NEEDED / ops */
  imageNote?: string;
};

const FX = 160;
const MARGIN = 0.5; // +50% profit on cost

export function costFromUsdt(usdt: number): number {
  return Math.round(usdt * FX);
}

export function sellAt50(costNpr: number): number {
  const raw = costNpr * (1 + MARGIN);
  return Math.max(10, Math.round(raw / 10) * 10);
}

function item(
  partial: Omit<NewStockItem, "costNpr" | "sellNpr"> & {
    usdt: number | null;
    sellOverride?: number | null;
  },
): NewStockItem {
  const costNpr = partial.usdt != null ? costFromUsdt(partial.usdt) : null;
  const sellNpr =
    partial.sellOverride != null
      ? partial.sellOverride
      : costNpr != null
        ? sellAt50(costNpr)
        : null;
  const rest = { ...partial };
  delete rest.sellOverride;
  return {
    ...rest,
    costNpr,
    sellNpr,
    compareAtNpr:
      partial.compareAtNpr ??
      (sellNpr != null ? Math.round(sellNpr * 2.2) : null),
  };
}

/** Full new-stock catalogue (skip rows with risk SKIP). */
export const NEW_STOCK_JULY_2026: NewStockItem[] = [
  // ─── SELL (Buy Now) ─────────────────────────────────────────────
  item({
    slug: "manus-ai-pro-12-months",
    name: "Manus AI Pro — 12 Months",
    brandSlug: "trihex",
    categorySlug: "ai-tools",
    usdt: 48,
    stock: null,
    risk: "SELL",
    featured: true,
    shortDescription:
      "Autonomous AI agent for multi-step tasks, research, and document generation.",
    features: [
      "Autonomous task completion",
      "Multi-step workflows",
      "Web browsing + research",
      "Code & document generation",
      "Website checkout + WhatsApp support",
    ],
  }),
  item({
    slug: "replit-core-1-month",
    name: "Replit Core — 1 Month",
    brandSlug: "trihex",
    categorySlug: "developer-tools",
    usdt: 7,
    stock: 5,
    risk: "SELL",
    featured: true,
    shortDescription: "Cloud IDE with AI coding assistant — 1 month Core access.",
    features: [
      "Full cloud IDE",
      "AI code assistant (Ghostwriter)",
      "Unlimited private repls",
      "Deploy apps",
      "More compute vs free tier",
    ],
  }),
  item({
    slug: "replit-core-12-months",
    name: "Replit Core — 12 Months",
    brandSlug: "trihex",
    categorySlug: "developer-tools",
    usdt: 40,
    stock: null,
    risk: "SELL",
    featured: true,
    shortDescription: "Full-year Replit Core — cloud coding + AI assistant.",
    features: [
      "Full cloud IDE",
      "AI code assistant (Ghostwriter)",
      "Unlimited private repls",
      "Deploy apps",
      "More compute vs free tier",
      "12 months access",
    ],
  }),
  item({
    slug: "vidiq-max-1-month",
    name: "VidIQ Max — 1 Month",
    brandSlug: "youtube",
    categorySlug: "ai-tools",
    usdt: 5,
    stock: 1,
    risk: "SELL",
    featured: true,
    shortDescription: "YouTube growth toolkit — keywords, SEO, competitor intel.",
    features: [
      "AI keyword research",
      "Video optimization",
      "Competitor analysis",
      "Daily ideas",
      "Thumbnail + title tools",
    ],
  }),
  item({
    slug: "gamma-ai-pro-1-month",
    name: "Gamma AI Pro — 1 Month",
    brandSlug: "trihex",
    categorySlug: "design",
    usdt: 3.5,
    stock: 9,
    risk: "SELL",
    featured: true,
    shortDescription: "AI presentations and decks — generate, brand, export.",
    features: [
      "AI slide/deck generation",
      "Unlimited AI creation (plan limits apply)",
      "Custom branding",
      "Export PDF/PPT",
      "Analytics",
    ],
  }),
  item({
    slug: "coursera-premium-1-year",
    name: "Coursera Plus — 1 Year",
    aliases: ["coursera-premium-1-year"],
    brandSlug: "coursera",
    categorySlug: "learning",
    usdt: 10,
    stock: null,
    risk: "SELL",
    featured: true,
    shortDescription: "Coursera Plus full-year learning access.",
    features: [
      "Coursera Plus catalogue access for 1 year",
      "Certificates where included in the plan",
      "Activation after payment verification",
      "WhatsApp support for delivery questions",
    ],
  }),

  // ─── REVIEW (Check Availability) ────────────────────────────────
  item({
    slug: "super-grok-6-months",
    name: "Super Grok — 6 Months",
    aliases: ["grok-super-6-months"],
    brandSlug: "grok",
    categorySlug: "ai-tools",
    usdt: 15,
    stock: 4,
    risk: "REVIEW",
    shortDescription: "Grok Super access — 6 months. Inquire before buying.",
    features: [
      "Grok Super model access for 6 months",
      "Features as included in the Super plan",
      "Availability confirmed on WhatsApp",
      "Delivery after payment verification",
    ],
  }),
  item({
    slug: "super-grok-12-months",
    name: "Super Grok — 12 Months",
    aliases: ["supergrok-12-months", "grok-super-1-year-fww"],
    brandSlug: "grok",
    categorySlug: "ai-tools",
    usdt: 22,
    stock: 3,
    risk: "REVIEW",
    shortDescription: "Grok Super — 12 months. Check availability first.",
    features: [
      "Grok Super model access for 12 months",
      "Features as included in the Super plan",
      "Availability confirmed on WhatsApp",
      "Delivery after payment verification",
    ],
  }),
  item({
    slug: "elevenlabs-creator-12-months",
    name: "ElevenLabs Creator — 12 Months",
    brandSlug: "elevenlabs",
    categorySlug: "ai-tools",
    usdt: 60,
    stock: null,
    risk: "REVIEW",
    shortDescription: "AI voice generation + cloning — Creator plan, 12 months.",
    features: [
      "Realistic AI voice generation",
      "Voice cloning",
      "100+ voices",
      "Commercial license (as included)",
      "High-quality audio",
    ],
  }),
  item({
    slug: "google-ai-ultra-25k-1-month",
    name: "Google AI Ultra — 25K Credits (1 Month)",
    brandSlug: "gemini",
    categorySlug: "ai-tools",
    usdt: 33,
    stock: 1,
    risk: "REVIEW",
    shortDescription: "Google AI Ultra credit pack (~25K) — 1 month window.",
    features: [
      "Google AI Ultra credits (~25K)",
      "Credit-based usage — not unlimited",
      "Activation after availability confirmation",
      "WhatsApp support for redeem steps",
    ],
  }),
  item({
    slug: "adobe-cc-2-months",
    name: "Adobe Creative Cloud — 2 Months",
    aliases: ["adobe-cc-2-months"],
    brandSlug: "adobe",
    categorySlug: "design",
    usdt: 4,
    stock: 9,
    risk: "REVIEW",
    shortDescription: "Adobe CC — 2 months (no warranty). Inquire first.",
    features: [
      "Adobe Creative Cloud apps as supplied",
      "2 months access",
      "No extended warranty on this SKU",
      "Confirm availability on WhatsApp before payment",
    ],
  }),
  item({
    slug: "adobe-cc-individual-1-year",
    name: "Adobe Creative Cloud Individual — 1 Year",
    brandSlug: "adobe",
    categorySlug: "design",
    usdt: 80,
    stock: 1,
    risk: "REVIEW",
    shortDescription: "Adobe CC Individual — 12 months. Limited stock.",
    features: [
      "Adobe Creative Cloud Individual plan — 1 year",
      "Apps included as supplied by the plan",
      "Confirm availability before payment",
      "Activation after payment verification",
    ],
  }),
  item({
    slug: "chatgpt-go-3-months-coupon",
    name: "ChatGPT Go — 3 Months (Coupon)",
    aliases: ["chatgpt-go-3-months"],
    brandSlug: "openai",
    categorySlug: "ai-tools",
    usdt: 1,
    stock: 8,
    risk: "REVIEW",
    shortDescription: "ChatGPT Go coupon pack — about 3 months. Inquire first.",
    features: [
      "ChatGPT Go access via coupon (~3 months)",
      "Features as included in Go plan",
      "Redeem steps after confirmation",
      "WhatsApp support",
    ],
  }),
  item({
    slug: "chatgpt-plus-1-month-20d",
    name: "ChatGPT Plus — 1 Month (20-day warranty)",
    brandSlug: "openai",
    categorySlug: "ai-tools",
    usdt: 6,
    stock: 4,
    risk: "REVIEW",
    shortDescription: "ChatGPT Plus 1 month with ~20-day warranty window.",
    features: [
      "ChatGPT Plus access for 1 month",
      "Approx. 20-day warranty as supplied",
      "Confirm availability on WhatsApp",
      "Delivery after payment verification",
    ],
  }),
  item({
    slug: "chatgpt-plus-1-month-no-warranty",
    name: "ChatGPT Plus — 1 Month (No Warranty)",
    brandSlug: "openai",
    categorySlug: "ai-tools",
    usdt: 2.5,
    stock: 1,
    risk: "REVIEW",
    shortDescription: "Budget ChatGPT Plus 1 month — no warranty SKU.",
    features: [
      "ChatGPT Plus access for 1 month",
      "No warranty on this SKU",
      "Confirm availability before paying",
      "WhatsApp delivery after verification",
    ],
  }),
  item({
    slug: "prime-video-1-month",
    name: "Amazon Prime Video — 1 Month",
    brandSlug: "trihex",
    categorySlug: "productivity",
    usdt: 1,
    stock: 9,
    risk: "REVIEW",
    shortDescription: "Prime Video streaming — 1 month. Check availability.",
    features: [
      "Amazon Prime Video access — 1 month",
      "Streaming features as included",
      "Confirm stock on WhatsApp",
      "Delivery after payment verification",
    ],
  }),
  item({
    slug: "prime-video-6-months",
    name: "Amazon Prime Video — 6 Months",
    brandSlug: "trihex",
    categorySlug: "productivity",
    usdt: 2.5,
    stock: 9,
    risk: "REVIEW",
    shortDescription: "Prime Video — 6 months. Inquire before buying.",
    features: [
      "Amazon Prime Video access — 6 months",
      "Streaming features as included",
      "Confirm stock on WhatsApp",
      "Delivery after payment verification",
    ],
  }),
  item({
    slug: "soundcloud-artist-pro-1-month",
    name: "SoundCloud Artist Pro — 1 Month",
    brandSlug: "trihex",
    categorySlug: "productivity",
    usdt: 2.2,
    stock: 160,
    risk: "REVIEW",
    shortDescription: "SoundCloud Artist Pro — uploads, stats, monetization tools.",
    features: [
      "Unlimited uploads (plan limits apply)",
      "Advanced stats",
      "Monetization features as included",
      "Scheduling",
      "Profile customization",
    ],
  }),
  // Gemini 18M Link — existing gemini-pro-18-months-link has LOWER cost (better deal).
  // Do not overwrite; optional stock note only via skipDuplicateBetterDeal.
  item({
    slug: "gemini-pro-18-months-link",
    name: "Gemini Pro 5 TB — 18 Months",
    aliases: ["gemini-pro-18-months-link", "google-ai-pro-5tb-18-months"],
    brandSlug: "gemini",
    categorySlug: "ai-tools",
    usdt: 2,
    stock: 8,
    risk: "REVIEW",
    shortDescription:
      "Gemini 18M link package (no warranty on this supplier lot). Prefer live Buy Now SKU if cheaper.",
    features: [
      "Gemini Pro / AI Pro access ~18 months",
      "Storage when included in the plan",
      "No warranty on this supplier lot",
      "Check availability — better Buy Now deal may already be live",
    ],
    imageNote: "Prefer existing cover for gemini-pro-18-months-link",
  }),

  // ─── BLOCK (contact only) ───────────────────────────────────────
  item({
    slug: "microsoft-365-family-1-year",
    name: "Microsoft 365 Family — 1 Year",
    brandSlug: "microsoft",
    categorySlug: "productivity",
    usdt: 2.5,
    stock: null,
    risk: "BLOCK",
    shortDescription: "High-risk SKU — contact WhatsApp only. Not for cart.",
    features: [
      "Microsoft 365 Family — 1 year (when available)",
      "Contact-only — not sold via Buy Now",
      "Ask on WhatsApp for current availability",
    ],
  }),
  item({
    slug: "linkedin-career-2-months",
    name: "LinkedIn Career — 2 Months",
    brandSlug: "trihex",
    categorySlug: "learning",
    usdt: null,
    stock: null,
    risk: "BLOCK",
    shortDescription: "Price pending supplier quote. Contact WhatsApp.",
    features: [
      "LinkedIn Career / Premium-style access ~2 months",
      "Price confirmed after supplier quote",
      "WhatsApp inquiry only",
    ],
    imageNote: "Needs final cover after price confirmed",
  }),
  item({
    slug: "lovable-ai-pro-1-month",
    name: "Lovable AI Pro — 1 Month",
    brandSlug: "trihex",
    categorySlug: "developer-tools",
    usdt: null,
    stock: null,
    risk: "BLOCK",
    shortDescription: "Price pending. Contact WhatsApp for availability.",
    features: [
      "Lovable AI Pro — 1 month",
      "Price confirmed after supplier quote",
      "WhatsApp inquiry only",
    ],
    imageNote: "Needs final cover after price confirmed",
  }),
  item({
    slug: "veo-3-ultra-45k-1-month",
    name: "Veo 3 Ultra — 45K Credits (1 Month)",
    brandSlug: "gemini",
    categorySlug: "video-editing",
    usdt: null,
    stock: null,
    risk: "BLOCK",
    shortDescription: "Price pending. Contact WhatsApp for availability.",
    features: [
      "Veo 3 Ultra credit pack (~45K)",
      "Credit-based video generation",
      "Price confirmed after supplier quote",
      "WhatsApp inquiry only",
    ],
    imageNote: "Needs final cover after price confirmed",
  }),

  // ─── SKIP (0 stock) — recorded for ops, not inserted as sellable ─
  item({
    slug: "super-grok-1-month",
    name: "Super Grok — 1 Month",
    brandSlug: "grok",
    categorySlug: "ai-tools",
    usdt: null,
    stock: 0,
    risk: "SKIP",
    shortDescription: "0 stock — skipped.",
    features: [],
  }),
  item({
    slug: "nordvpn-3-months",
    name: "NordVPN — 3 Months",
    aliases: ["nordvpn-shared-3-months", "nordvpn-mail-3-months"],
    brandSlug: "nordvpn",
    categorySlug: "productivity",
    usdt: 3.5,
    stock: 0,
    risk: "SKIP",
    shortDescription: "0 stock — skipped / high-risk contact only.",
    features: [],
  }),
];

export const NEW_STOCK_APPLY = NEW_STOCK_JULY_2026.filter(
  (p) => p.risk !== "SKIP",
);
