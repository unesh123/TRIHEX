import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl();
  const commonDisallows = [
    "/admin/",
    "/api/",
    "/account/",
    "/orders/",
    "/checkout/success",
    "/control-vault-9702/",
    "/vault-k9702-x8f2a9c1e4d7/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: commonDisallows,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: commonDisallows,
      },
      // Google Gemini & Vertex AI indexing agent
      {
        userAgent: "Google-Extended",
        allow: ["/", "/products", "/blog", "/deals", "/academy", "/llms.txt", "/llms-full.txt"],
        disallow: commonDisallows,
      },
      // OpenAI ChatGPT / SearchGPT Web Crawler
      {
        userAgent: "GPTBot",
        allow: ["/", "/products", "/blog", "/deals", "/academy", "/llms.txt", "/llms-full.txt"],
        disallow: commonDisallows,
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/products", "/blog", "/deals", "/academy", "/llms.txt", "/llms-full.txt"],
        disallow: commonDisallows,
      },
      // Anthropic Claude Crawler
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/products", "/blog", "/deals", "/academy", "/llms.txt", "/llms-full.txt"],
        disallow: commonDisallows,
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/products", "/blog", "/deals", "/academy", "/llms.txt", "/llms-full.txt"],
        disallow: commonDisallows,
      },
      // Perplexity AI Search Crawler
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/products", "/blog", "/deals", "/academy", "/llms.txt", "/llms-full.txt"],
        disallow: commonDisallows,
      },
      // Apple Intelligence Crawler
      {
        userAgent: "Applebot-Extended",
        allow: ["/", "/products", "/blog", "/deals", "/academy", "/llms.txt", "/llms-full.txt"],
        disallow: commonDisallows,
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
