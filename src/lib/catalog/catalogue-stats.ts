/**
 * TRIHEX DIGITAL — Single Authoritative Source of Truth for Catalogue Stats
 * Eliminates count fragmentation across Homepage, Header, Products, and Vault.
 */

import {
  getLiveMerchandisingCatalogue,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import { getAllVaultEntries } from "@/lib/vault/vault-aggregator";

export interface CatalogueStats {
  /** Unique product families ready for instant order (e.g. 30) */
  availableProductLines: number;
  /** Total purchasable individual SKUs/variants across all duration plans */
  availableSkus: number;
  /** Products currently undergoing compliance / price re-verification */
  underReviewProducts: number;
  /** Total catalogue products in master registry (including offline/review) */
  totalCatalogueEntries: number;
  /** Verified software deals currently live on Deal Radar */
  liveDealsCount: number;
  /** Free developer perks, cloud credits, and tools in archive */
  freeResourcesCount: number;
  /** Premium software bundles & master courses */
  vipBundlesCount: number;
  /** Curated AI prompt engineering toolkits */
  promptsCount: number;
  /** Official public legal research records */
  publicRecordsCount: number;
  /** Total unified Vault discovery records */
  vaultTotalCount: number;
}

export async function getCatalogueStats(): Promise<CatalogueStats> {
  const allCards = await getLiveMerchandisingCatalogue({ includeBlocked: true });
  const availableCards = allCards.filter((c) => c.visibility === "AVAILABLE");
  const underReviewCards = allCards.filter(
    (c) =>
      c.visibility === "AVAILABILITY_UNDER_REVIEW" ||
      c.visibility === "COMING_SOON"
  );
  const groupedAvailableLines = withFamilyGrouping(availableCards);

  const vaultEntries = getAllVaultEntries();
  const liveDeals = vaultEntries.filter((e) => e.tabCategory === "deals");
  const freeResources = vaultEntries.filter((e) => e.priceMode === "FREE");
  const vipBundles = vaultEntries.filter(
    (e) => e.tabCategory === "premium" || e.entityType === "PRODUCT"
  );
  const prompts = vaultEntries.filter((e) => e.tabCategory === "prompts");
  const publicRecords = vaultEntries.filter((e) => e.tabCategory === "research");

  return {
    availableProductLines: groupedAvailableLines.length,
    availableSkus: availableCards.length,
    underReviewProducts: underReviewCards.length,
    totalCatalogueEntries: allCards.length,
    liveDealsCount: liveDeals.length,
    freeResourcesCount: freeResources.length,
    vipBundlesCount: vipBundles.length,
    promptsCount: prompts.length,
    publicRecordsCount: publicRecords.length,
    vaultTotalCount: vaultEntries.length,
  };
}
