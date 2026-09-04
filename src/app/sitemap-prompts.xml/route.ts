import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getAllPrompts } from "@/lib/prompts/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = getSiteUrl();
  const prompts = getAllPrompts();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/prompts</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${prompts
  .map(
    (p) => `  <url>
    <loc>${origin}/prompts/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.isOriginalTrihex ? "0.9" : "0.75"}</priority>
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
