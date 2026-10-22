import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = getSiteUrl();
  const now = new Date().toISOString();

  const sitemaps = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap-products.xml`,
    `${origin}/sitemap-blog.xml`,
    `${origin}/sitemap-news.xml`,
    `${origin}/sitemap-prompts.xml`,
    `${origin}/sitemap-resources.xml`,
    `${origin}/sitemap-vault.xml`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (url) => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
