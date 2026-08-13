/**
 * Parse admin bulk product lines and price from cost → NPR sell + profit.
 *
 * Supported line formats (one product per line):
 *   Product Name | 20
 *   Product Name | 20 USD
 *   Product Name | 3200 NPR
 *   Product Name, 20, USD, 35
 *   Product Name	20	USD
 *
 * Cost currency: USD / USDT / NPR (default USD).
 * Margin default 30%. Sell rounded to nearest NPR 10.
 */
import {
  DEFAULT_MARGIN_PERCENT,
  OPERATIONAL_FX_NPR_PER_USD,
  sellFromCost,
} from "@/db/stock-pricing";

export type CostCurrency = "USD" | "USDT" | "NPR";

export type ParsedImportLine = {
  name: string;
  costRaw: number;
  currency: CostCurrency;
  marginPercent: number;
  costNpr: number;
  sellNpr: number;
  profitNpr: number;
  profitPercent: number;
  brandSlug: string;
  categorySlug: string;
  slug: string;
  error?: string;
};

export function slugifyProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

export function detectBrandSlug(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gemini") || n.includes("google ai") || n.includes("veo"))
    return "gemini";
  if (n.includes("chatgpt") || n.includes("openai") || n.includes("gpt"))
    return "openai";
  if (n.includes("grok") || n.includes("xai") || n.includes("x.ai")) return "grok";
  if (n.includes("claude") || n.includes("anthropic")) return "claude";
  if (n.includes("adobe") || n.includes("photoshop") || n.includes("premiere"))
    return "adobe";
  if (n.includes("canva")) return "canva";
  if (n.includes("coursera")) return "coursera";
  if (n.includes("capcut")) return "capcut";
  if (n.includes("kling")) return "kling";
  if (n.includes("cursor")) return "cursor";
  if (n.includes("notion")) return "notion";
  if (n.includes("figma")) return "figma";
  if (n.includes("eleven")) return "elevenlabs";
  if (n.includes("grammarly")) return "grammarly";
  if (n.includes("nord") || n.includes("vpn")) return "nordvpn";
  if (n.includes("youtube") || n.includes("yt premium")) return "youtube";
  if (
    n.includes("office") ||
    n.includes("microsoft") ||
    n.includes("onedrive") ||
    n.includes("365")
  )
    return "microsoft";
  if (n.includes("spotify") || n.includes("netflix") || n.includes("disney"))
    return "trihex";
  if (n.includes("midjourney") || n.includes("runway") || n.includes("leonardo"))
    return "trihex";
  return "trihex";
}

export function detectCategorySlug(name: string, brandSlug: string): string {
  const n = name.toLowerCase();
  if (
    n.includes("capcut") ||
    n.includes("premiere") ||
    n.includes("runway") ||
    n.includes("kling") ||
    n.includes("veo")
  )
    return "video-editing";
  if (
    n.includes("canva") ||
    n.includes("figma") ||
    n.includes("adobe") ||
    n.includes("midjourney") ||
    n.includes("leonardo")
  )
    return "design";
  if (n.includes("cursor") || n.includes("github") || n.includes("copilot"))
    return "developer-tools";
  if (n.includes("coursera") || n.includes("edu") || n.includes("udemy"))
    return "learning";
  if (n.includes("notion") || n.includes("office") || n.includes("grammarly"))
    return "productivity";
  if (brandSlug === "openai" || brandSlug === "gemini" || brandSlug === "claude" || brandSlug === "grok")
    return "ai-tools";
  return "ai-tools";
}

export function costToNpr(
  amount: number,
  currency: CostCurrency,
  fx = OPERATIONAL_FX_NPR_PER_USD,
): number {
  if (currency === "NPR") return Math.round(amount);
  return Math.round(amount * fx);
}

