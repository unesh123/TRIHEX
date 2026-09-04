import { VAULT_ITEMS } from "@/lib/catalog/vault-items";
import { getPublishedDeals } from "@/lib/deals/store";
import { getCuratedPrompts } from "@/lib/prompts/store";
import { RESEARCH_REGISTRY } from "@/lib/vault/research-registry";
import {
  VaultEntry,
  VaultFilterOptions,
  VaultTabId,
} from "./vault-types";

export function getAllVaultEntries(): VaultEntry[] {
  const entries: VaultEntry[] = [];

  // 1. Ingest Classic Classified Vault Items
  for (const item of VAULT_ITEMS) {
    if (item.status === "EXPIRED") continue;

    let entityType: VaultEntry["entityType"] = "PRODUCT";
    let priceMode: VaultEntry["priceMode"] = "PAID";
    let tabCategory: VaultTabId = "premium";
    let provenance: VaultEntry["provenance"] = "TRIHEX PRODUCT";

    if (item.type === "FREE_PERK") {
      entityType = "FREE_RESOURCE";
      priceMode = "FREE";
      tabCategory = "free";
      provenance = "FREE EXTERNAL RESOURCE";
    } else if (item.type === "PUBLIC_RECORD") {
      entityType = "RESEARCH";
      priceMode = "FREE";
      tabCategory = "research";
      provenance = "PUBLIC RECORD";
    } else if (item.type === "INTERACTIVE_TOOL") {
      entityType = "TOOL";
      priceMode = "FREE";
      tabCategory = "developer";
      provenance = "TRIHEX ORIGINAL";
    }

    entries.push({
      id: item.id,
      slug: item.slug,
      entityType,
      entityId: item.id,
      title: item.title,
      summary: item.shortDescription,
      category: item.category,
      tabCategory,
      priceMode,
      displayPrice: item.priceNpr ? `Rs. ${item.priceNpr.toLocaleString()}` : "Free Perk",
      compareAtPrice: item.compareAtPriceNpr ? `Rs. ${item.compareAtPriceNpr.toLocaleString()}` : undefined,
      sourceName: "TRIHEX Classified Vault",
      provenance,
      verificationStatus: "VERIFIED",
      verificationScore: 100,
      freshnessStatus: "LIVE",
      publishedAt: item.updatedAt,
      destinationUrl: `/vault#${item.slug}`,
      badgeText: item.classificationBadge,
      highlights: item.highlights,
      isFeatured: Boolean(item.featured),
    });
  }

  // 2. Ingest Live Verified Deals from Deal Radar
  const deals = getPublishedDeals();
  for (const deal of deals) {
    if (deal.status !== "PUBLISHED") continue;

    const formattedValue = deal.detectedValueNprMinor
      ? `~NPR ${(deal.detectedValueNprMinor / 100).toLocaleString()}`
      : "Free Access";

    entries.push({
      id: `deal-${deal.id}`,
      slug: deal.slug,
      entityType: "DEAL",
      entityId: deal.id,
      title: deal.title,
      summary: deal.summary,
      category: deal.category,
      tabCategory: "deals",
      priceMode: deal.dealType === "FREEBIE" ? "FREE" : "EXTERNAL",
      displayPrice: formattedValue,
      sourceName: deal.vendor,
      provenance: "VERIFIED EXTERNAL DEAL",
      verificationStatus: deal.verificationScore >= 60 ? "VERIFIED" : "PENDING",
      verificationScore: deal.verificationScore,
      freshnessStatus: "LIVE",
      publishedAt: deal.lastVerifiedAt || deal.createdAt,
      validUntil: deal.validUntil,
      destinationUrl: deal.officialVendorUrl || deal.sourceClaimUrl,
      badgeText: deal.promoCode ? `Code: ${deal.promoCode}` : "Vendor Verified",
      highlights: [
        deal.cardRequired ? "Credit Card Required" : "No Card Needed",
        deal.eligibility || "Global / Nepal Accessible",
      ],
      isFeatured: deal.verificationScore >= 80,
    });
  }

  // 3. Ingest Curated Prompt Toolkits
  const prompts = getCuratedPrompts();
  for (const prompt of prompts) {
    entries.push({
      id: `prompt-${prompt.id}`,
      slug: prompt.slug,
      entityType: "PROMPT_PACK",
      entityId: prompt.id,
      title: prompt.title,
      summary: prompt.description,
      category: prompt.category,
      tabCategory: "prompts",
      priceMode: "FREE",
      displayPrice: "Free Template",
      sourceName: prompt.isOriginalTrihex ? "TRIHEX AI Team" : prompt.author,
      provenance: prompt.isOriginalTrihex ? "TRIHEX ORIGINAL" : "OPEN RESOURCE",
      verificationStatus: "VERIFIED",
      verificationScore: 100,
      freshnessStatus: "LIVE",
      publishedAt: prompt.createdAt,
      destinationUrl: `/prompts/${prompt.slug}`,
      badgeText: prompt.isOriginalTrihex ? "TRIHEX Original" : "CC0 Public Domain",
      highlights: prompt.tags.slice(0, 3),
      isFeatured: Boolean(prompt.isOriginalTrihex),
    });
  }

  // 4. Ingest Public Legal Research & Disclosures
  for (const research of RESEARCH_REGISTRY) {
    entries.push({
      id: `res-${research.id}`,
      slug: research.slug,
      entityType: "RESEARCH",
      entityId: research.id,
      title: research.title,
      summary: research.summary,
      category: "PUBLIC_RECORDS",
      tabCategory: "research",
      priceMode: "FREE",
      displayPrice: "Public Record",
      sourceName: research.courtOrAgency,
      provenance: "PUBLIC RECORD",
      verificationStatus: "VERIFIED",
      verificationScore: 100,
      freshnessStatus: "LIVE",
      publishedAt: research.unsealedDate || research.filingDate,
      destinationUrl: `/vault#${research.slug}`,
      badgeText: research.courtOrAgency,
      highlights: research.docketNumber ? [`Docket ${research.docketNumber}`] : research.tags.slice(0, 2),
      isFeatured: false,
    });
  }

  return entries;
}

