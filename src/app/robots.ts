import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/orders/", "/checkout/success"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/orders/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
