import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/live-merchandising";
import { getAllBlogPosts } from "@/lib/seo/blog-posts";
import { isInternalOrTestSku } from "@/lib/commerce/catalogue-lint";
import { getAllPrompts } from "@/lib/prompts/store";
import { getAllSkills } from "@/lib/skills/store";
import { getAllGuides } from "@/lib/guides/guide-registry";
import { getAllResearchItems } from "@/lib/vault/research-registry";
import { getAllNews } from "@/lib/news/store";
import { getAllResources } from "@/lib/resources/store";
import { getPublishedDeals } from "@/lib/deals/store";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();

  const staticPaths: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
  }> = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/products", priority: 0.95, changeFrequency: "daily" },
    { path: "/vip", priority: 0.95, changeFrequency: "daily" },
    { path: "/ai-finder", priority: 0.9, changeFrequency: "weekly" },
    { path: "/compare", priority: 0.9, changeFrequency: "weekly" },
    { path: "/vault", priority: 0.9, changeFrequency: "daily" },
    { path: "/deals", priority: 0.9, changeFrequency: "daily" },
    { path: "/news", priority: 0.9, changeFrequency: "daily" },
    { path: "/news/nepal", priority: 0.9, changeFrequency: "daily" },
    { path: "/news/ai", priority: 0.9, changeFrequency: "daily" },
    { path: "/resources", priority: 0.85, changeFrequency: "weekly" },
    { path: "/elite", priority: 0.85, changeFrequency: "weekly" },
    { path: "/prompts", priority: 0.9, changeFrequency: "daily" },
    { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
    { path: "/ai-tools-nepal", priority: 0.9, changeFrequency: "weekly" },
    { path: "/digital-tools-nepal", priority: 0.85, changeFrequency: "weekly" },
    { path: "/creator-tools-nepal", priority: 0.85, changeFrequency: "weekly" },
    { path: "/student-tools-nepal", priority: 0.8, changeFrequency: "weekly" },
    { path: "/business-ai-setup", priority: 0.8, changeFrequency: "weekly" },
    { path: "/automation-services", priority: 0.8, changeFrequency: "weekly" },
    { path: "/skills", priority: 0.85, changeFrequency: "weekly" },
    { path: "/nepal", priority: 0.9, changeFrequency: "daily" },
    { path: "/nepal/datasets", priority: 0.85, changeFrequency: "weekly" },
    { path: "/map", priority: 0.85, changeFrequency: "weekly" },
    { path: "/vault/research", priority: 0.85, changeFrequency: "weekly" },
    { path: "/guides", priority: 0.85, changeFrequency: "weekly" },
    { path: "/categories", priority: 0.75, changeFrequency: "weekly" },
    { path: "/categories/ai-tools", priority: 0.75, changeFrequency: "weekly" },
    { path: "/categories/design", priority: 0.7, changeFrequency: "weekly" },
    {
      path: "/categories/video-editing",
      priority: 0.75,
      changeFrequency: "weekly",
    },
    {
      path: "/categories/developer-tools",
      priority: 0.75,
      changeFrequency: "weekly",
    },
    { path: "/categories/learning", priority: 0.7, changeFrequency: "weekly" },
    {
      path: "/categories/productivity",
      priority: 0.7,
      changeFrequency: "weekly",
    },
    { path: "/categories/services", priority: 0.7, changeFrequency: "weekly" },
    { path: "/how-it-works", priority: 0.75, changeFrequency: "monthly" },
    {
      path: "/pricing-transparency",
      priority: 0.7,
      changeFrequency: "monthly",
    },
    { path: "/verified-supply", priority: 0.65, changeFrequency: "monthly" },
    { path: "/acceptable-use", priority: 0.45, changeFrequency: "yearly" },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/track-order", priority: 0.6, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/warranty-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/delivery-policy", priority: 0.3, changeFrequency: "yearly" },
    {
      path: "/business-disclosures",
      priority: 0.4,
      changeFrequency: "yearly",
    },
  ];

  const seenUrls = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  for (const item of staticPaths) {
    const url = `${origin}${item.path || "/"}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
      });
    }
  }

  for (const post of getAllBlogPosts()) {
    const url = `${origin}/blog/${post.slug}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  for (const prompt of getAllPrompts()) {
    const url = `${origin}/prompts/${prompt.slug}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        lastModified: new Date(prompt.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  for (const skill of getAllSkills()) {
    const url = `${origin}/skills/${skill.slug}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        lastModified: new Date(skill.updatedAt),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  for (const guide of getAllGuides()) {
    const url = `${origin}/guides/${guide.slug}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        lastModified: new Date(guide.publishedAt),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  for (const research of getAllResearchItems()) {
    const url = `${origin}/vault/research/${research.slug}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        lastModified: new Date(research.lastAuditedAt),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  for (const article of getAllNews()) {
    const url = `${origin}/news/${article.slug}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        lastModified: new Date(article.publishedAt),
        changeFrequency: "daily",
        priority: 0.85,
      });
    }
  }

  for (const res of getAllResources()) {
    const url = `${origin}/resources/${res.slug}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        lastModified: new Date(res.lastAuditedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  for (const deal of getPublishedDeals()) {
    const url = `${origin}/deals/${deal.slug}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        lastModified: new Date(deal.updatedAt),
        changeFrequency: "daily",
        priority: 0.85,
      });
    }
  }

  try {
    const products = await getLiveMerchandisingCatalogue();
    for (const p of products) {
      if (p.visibility === "BLOCKED") continue;
      if (isInternalOrTestSku(p.slug) || isInternalOrTestSku(p.variantSku)) continue;
      const url = `${origin}/products/${p.slug}`;
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        entries.push({
          url,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: p.purchasable ? 0.9 : 0.7,
        });
      }
    }
  } catch {
    // static + blog routes still publish
  }

  return entries;
}
