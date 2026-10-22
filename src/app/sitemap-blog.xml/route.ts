import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getAllBlogPosts } from "@/lib/seo/blog-posts";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = getSiteUrl();
  const posts = getAllBlogPosts();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${posts
  .map(
    (post) => `  <url>
    <loc>${origin}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
