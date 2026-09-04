import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getAllResources } from "@/lib/resources/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = getSiteUrl();
  const resources = getAllResources();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/resources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${resources
  .map(
    (r) => `  <url>
    <loc>${origin}/resources/${r.slug}</loc>
    <lastmod>${new Date(r.lastAuditedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
