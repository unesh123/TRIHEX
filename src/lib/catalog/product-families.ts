/**
 * Group duration packages of the same product line into one family.
 * Data model stays slug-per-duration; storefront collapses duplicates.
 */

import type { MerchCard } from "@/lib/catalog/merchandising";
import { extractDuration } from "@/lib/catalog/duration-parser";

const DURATION_SLUG_RE =
  /(?:^|-)(?:\d+-days?|\d+-months?|\d+m(?:onths?)?|\d+-years?|1-year|18-months?|12m|6m|3m|1m)(?=-|$)/gi;

const TRAILING_MODIFIER_RE =
  /-(?:mail-[ab]|link|cdk|coupon|fw|nw|fww|no-warranty|gmail-w\d+d|\d+d|slot|shared|mail|upgrade-link)$/i;

/** Normalize slug → product-line family key (duration stripped). */
export function productFamilyKey(slug: string): string {
  // URL-safe normalize first (spaces / em-dashes → hyphens)
  let key = slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Peel trailing fulfillment/warranty modifiers repeatedly
  for (let i = 0; i < 4; i++) {
    const next = key.replace(TRAILING_MODIFIER_RE, "");
    if (next === key) break;
    key = next;
  }

  // Peel marketing suffixes that are not real product lines.
  for (let i = 0; i < 4; i++) {
    const next = key
      .replace(/-(?:full-build-plan|full-build|build-plan|moths-plan|plan)$/i, "")
      .replace(TRAILING_MODIFIER_RE, "");
    if (next === key) break;
    key = next;
  }

  key = key.replace(DURATION_SLUG_RE, "");
  // Duration removal can expose another fulfillment/warranty suffix.
  for (let i = 0; i < 4; i++) {
    const next = key
      .replace(/-(?:full-build-plan|full-build|build-plan|moths-plan|plan)$/i, "")
      .replace(TRAILING_MODIFIER_RE, "");
    if (next === key) break;
    key = next;
  }
  key = key.replace(/-+/g, "-").replace(/^-|-$/g, "");

  // Alias naming variants of the same Grok Super line
  if (key === "super-grok" || key === "supergrok") key = "grok-super";

  // CapCut "30-days" often means 1 month — already stripped by duration re
  if (!key) return slug.toLowerCase();
  return key;
}

/** Sort key in approximate days for plan ordering. */
export function durationSortDays(card: MerchCard): number {
  const parsed =
    extractDuration(card.title) ||
    extractDuration(card.slug) ||
    extractDuration(card.durationLabel) ||
    extractDuration(card.packageLabel);
  if (parsed) return parsed.approxDays;

  const label = (card.durationLabel ?? card.packageLabel ?? "").toLowerCase();
  const m = label.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/);
  if (!m) return 9999;
  const n = Number(m[1]);
  const unit = m[2];
  if (unit.startsWith("day")) return n;
  if (unit.startsWith("week")) return n * 7;
  if (unit.startsWith("month")) return n * 30;
  if (unit.startsWith("year")) return n * 365;
  return 9999;
}

/** Customer-facing plan chip label. */
export function planChipLabel(card: MerchCard): string {
  const parsed =
    extractDuration(card.title) ||
    extractDuration(card.slug) ||
    extractDuration(card.durationLabel) ||
    extractDuration(card.packageLabel);

  const base = parsed?.label ?? card.durationLabel ?? card.packageLabel ?? "Plan";
  // Keep short warranty hints when same duration differs
  const title = card.title.toLowerCase();
  if (/no warranty|no-warranty/.test(title) || /no warranty/i.test(card.packageLabel)) {
    return `${base} · No warranty`;
  }
  if (/\bfw\b|full warranty/i.test(card.slug) || /full warranty/i.test(card.packageLabel)) {
    return `${base} · Full warranty`;
  }
  if (/20d|20-day/i.test(card.slug)) return `${base} · 20-day warranty`;
  if (/cdk/i.test(card.slug)) return `${base} · CDK`;
  if (/link/i.test(card.slug) && !/upgrade/i.test(card.slug)) return `${base} · Link`;
  return base;
}

