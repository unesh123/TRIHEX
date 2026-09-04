import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import { isInternalOrTestSku } from "@/lib/commerce/catalogue-lint";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = getSiteUrl();
  const products = await getLiveMerchandisingCatalogue();

  const validProducts = products.filter(
    (p) =>
      p.visibility !== "BLOCKED" &&
      !isInternalOrTestSku(p.slug) &&
      !isInternalOrTestSku(p.variantSku)
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/products</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${validProducts
  .map(
    (p) => `  <url>
    <loc>${origin}/products/${p.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>${p.purchasable ? "0.9" : "0.7"}</priority>
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