export function priceFromCost(input: {
  costAmount: number;
  currency: CostCurrency;
  marginPercent?: number;
  fx?: number;
}): {
  costNpr: number;
  sellNpr: number;
  profitNpr: number;
  profitPercent: number;
  marginPercent: number;
} {
  const margin = input.marginPercent ?? DEFAULT_MARGIN_PERCENT;
  const costNpr = costToNpr(input.costAmount, input.currency, input.fx);
  const sellNpr = sellFromCost(costNpr, margin);
  const profitNpr = sellNpr - costNpr;
  const profitPercent =
    costNpr > 0 ? Math.round((profitNpr / costNpr) * 1000) / 10 : 100;
  return { costNpr, sellNpr, profitNpr, profitPercent, marginPercent: margin };
}

function parseCurrencyToken(raw: string | undefined): CostCurrency {
  const t = (raw ?? "USD").trim().toUpperCase();
  if (t === "NPR" || t === "RS" || t === "NRS") return "NPR";
  if (t === "USDT" || t === "USDC") return "USDT";
  return "USD";
}

/** Parse one line into a product import row (or error). */
export function parseImportLine(
  line: string,
  defaultMargin = DEFAULT_MARGIN_PERCENT,
): ParsedImportLine | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  let name = "";
  let costRaw = NaN;
  let currency: CostCurrency = "USD";
  let marginPercent = defaultMargin;

  if (trimmed.includes("|")) {
    const parts = trimmed.split("|").map((p) => p.trim());
    name = parts[0] ?? "";
    const costPart = parts[1] ?? "";
    const costMatch = costPart.match(
      /^([\d.]+)\s*(USD|USDT|USDC|NPR|RS|NRS)?$/i,
    );
    if (costMatch) {
      costRaw = Number(costMatch[1]);
      currency = parseCurrencyToken(costMatch[2]);
    }
    if (parts[2]) {
      const m = Number(String(parts[2]).replace(/%/g, ""));
      if (Number.isFinite(m) && m >= 0) marginPercent = m;
    }
  } else if (trimmed.includes(",") || trimmed.includes("\t")) {
    const parts = trimmed.split(/[,\t]/).map((p) => p.trim());
    name = parts[0] ?? "";
    costRaw = Number(parts[1]);
    currency = parseCurrencyToken(parts[2]);
    if (parts[3]) {
      const m = Number(String(parts[3]).replace(/%/g, ""));
      if (Number.isFinite(m) && m >= 0) marginPercent = m;
    }
  } else {
    // "Name 20 USD" trailing cost
    const m = trimmed.match(/^(.*?)[-\s]+([\d.]+)\s*(USD|USDT|USDC|NPR|RS|NRS)?$/i);
    if (m) {
      name = (m[1] ?? "").trim();
      costRaw = Number(m[2]);
      currency = parseCurrencyToken(m[3]);
    }
  }

  if (!name) {
    return {
      name: trimmed,
      costRaw: 0,
      currency: "USD",
      marginPercent,
      costNpr: 0,
      sellNpr: 0,
      profitNpr: 0,
      profitPercent: 0,
      brandSlug: "trihex",
      categorySlug: "ai-tools",
      slug: "",
      error: "Missing product name",
    };
  }

  if (!Number.isFinite(costRaw) || costRaw < 0) {
    return {
      name,
      costRaw: 0,
      currency,
      marginPercent,
      costNpr: 0,
      sellNpr: 0,
      profitNpr: 0,
      profitPercent: 0,
      brandSlug: detectBrandSlug(name),
      categorySlug: "ai-tools",
      slug: slugifyProductName(name),
      error: "Invalid cost amount",
    };
  }

  const priced = priceFromCost({
    costAmount: costRaw,
    currency,
    marginPercent,
  });
  const brandSlug = detectBrandSlug(name);
  const slug = slugifyProductName(name);

  return {
    name,
    costRaw,
    currency,
    marginPercent,
    costNpr: priced.costNpr,
    sellNpr: priced.sellNpr,
    profitNpr: priced.profitNpr,
    profitPercent: priced.profitPercent,
    brandSlug,
    categorySlug: detectCategorySlug(name, brandSlug),
    slug,
  };
}

export function parseImportText(
  text: string,
  defaultMargin = DEFAULT_MARGIN_PERCENT,
): ParsedImportLine[] {
  return text
    .split(/\r?\n/)
    .map((line) => parseImportLine(line, defaultMargin))
    .filter((row): row is ParsedImportLine => row != null);
}
