import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getAllNews } from "@/lib/news/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = getSiteUrl();
  const news = getAllNews();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/news</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/news/nepal</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/news/ai</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${news
  .map(
    (n) => `  <url>
    <loc>${origin}/news/${n.slug}</loc>
    <lastmod>${new Date(n.publishedAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
