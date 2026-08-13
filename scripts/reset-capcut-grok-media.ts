/**
 * Clear stale product_media rows for CapCut/Grok so storefront uses corrected covers.
 * Then upsert correct /media/covers paths into product_media.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";

const FIXES: Array<{ slug: string; url: string; alt: string }> = [
  {
    slug: "capcut-pro-7-days",
    url: "/media/covers/capcut/capcut-pro-7-days.webp",
    alt: "CapCut Pro seven-day video editing cover artwork.",
  },
  {
    slug: "capcut-pro-30-days",
    url: "/media/covers/capcut/capcut-pro-30-days.webp",
    alt: "CapCut Pro thirty-day video editing cover artwork.",
  },
  {
    slug: "capcut-pro-6-months",
    url: "/media/covers/capcut/capcut-pro-6-months.webp",
    alt: "CapCut Pro six-month video editing cover artwork.",
  },
  {
    slug: "grok-super-3-months",
    url: "/media/covers/grok/grok-super-3-months.webp",
    alt: "Grok Super three-month package artwork.",
  },
];

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL required");
  const sql = postgres(url, { prepare: false, max: 1 });

  for (const fix of FIXES) {
    const products = await sql`
      select id from products where slug = ${fix.slug} limit 1
    `;
    if (!products[0]) {
      console.log("SKIP_NO_PRODUCT", fix.slug);
      continue;
    }
    const productId = products[0].id as string;
    await sql`delete from product_media where product_id = ${productId}`;
    await sql`
      insert into product_media (product_id, url, alt_text, sort_order, is_primary)
      values (${productId}, ${fix.url}, ${fix.alt}, 0, true)
    `;
    console.log("MEDIA_RESET", fix.slug, fix.url);
  }

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
