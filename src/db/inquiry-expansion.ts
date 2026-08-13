/**
 * Starter inquiry catalogue — Check Availability only (no Buy Now).
 * Costs are estimated wholesale USD; edit in admin after import with your real buy prices.
 * FX = 160 NPR/USD · default margin 30% → sell NPR.
 */
import { priceFromCost } from "@/lib/catalog/bulk-import";

export type InquirySeedItem = {
  name: string;
  /** Your estimated buy cost in USD (edit later) */
  costUsd: number;
  brandSlug?: string;
  categorySlug?: string;
  durationHint?: string;
};

function row(
  name: string,
  costUsd: number,
  extras?: Partial<InquirySeedItem>,
): InquirySeedItem {
  return { name, costUsd, ...extras };
}

/** ~110 digital packages — same style as your live catalogue */
export const INQUIRY_STARTER_CATALOGUE: InquirySeedItem[] = [
  // ChatGPT / OpenAI
  row("ChatGPT Plus — 1 Month", 18),
  row("ChatGPT Plus — 3 Months", 48),
  row("ChatGPT Plus — 6 Months", 90),
  row("ChatGPT Plus — 12 Months", 160),
  row("ChatGPT Team — 1 Month (per seat)", 25),
  row("ChatGPT Go — 1 Month", 8),
  row("ChatGPT Go — 3 Months", 20),
  row("OpenAI API Credit — $50", 42),
  row("OpenAI API Credit — $100", 82),

  // Gemini
  row("Gemini AI Pro — 1 Month", 12),
  row("Gemini AI Pro — 3 Months", 32),
  row("Gemini AI Pro 5TB — 6 Months", 55),
  row("Gemini AI Pro 5TB — 12 Months", 95),
  row("Gemini AI Pro 5TB — 18 Months", 120),
  row("Gemini Advanced — 1 Month", 14),
  row("Google One AI Premium — 12 Months", 110),
  row("Google Veo credits pack — Standard", 35),

  // Claude
  row("Claude Pro — 1 Month", 18),
  row("Claude Pro — 3 Months", 48),
  row("Claude Pro — 6 Months", 90),
  row("Claude Pro — 12 Months", 165),
  row("Claude Team — 1 Month (per seat)", 28),

  // Grok
  row("Grok Super — 1 Month", 12),
  row("Grok Super — 3 Months", 30),
  row("Grok Super — 6 Months", 55),
  row("Grok Super — 12 Months", 95),
  row("Grok Heavy — 1 Month", 22),

  // CapCut
  row("CapCut Pro — 7 Days", 2),
  row("CapCut Pro — 1 Month", 5),
  row("CapCut Pro — 3 Months", 12),
  row("CapCut Pro — 6 Months", 22),
  row("CapCut Pro — 12 Months", 38),
  row("CapCut Pro — Space / Team seat — 1 Month", 8),

  // Canva
  row("Canva Pro — 1 Month", 8),
  row("Canva Pro — 3 Months", 20),
  row("Canva Pro — 6 Months", 35),
  row("Canva Pro — 1 Year", 55),
  row("Canva Pro — 2 Years", 95),
  row("Canva Teams — 1 Year (per seat)", 70),
  row("Canva Edu Pro — 1 Year", 5),

  // Adobe
  row("Adobe Creative Cloud — 1 Month", 18),
  row("Adobe Creative Cloud — 2 Months", 32),
  row("Adobe Creative Cloud — 3 Months", 45),
  row("Adobe Creative Cloud — 6 Months", 80),
  row("Adobe Creative Cloud — 12 Months", 140),
  row("Adobe Photoshop only — 12 Months", 55),
  row("Adobe Premiere Pro only — 12 Months", 55),
  row("Adobe Stock — 10 assets pack", 25),

  // Design / creative AI
  row("Midjourney Basic — 1 Month", 10),
  row("Midjourney Standard — 1 Month", 22),
  row("Midjourney Pro — 1 Month", 42),
  row("Leonardo AI — 1 Month", 10),
  row("Leonardo AI — 3 Months", 25),
  row("Runway Gen-3 — 1 Month", 28),
  row("Runway Gen-3 — 3 Months", 70),
  row("Kling AI Standard — 660 Credits", 8),
  row("Kling AI Pro — 3000 Credits", 25),
  row("Kling AI Ultra — 26K Credits", 90),
  row("Luma Dream Machine — 1 Month", 18),
  row("Pika Labs — 1 Month", 12),
  row("Hailuo / MiniMax video — Credit pack", 20),

  // Developer
  row("Cursor Pro — 1 Month", 16),
  row("Cursor Pro — 3 Months", 42),
  row("Cursor Ultra — 1 Month", 35),
  row("GitHub Copilot — 1 Month", 8),
  row("GitHub Copilot — 12 Months", 80),
  row("JetBrains All Products — 12 Months", 120),
  row("Windsurf / Codeium Pro — 1 Month", 12),

  // Productivity
  row("Notion Plus — 1 Month", 8),
  row("Notion Plus — 12 Months", 70),
  row("Notion Business — 3 Months", 25),
  row("Notion Business — 12 Months", 85),
  row("Figma Professional — 1 Month", 12),
  row("Figma Professional — 12 Months", 110),
  row("Figma Edu — 2 Years", 8),
  row("Grammarly Premium — 1 Month", 8),
  row("Grammarly Premium — 12 Months", 70),
  row("Grammarly Business — 12 Months", 120),
  row("Evernote Personal — 12 Months", 40),
  row("Todoist Pro — 12 Months", 35),

  // Microsoft / Office
  row("Microsoft 365 Personal — 12 Months", 35),
  row("Microsoft 365 Family — 12 Months", 55),
  row("Microsoft 365 Family — 10 Months", 45),
  row("Office 365 + 100GB OneDrive — Lifetime", 6),
  row("Office 365 + 1TB OneDrive — Lifetime", 10),
  row("Windows 11 Pro key — Retail", 12),

  // Streaming / media
  row("YouTube Premium — 1 Month", 5),
  row("YouTube Premium — 3 Months", 12),
  row("YouTube Premium — 12 Months", 40),
  row("YouTube Premium Family — 12 Months", 70),
  row("Spotify Premium — 1 Month", 4),
  row("Spotify Premium — 3 Months", 10),
  row("Spotify Premium — 12 Months", 35),
  row("Spotify Duo — 12 Months", 55),
  row("Netflix Premium — 1 Month", 8),
  row("Netflix Premium — 3 Months", 22),
  row("Netflix Premium — 12 Months", 75),
  row("Disney+ Premium — 12 Months", 45),
  row("Amazon Prime Video — 12 Months", 40),
  row("Crunchyroll Mega Fan — 12 Months", 35),

  // Voice / audio AI
  row("ElevenLabs Starter — 1 Month", 5),
  row("ElevenLabs Creator — 1 Month", 18),
  row("ElevenLabs Pro — 1 Month", 75),
  row("Suno AI Pro — 1 Month", 8),
  row("Suno AI Premier — 1 Month", 22),
  row("Udio Pro — 1 Month", 10),

  // Learning
  row("Coursera Plus — 1 Month", 35),
  row("Coursera Plus — 12 Months", 280),
  row("Skillshare — 12 Months", 80),
  row("LinkedIn Learning — 12 Months", 120),
  row("Duolingo Super — 12 Months", 50),
  row("MasterClass — 12 Months", 90),

  // Security / VPN
  row("NordVPN — 1 Month", 5),
  row("NordVPN — 12 Months", 35),
  row("NordVPN — 24 Months", 55),
  row("ExpressVPN — 12 Months", 55),
  row("Surfshark — 24 Months", 40),
  row("1Password Individual — 12 Months", 28),

  // Misc popular
  row("Perplexity Pro — 1 Month", 16),
  row("Perplexity Pro — 12 Months", 140),
  row("Character.AI c.ai+ — 1 Month", 8),
  row("Poe Pro — 1 Month", 16),
  row("Gamma Pro — 12 Months", 70),
  row("Beautiful.ai Pro — 12 Months", 90),
  row("Envato Elements — 1 Month", 14),
  row("Envato Elements — 12 Months", 140),
  row("Freepik Premium — 12 Months", 55),
  row("Shutterstock 10 downloads", 25),
];

export function inquiryItemPriced(item: InquirySeedItem) {
  const priced = priceFromCost({
    costAmount: item.costUsd,
    currency: "USD",
    marginPercent: 30,
  });
  return {
    ...item,
    ...priced,
    shortDescription:
      "Check availability on WhatsApp. After payment verification, delivery is arranged on WhatsApp.",
  };
}

export function allInquiryStarterPriced() {
  return INQUIRY_STARTER_CATALOGUE.map(inquiryItemPriced);
}

export const INQUIRY_STARTER_COUNT = INQUIRY_STARTER_CATALOGUE.length;
