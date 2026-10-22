import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/orders/",
          "/checkout/success",
          "/control-vault-9702/",
          "/vault-k9702-x8f2a9c1e4d7/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/orders/",
          "/control-vault-9702/",
          "/vault-k9702-x8f2a9c1e4d7/",
        ],
      },
    ],
    sitemap: [
      `${origin}/sitemap.xml`,
      `${origin}/sitemap-products.xml`,
      `${origin}/sitemap-blog.xml`,
      `${origin}/sitemap-news.xml`,
      `${origin}/sitemap-prompts.xml`,
      `${origin}/sitemap-resources.xml`,
      `${origin}/sitemap-vault.xml`,
      `${origin}/sitemap-index.xml`,
    ],
    host: origin,
  };
}
