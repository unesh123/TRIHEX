import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import { getAllBlogPosts } from "@/lib/seo/blog-posts";
import { isInternalOrTestSku } from "@/lib/commerce/catalogue-lint";
import { getAllPrompts } from "@/lib/prompts/store";
import { getAllSkills } from "@/lib/skills/store";
import { getAllGuides } from "@/lib/guides/guide-registry";
import { getAllResearchItems } from "@/lib/vault/research-registry";

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
    { path: "/ai-finder", priority: 0.9, changeFrequency: "weekly" },
    { path: "/compare", priority: 0.9, changeFrequency: "weekly" },
    { path: "/vault", priority: 0.85, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
    { path: "/ai-tools-nepal", priority: 0.9, changeFrequency: "weekly" },
    { path: "/digital-tools-nepal", priority: 0.85, changeFrequency: "weekly" },
    { path: "/creator-tools-nepal", priority: 0.85, changeFrequency: "weekly" },
    { path: "/student-tools-nepal", priority: 0.8, changeFrequency: "weekly" },
    { path: "/business-ai-setup", priority: 0.8, changeFrequency: "weekly" },
    { path: "/automation-services", priority: 0.8, changeFrequency: "weekly" },
    { path: "/deals", priority: 0.9, changeFrequency: "daily" },
    { path: "/prompts", priority: 0.9, changeFrequency: "daily" },
    { path: "/skills", priority: 0.85, changeFrequency: "weekly" },
    { path: "/nepal", priority: 0.9, changeFrequency: "daily" },
    { path: "/nepal/datasets", priority: 0.85, changeFrequency: "weekly" },
    { path: "/map", priority: 0.85, changeFrequency: "weekly" },
    { path: "/vault/research", priority: 0.85, changeFrequency: "weekly" },
    { path: "/guides", priority: 0.85, changeFrequency: "weekly" },
    { path: "/categories", priority: 0.75, changeFrequency: "weekly" },
    { path: "/categories/design", priority: 0.7, changeFrequency: "weekly" },
    {
      path: "/categories/video-editing",
      priority: 0.7,
      changeFrequency: "weekly",
    },
    {
      path: "/categories/developer-tools",
      priority: 0.7,
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

  const entries: MetadataRoute.Sitemap = staticPaths.map((item) => ({
    url: `${origin}${item.path || "/"}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  for (const post of getAllBlogPosts()) {
    entries.push({
      url: `${origin}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.85,
    });
  }

  for (const prompt of getAllPrompts()) {
    entries.push({
      url: `${origin}/prompts/${prompt.slug}`,
      lastModified: new Date(prompt.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const skill of getAllSkills()) {
    entries.push({
      url: `${origin}/skills/${skill.slug}`,
      lastModified: new Date(skill.updatedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const guide of getAllGuides()) {
    entries.push({
      url: `${origin}/guides/${guide.slug}`,
      lastModified: new Date(guide.publishedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const research of getAllResearchItems()) {
    entries.push({
      url: `${origin}/vault/research/${research.slug}`,
      lastModified: new Date(research.lastAuditedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  try {
    const products = await getLiveMerchandisingCatalogue();
    for (const p of products) {
      if (p.visibility === "BLOCKED") continue;
      if (isInternalOrTestSku(p.slug) || isInternalOrTestSku(p.variantSku)) continue;
      entries.push({
        url: `${origin}/products/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: p.purchasable ? 0.85 : 0.65,
      });
    }
  } catch {
    // static + blog routes still publish
  }

  return entries;
}
