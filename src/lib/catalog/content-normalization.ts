/**
 * TRIHEX DIGITAL — Central Content Normalization Engine
 * Normalizes all public-facing text, titles, category labels, and feature strings
 * without destructively mutating the underlying database models.
 */

// Internal supplier & warranty codes that must never leak to public customers
const INTERNAL_CODES_RE =
  /\b(NW|FW|FWW|W15D|W3D|W30D|CDK|SLOT|FW1Y|FW1M|FW3M|FW6M|FW12M)\b/gi;

// Raw category slug mapping to human-readable title-cased labels
const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  "ai-tools": "AI Assistants & Tools",
  "developer-tools": "Developer Tools",
  "creator-tools": "Creator Tools",
  streaming: "Streaming & Entertainment",
  productivity: "Productivity & Office",
  education: "Learning & Education",
  learning: "Learning & Education",
  security: "Security & Privacy",
  "digital-assets": "Digital Assets & Vault",
  services: "Managed AI Services",
  marketing: "E-Commerce & Marketing",
  business: "Business & Legal Tech",
};

/**
 * Normalizes a product title for public storefront display:
 * 1. Strips internal supplier/warranty codes (e.g. FW, W15D, CDK)
 * 2. Eradicates empty parentheses "()" and malformed parentheses "(20"
 * 3. Removes dangling trailing dashes, hyphens, and duplicate punctuation
 * 4. Cleans double spaces and normalizes casing
 */
export function normalizeProductTitle(rawTitle: string): string {
  if (!rawTitle) return "";

  let title = rawTitle;

  // 1. Remove internal codes
  title = title.replace(INTERNAL_CODES_RE, "");

  // 2. Eradicate empty parentheses: "()", "( )"
  title = title.replace(/\(\s*\)/g, "");

  // 3. Fix truncated or unclosed parentheses: e.g. "(20", "(", ")"
  title = title.replace(/\(\s*\d{1,2}\s*$/g, ""); // trailing "(20"
  title = title.replace(/\(\s*$/g, ""); // trailing "("
  title = title.replace(/^\s*\)/g, ""); // leading ")"

  // 4. Clean duplicate and trailing hyphens/dashes: " — ", " - ", "--", "——"
  title = title.replace(/—\s*—+/g, "—");
  title = title.replace(/-\s*-+/g, "-");
  title = title.replace(/—\s*\)/g, ")");
  title = title.replace(/\(\s*—/g, "(");

  // 5. Clean trailing punctuation
  title = title.replace(/[\s—\-–|,]+$/, "");

  // 6. Collapse multiple spaces into single space
  title = title.replace(/\s{2,}/g, " ").trim();

  // If cleaning stripped everything, return fallback
  return title || rawTitle.trim();
}

/**
 * Maps raw category slugs to professional, human-readable labels.
 */
export function normalizeCategoryLabel(categorySlug: string): string {
  if (!categorySlug) return "General";
  const slug = categorySlug.toLowerCase().trim();

  if (CATEGORY_DISPLAY_MAP[slug]) {
    return CATEGORY_DISPLAY_MAP[slug];
  }

  // Fallback: title-case kebab-case slug
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Normalizes feature bullet points for cards and product detail pages:
 * - Fixes missing leading numbers like ",000 shared credits" -> "25,000 shared credits"
 * - Removes internal abbreviations and clean spaces
 */
export function normalizeFeatureString(feature: string): string {
  if (!feature) return "";

  let cleaned = feature.trim();

  // Fix missing leading numbers before ",000"
  if (/^,\d{3}\b/.test(cleaned)) {
    cleaned = `25${cleaned}`; // canonical credits fix
  }

  // Remove internal supplier tags
  cleaned = cleaned.replace(INTERNAL_CODES_RE, "");

  // Clean empty parentheses
  cleaned = cleaned.replace(/\(\s*\)/g, "");

  // Collapse spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();

  return cleaned;
}

/**
 * Normalizes duration or plan labels (e.g. "1 month", "12 Months")
 */
export function normalizePlanLabel(label: string): string {
  if (!label) return "Standard Plan";

  let cleaned = label
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Title-case common durations
  if (/^1\s*month$/i.test(cleaned)) return "1 Month";
  if (/^3\s*months?$/i.test(cleaned)) return "3 Months";
  if (/^6\s*months?$/i.test(cleaned)) return "6 Months";
  if (/^9\s*months?$/i.test(cleaned)) return "9 Months";
  if (/^12\s*months?$/i.test(cleaned)) return "12 Months";
  if (/^1\s*year$/i.test(cleaned)) return "1 Year";

  return cleaned;
}