/** Strip duration fluff from titles for family display. */
export function familyDisplayTitle(card: MerchCard): string {
  let raw = card.title;
  if (/elevenlabs creator\s*—\s*shared plan/i.test(raw)) {
    return "ElevenLabs Creator — AI Voice Studio";
  }
  return raw
    .replace(
      /\s*[—–-]\s*\d+\s*(days?|weeks?|months?|years?)\b.*/i,
      "",
    )
    .replace(
      /\b\d+\s*(days?|weeks?|months?|years?)\b/gi,
      "",
    )
    .replace(/\s*[—–-]\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim() || raw;
}

export type PlanOption = {
  slug: string;
  label: string;
  priceNprMinor: number | null;
  showPrice: boolean;
  purchasable: boolean;
  visibility: MerchCard["visibility"];
  durationDays: number;
};

export type ProductFamily = {
  familyKey: string;
  /** Representative card used on listing grids */
  card: MerchCard;
  /** Family headline without duration */
  familyTitle: string;
  plans: PlanOption[];
  planCount: number;
  fromPriceNprMinor: number | null;
};

function pickRepresentative(members: MerchCard[]): MerchCard {
  const scored = [...members].sort((a, b) => {
    const rank = (c: MerchCard) => {
      if (c.visibility === "AVAILABLE" && c.purchasable) return 0;
      if (c.visibility === "AVAILABILITY_UNDER_REVIEW") return 1;
      if (c.visibility === "OUT_OF_STOCK") return 2;
      return 3;
    };
    const d = rank(a) - rank(b);
    if (d !== 0) return d;
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return (a.priceNprMinor ?? Number.MAX_SAFE_INTEGER) - (b.priceNprMinor ?? Number.MAX_SAFE_INTEGER);
  });
  return scored[0]!;
}

export function groupIntoFamilies(cards: MerchCard[]): ProductFamily[] {
  const byFamily = new Map<string, MerchCard[]>();
  for (const card of cards) {
    const key = productFamilyKey(card.slug);
    const list = byFamily.get(key) ?? [];
    list.push(card);
    byFamily.set(key, list);
  }

  const families: ProductFamily[] = [];
  for (const [familyKey, members] of byFamily) {
    const sorted = [...members].sort(
      (a, b) => durationSortDays(a) - durationSortDays(b),
    );

    // Deduplicate members with identical base duration (prefer purchasable / lowest price)
    const dedupedMembers: MerchCard[] = [];
    const seenDuration = new Set<string>();

    for (const m of sorted) {
      const baseLabel = (extractDuration(m.title)?.label ?? planChipLabel(m).split("·")[0]?.trim() ?? "").toLowerCase();
      if (m.purchasable && !seenDuration.has(baseLabel)) {
        seenDuration.add(baseLabel);
        dedupedMembers.push(m);
      }
    }
    for (const m of sorted) {
      const baseLabel = (extractDuration(m.title)?.label ?? planChipLabel(m).split("·")[0]?.trim() ?? "").toLowerCase();
      if (!seenDuration.has(baseLabel)) {
        seenDuration.add(baseLabel);
        dedupedMembers.push(m);
      }
    }

    const finalMembers = dedupedMembers.sort(
      (a, b) => durationSortDays(a) - durationSortDays(b),
    );
    const card = pickRepresentative(finalMembers);
    const priced = finalMembers
      .map((m) => m.priceNprMinor)
      .filter((p): p is number => p != null && Number.isFinite(p));
    const fromPriceNprMinor = priced.length ? Math.min(...priced) : null;

    families.push({
      familyKey,
      card: {
        ...card,
        title: familyDisplayTitle(card),
      },
      familyTitle: familyDisplayTitle(card),
      plans: finalMembers.map((m) => ({
        slug: m.slug,
        label: planChipLabel(m),
        priceNprMinor: m.priceNprMinor,
        showPrice: m.showPrice,
        purchasable: m.purchasable,
        visibility: m.visibility,
        durationDays: durationSortDays(m),
      })),
      planCount: finalMembers.length,
      fromPriceNprMinor,
    });
  }

  return families;
}

/** Collapse catalogue to one card per family (for grids). */
export function collapseCatalogueToFamilies(cards: MerchCard[]): MerchCard[] {
  return groupIntoFamilies(cards).map((f) => {
    const planSummary =
      f.planCount > 1
        ? f.plans.map((p) => p.label).join(" · ")
        : f.card.packageLabel;

    return {
      ...f.card,
      title: f.familyTitle,
      packageLabel:
        f.planCount > 1
          ? `${f.planCount} plans available`
          : f.card.packageLabel,
      durationLabel:
        f.planCount > 1
          ? f.plans.map((p) => p.label).slice(0, 4).join(" · ")
          : f.card.durationLabel,
      // Prefer "from" price when multiple plans
      priceNprMinor:
        f.planCount > 1 && f.fromPriceNprMinor != null
          ? f.fromPriceNprMinor
          : f.card.priceNprMinor,
      // Stash siblings for card chips via features peek? use shortDescription hint
      shortDescription:
        f.planCount > 1
          ? `Plans: ${planSummary}. ${f.card.shortDescription}`.trim()
          : f.card.shortDescription,
    };
  });
}

export function findFamilyPlans(
  allCards: MerchCard[],
  slug: string,
): PlanOption[] {
  const key = productFamilyKey(slug);
  return groupIntoFamilies(
    allCards.filter((c) => productFamilyKey(c.slug) === key),
  )[0]?.plans ?? [];
}
