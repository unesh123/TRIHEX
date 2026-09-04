import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getPublishedDeals } from "@/lib/deals/store";
import { getAllResearchItems } from "@/lib/vault/research-registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = getSiteUrl();
  const deals = getPublishedDeals();
  const research = getAllResearchItems();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/vault</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/deals</loc>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${origin}/vault/research</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${origin}/elite</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
${deals
  .map(
    (d) => `  <url>
    <loc>${origin}/deals/${d.slug}</loc>
    <lastmod>${new Date(d.updatedAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`
  )
  .join("\n")}
${research
  .map(
    (r) => `  <url>
    <loc>${origin}/vault/research/${r.slug}</loc>
    <lastmod>${new Date(r.lastAuditedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
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
