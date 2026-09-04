import { listPublicProducts } from "@/lib/catalog/storefront-catalog";
import { getPublishedDeals } from "@/lib/deals/store";
import { getAllPrompts } from "@/lib/prompts/store";
import { getAllSkills } from "@/lib/skills/store";
import { getAllGuides } from "@/lib/guides/guide-registry";
import { getAllResearchItems } from "@/lib/vault/research-registry";
import { getOpenDatasets } from "@/lib/nepal/open-data-adapter";
import { VAULT_ITEMS } from "@/lib/catalog/vault-items";

import { recordSearchQuery } from "./analytics";
export * from "./analytics";

export type SearchEntityType =
  | "PRODUCT"
  | "DEAL"
  | "PROMPT"
  | "SKILL"
  | "GUIDE"
  | "RESEARCH"
  | "DATASET"
  | "VAULT";

export interface UniversalSearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  badge: string;
  badgeColor?: string;
  score: number;
}

export interface UniversalSearchGroup {
  type: SearchEntityType;
  label: string;
  count: number;
  results: UniversalSearchResult[];
}

export async function performUniversalSearch(
  query: string,
  limitPerCategory = 4,
  options?: {
    ipHash?: string;
    trackAnalytics?: boolean;
  }
): Promise<{
  totalCount: number;
  groups: UniversalSearchGroup[];
}> {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { totalCount: 0, groups: [] };
  }

  const [products] = await Promise.all([listPublicProducts()]);
  const deals = getPublishedDeals();
  const prompts = getAllPrompts();
  const skills = getAllSkills();
  const guides = getAllGuides();
  const research = getAllResearchItems();
  const datasets = getOpenDatasets();

  const groups: UniversalSearchGroup[] = [];

  // 1. Products
  const matchedProducts: UniversalSearchResult[] = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.shortDescription ?? "").toLowerCase().includes(q) ||
        (p.brandName ?? "").toLowerCase().includes(q)
    )
    .map((p) => {
      const brand = p.brandName ?? "TRIHEX";
      const priceFormatted =
        p.priceNprMinor != null ? `NPR ${(p.priceNprMinor / 100).toLocaleString()}` : "Price on request";
      return {
        id: `prod-${p.slug}`,
        type: "PRODUCT" as const,
        title: p.name,
        subtitle: `${brand} · ${priceFormatted}`,
        description: p.shortDescription ?? "",
        url: `/products/${p.slug}`,
        badge: "Software",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        score: p.name.toLowerCase().includes(q) ? 100 : 50,
      };
    });
  if (matchedProducts.length > 0) {
    groups.push({
      type: "PRODUCT",
      label: "Products & Software Plans",
      count: matchedProducts.length,
      results: matchedProducts.slice(0, limitPerCategory),
    });
  }

  // 2. Deals Radar
  const matchedDeals: UniversalSearchResult[] = deals
    .filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q)
    )
    .map((d) => ({
      id: d.id,
      type: "DEAL" as const,
      title: d.title,
      subtitle: `${d.vendor} · ${d.dealType}`,
      description: d.summary,
      url: "/deals",
      badge: "Verified Deal",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      score: d.title.toLowerCase().includes(q) ? 95 : 45,
    }));
  if (matchedDeals.length > 0) {
    groups.push({
      type: "DEAL",
      label: "Verified Software Deals",
      count: matchedDeals.length,
      results: matchedDeals.slice(0, limitPerCategory),
    });
  }

  // 3. Prompts
  const matchedPrompts: UniversalSearchResult[] = prompts
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
    .map((p) => ({
      id: p.id,
      type: "PROMPT" as const,
      title: p.title,
      subtitle: `${p.category} · ${p.variables.length} Variables`,
      description: p.description,
      url: `/prompts/${p.slug}`,
      badge: p.isOriginalTrihex ? "TRIHEX Original" : "Prompt",
      badgeColor: p.isOriginalTrihex
        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      score: p.title.toLowerCase().includes(q) ? 90 : 40,
    }));
  if (matchedPrompts.length > 0) {
    groups.push({
      type: "PROMPT",
      label: "AI Prompts & Templates",
      count: matchedPrompts.length,
      results: matchedPrompts.slice(0, limitPerCategory),
    });
  }

  // 4. Agent Skills
  const matchedSkills: UniversalSearchResult[] = skills
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    )
    .map((s) => ({
      id: s.id,
      type: "SKILL" as const,
      title: s.name,
      subtitle: `${s.category} · ${s.files.length} Skill Files`,
      description: s.summary,
      url: `/skills/${s.slug}`,
      badge: "Agent Skill",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      score: s.name.toLowerCase().includes(q) ? 85 : 35,
    }));
  if (matchedSkills.length > 0) {
    groups.push({
      type: "SKILL",
      label: "Autonomous Agent Skills",
      count: matchedSkills.length,
      results: matchedSkills.slice(0, limitPerCategory),
    });
  }

  // 5. Guides
  const matchedGuides: UniversalSearchResult[] = guides
    .filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.subtitle.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q)
    )
    .map((g) => ({
      id: g.id,
      type: "GUIDE" as const,
      title: g.title,
      subtitle: `${g.author} · ${g.readingTimeMinutes} min read`,
      description: g.summary,
      url: `/guides/${g.slug}`,
      badge: "Knowledge Guide",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      score: g.title.toLowerCase().includes(q) ? 80 : 30,
    }));
  if (matchedGuides.length > 0) {
    groups.push({
      type: "GUIDE",
      label: "Technical Guides",
      count: matchedGuides.length,
      results: matchedGuides.slice(0, limitPerCategory),
    });
  }

  // 6. Research Vault
  const matchedResearch: UniversalSearchResult[] = research
    .filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.courtOrAgency.toLowerCase().includes(q)
    )
    .map((r) => ({
      id: r.id,
      type: "RESEARCH" as const,
      title: r.title,
      subtitle: `${r.courtOrAgency} · ${r.redistributionStatus}`,
      description: r.summary,
      url: `/vault/research/${r.slug}`,
      badge: "Public Record",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      score: r.title.toLowerCase().includes(q) ? 75 : 25,
    }));
  if (matchedResearch.length > 0) {
    groups.push({
      type: "RESEARCH",
      label: "Public Records & Research",
      count: matchedResearch.length,
      results: matchedResearch.slice(0, limitPerCategory),
    });
  }

  // 7. Nepal Datasets
  const matchedDatasets: UniversalSearchResult[] = datasets
    .filter(
      (ds) =>
        ds.title.toLowerCase().includes(q) ||
        ds.description.toLowerCase().includes(q) ||
        ds.organization.toLowerCase().includes(q)
    )
    .map((ds) => ({
      id: ds.id,
      type: "DATASET" as const,
      title: ds.title,
      subtitle: `${ds.organization} · ${ds.category}`,
      description: ds.description,
      url: "/nepal/datasets",
      badge: "Civic Data",
      badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
      score: ds.title.toLowerCase().includes(q) ? 70 : 20,
    }));
  if (matchedDatasets.length > 0) {
    groups.push({
      type: "DATASET",
      label: "Nepal Civic Datasets",
      count: matchedDatasets.length,
      results: matchedDatasets.slice(0, limitPerCategory),
    });
  }

  const totalCount = groups.reduce((sum, g) => sum + g.count, 0);

  if (options?.trackAnalytics !== false && q.length >= 2) {
    recordSearchQuery({
      query,
      resultCount: totalCount,
      ipHash: options?.ipHash,
    }).catch((err) => {
      console.error("[universal-search] Analytics logging failed:", err);
    });
  }

  return { totalCount, groups };
}
