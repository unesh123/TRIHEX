import { VaultEntry, VaultFilterOptions } from "./vault-types";

export function filterVaultEntries(
  entries: VaultEntry[],
  filters: VaultFilterOptions
): VaultEntry[] {
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
