import { NewsArticle, NewsCategory } from "./types";

/**
 * Normalizes title for fingerprinting to prevent duplicate syndicated articles.
 */
export function normalizeTitleFingerprint(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 8)
    .join("-");
}

/**
 * Calculates a dynamic Hot Score (0 to 100) based on recency, relevance, and source weight.
 */
export function calculateHotScore(params: {
  publishedAt: string | Date;
  corroboratingSources?: number;
  isNepalSpecific?: boolean;
  engagementWeight?: number;
}): number {
  const then = new Date(params.publishedAt).getTime();
  const now = Date.now();
  const ageHours = Math.max(0, (now - then) / (1000 * 60 * 60));

  // Base recency decay (exponential decay over 48 hours)
  let recencyScore = Math.max(10, Math.round(70 * Math.exp(-ageHours / 24)));

  // Source corroboration bonus (+5 per secondary source, max 20)
  const corroborationBonus = Math.min(20, (params.corroboratingSources ?? 1) * 5);

  // Nepal ecosystem relevance bonus (+10)
  const nepalBonus = params.isNepalSpecific ? 10 : 0;

  const total = recencyScore + corroborationBonus + nepalBonus + (params.engagementWeight ?? 0);
  return Math.min(99, Math.max(15, total));
}

/**
 * Generates a URL-safe unique slug from an article title.
 */
export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);
  return base || `intel-${Date.now().toString(36)}`;
}
