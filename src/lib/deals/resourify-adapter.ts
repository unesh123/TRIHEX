import { sanitizeInertText } from "@/lib/ingestion/inert-parser";
import { DealCandidate, DealType, ResourifyRawItem } from "./types";

function normalizeDealType(rawType?: string): DealType {
  const t = (rawType || "").toLowerCase();
  if (t.includes("credit")) return "CREDITS";
  if (t.includes("promo") || t.includes("coupon") || t.includes("code")) return "PROMO_CODE";
  if (t.includes("freebie") || t.includes("free tool")) return "FREEBIE";
  if (t.includes("student") || t.includes("edu")) return "STUDENT_TIER";
  if (t.includes("discount") || t.includes("off") || t.includes("%")) return "DISCOUNT";
  return "FREE_TRIAL";
}

function normalizeCategory(cat?: string): DealCandidate["category"] {
  const c = (cat || "").toLowerCase();
  if (c.includes("ai") || c.includes("code") || c.includes("dev") || c.includes("api")) return "AI_DEV";
  if (c.includes("cloud") || c.includes("host") || c.includes("server") || c.includes("vps")) return "CLOUD";
  if (c.includes("design") || c.includes("video") || c.includes("ui") || c.includes("3d")) return "DESIGN";
  if (c.includes("student") || c.includes("learn") || c.includes("course")) return "EDUCATION";
  if (c.includes("infra") || c.includes("db") || c.includes("database") || c.includes("storage")) return "INFRASTRUCTURE";
  return "PRODUCTIVITY";
}

function parseNprValueMinor(dealValue?: string): number | undefined {
  if (!dealValue) return undefined;
  const matchUsd = dealValue.match(/\$(\d+(?:\.\d+)?)/);
  if (matchUsd) {
    const usd = Number.parseFloat(matchUsd[1]);
    // 1 USD ~ 135 NPR -> in minor units (paisa)
    return Math.round(usd * 135 * 100);
  }
  const matchNpr = dealValue.match(/npr\s*(\d+(?:\.\d+)?)/i);
  if (matchNpr) {
    return Math.round(Number.parseFloat(matchNpr[1]) * 100);
  }
  return undefined;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeResourifyCandidate(
  item: ResourifyRawItem,
  sourceId = "src-resourify-deals"
): DealCandidate {
  const title = sanitizeInertText(item.title, 120);
  const vendor = sanitizeInertText(item.companyName, 80);
  const summary = sanitizeInertText(item.description, 500);
  const slug = `${slugify(vendor)}-${slugify(title)}`.slice(0, 100);

  return {
    id: `deal-${item.id}`,
    sourceId,
    sourceExternalId: item.id,
    title,
    slug,
    vendor,
    summary,
    dealType: normalizeDealType(item.dealType),
    detectedValueNprMinor: parseNprValueMinor(item.dealValue),
    promoCode: item.couponCode ? sanitizeInertText(item.couponCode, 50) : undefined,
    eligibility: item.requirements ? sanitizeInertText(item.requirements, 200) : "Open to all users",
    cardRequired: Boolean(item.requiresCreditCard),
    sourceClaimUrl: item.dealUrl,
    officialVendorUrl: item.officialUrl || item.dealUrl,
    discoveredAt: new Date().toISOString(),
    validUntil: item.expiryDate,
    verificationScore: 0,
    status: "DISCOVERED",
    revisions: [],
    category: normalizeCategory(item.category),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
