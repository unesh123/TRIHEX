import { listPublicProducts } from "@/lib/catalog/storefront-catalog";
import { getPublishedDeals } from "@/lib/deals/store";

export interface UserInterestProfile {
  recentProductSlugs: string[];
  recentCategories: string[];
  savedEntityIds: string[];
}

export interface PersonalizedRecommendation {
  type: "product" | "deal" | "forex";
  title: string;
  subtitle: string;
  url: string;
  priceOrValue?: string;
  reason: string;
  badge: string;
}

export async function getPersonalizedRecommendations(
  profile: UserInterestProfile
): Promise<PersonalizedRecommendation[]> {
  const recommendations: PersonalizedRecommendation[] = [];

  // 1. Fetch available products
  let allProducts: any[] = [];
  try {
    allProducts = await listPublicProducts();
  } catch (e) {
    console.warn("[Personalization] Failed to load products:", e);
  }

  // 2. Fetch verified deals
  let allDeals: any[] = [];
  try {
    allDeals = getPublishedDeals();
  } catch (e) {
    console.warn("[Personalization] Failed to load deals:", e);
  }

  // If user has recent product history, recommend related products in the same category or brand
  if (profile.recentProductSlugs.length > 0) {
    const lastViewed = allProducts.find((p) => p.slug === profile.recentProductSlugs[0]);
    if (lastViewed) {
      const related = allProducts.filter(
        (p) =>
          p.slug !== lastViewed.slug &&
          (p.categoryName === lastViewed.categoryName || p.brandName === lastViewed.brandName)
      );

      for (const item of related.slice(0, 2)) {
        recommendations.push({
          type: "product",
          title: item.name,
          subtitle: item.shortDescription || `More from ${item.categoryName || item.brandName}`,
          url: `/products/${item.slug}`,
          priceOrValue: item.priceNprMinor ? `NPR ${(item.priceNprMinor / 100).toLocaleString()}` : undefined,
          reason: `Because you viewed ${lastViewed.name}`,
          badge: "RECOMMENDED",
        });
      }
    }
  }

  // If user has saved deals or is interested in cloud/credits
  const dealCandidate = allDeals.find((d) => !profile.savedEntityIds.includes(d.id));
  if (dealCandidate) {
    recommendations.push({
      type: "deal",
      title: dealCandidate.title,
      subtitle: dealCandidate.summary,
      url: "/deals",
      priceOrValue: dealCandidate.detectedValueNprMinor
        ? `NPR ${(dealCandidate.detectedValueNprMinor / 100).toLocaleString()}`
        : "Free Perk",
      reason: "Popular verified perk on Deal Radar",
      badge: dealCandidate.dealType,
    });
  }

  // Cold start fallback: Top verified developer picks
  if (recommendations.length < 3) {
    for (const p of allProducts.slice(0, 3 - recommendations.length)) {
      if (!recommendations.some((r) => r.url === `/products/${p.slug}`)) {
        recommendations.push({
          type: "product",
          title: p.name,
          subtitle: p.shortDescription || "Verified Storefront Selection",
          url: `/products/${p.slug}`,
          priceOrValue: p.priceNprMinor ? `NPR ${(p.priceNprMinor / 100).toLocaleString()}` : undefined,
          reason: "Trending essential in Nepal",
          badge: "FEATURED",
        });
      }
    }
  }

  return recommendations;
}
