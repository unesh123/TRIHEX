import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/live-merchandising";
import { isInternalOrTestSku } from "@/lib/commerce/catalogue-lint";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = getSiteUrl();
  const products = await getLiveMerchandisingCatalogue();
  const now = new Date().toISOString();

  const validProducts = products.filter(
    (p) =>
      p.visibility !== "BLOCKED" &&
      !isInternalOrTestSku(p.slug) &&
      !isInternalOrTestSku(p.variantSku)
  );

  const seen = new Set<string>();
  const uniqueProducts = validProducts.filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/products</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${uniqueProducts
  .map(
    (p) => `  <url>
    <loc>${origin}/products/${p.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${p.purchasable ? "0.95" : "0.75"}</priority>
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