/**
 * Returns a balanced 6-item window for the Homepage "Inside the TRIHEX Vault" section:
 * 2 premium products/bundles, 2 verified live deals, 1 free cloud perk, 1 guide/research item.
 */
export function getHomepageVaultEntries(): VaultEntry[] {
  const all = getAllVaultEntries();

  const premiumItems = all.filter((e) => e.tabCategory === "premium").slice(0, 2);
  const liveDeals = all.filter((e) => e.tabCategory === "deals" && e.verificationStatus === "VERIFIED").slice(0, 2);
  const freePerks = all.filter((e) => e.tabCategory === "free").slice(0, 1);
  const researchItems = all.filter((e) => e.tabCategory === "research" || e.tabCategory === "prompts").slice(0, 1);

  return [...premiumItems, ...liveDeals, ...freePerks, ...researchItems];
}

export function filterVaultEntries(entries: VaultEntry[], filters: VaultFilterOptions): VaultEntry[] {
  return entries.filter((item) => {
    // Tab filtering
    if (filters.tab && filters.tab !== "all") {
      if (filters.tab === "featured") {
        if (!item.isFeatured) return false;
      } else if (item.tabCategory !== filters.tab) {
        return false;
      }
    }

    // Price mode filtering
    if (filters.priceMode && filters.priceMode !== "ALL") {
      if (item.priceMode !== filters.priceMode) return false;
    }

    // Provenance filtering
    if (filters.provenance && filters.provenance !== "ALL") {
      if (item.provenance !== filters.provenance) return false;
    }

    // Verified only
    if (filters.verifiedOnly && item.verificationStatus !== "VERIFIED") {
      return false;
    }

    // Search query
    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.sourceName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}
