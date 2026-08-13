/**
 * Seed compare-at (list) prices + copy PACKAGE_FEATURES into long_description
 * so customers see struck-through original vs TRIHEX discounted sell price.
 *
 * Usage: npx tsx scripts/apply-compare-at-and-features.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";
import { PACKAGE_FEATURES } from "../src/lib/catalog/package-features";

/** List / package price NPR (major). Only applied when > current sell. */
/** @deprecated Prefer scripts/apply-heavy-discounts.ts (70–90% off from live sell). */
const COMPARE_AT: Record<string, number> = {
  "gemini-pro-18-months-link": 999,
  "gemini-pro-cdk-12-months": 899,
  "gemini-ai-pro-5tb-12m-mail-a": 1999,
  "chatgpt-plus-1-month-fw": 1499,
  "capcut-pro-7-days": 149,
  "capcut-pro-30-days": 799,
  "capcut-pro-6-months": 5999,
  "canva-pro-1-year": 2999,
  "grammarly-pro-1-year": 2999,
  "coursera-premium-1-year": 3999,
  "ai-prompt-starter-pack": 499,
  "small-business-ai-setup-consultation": 2499,
  "custom-workflow-automation-discovery": 3499,
  "grok-super-3-months": 3499,
  "grok-super-10-months": 8999,
  "claude-pro-1-month": 24999,
  "elevenlabs-1-month": 2499,
  "kling-standard-680-750-credits": 1999,
  "kling-ultra-26k-credits": 19999,
  "adobe-cc-2-months": 1999,
  "canva-edu-1-year": 299,
  "figma-edu-2-years": 2499,
  "office365-100gb-lifetime": 499,
  "office365-1tb-lifetime": 799,
  "microsoft-365-family-10-months": 2999,
  "notion-business-3-months": 999,
  "youtube-premium-1-year": 7999,
  "cursor-pro-1-month": 4999,
};

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) throw new Error("DATABASE_URL required");
  const sql = postgres(dbUrl, { prepare: false, max: 1 });

  const products = await sql`
    select p.id, p.slug, p.long_description,
           v.id as variant_id, v.manual_selling_price_npr_minor as price
    from products p
    join product_variants v on v.product_id = p.id
    where p.product_status <> 'ARCHIVED'
  `;

  let compareUpdated = 0;
  let featuresUpdated = 0;

  for (const p of products) {
    const slug = p.slug as string;
    const list = COMPARE_AT[slug];
    if (list != null) {
      const compareMinor = Math.round(list * 100);
      const sell = Number(p.price ?? 0);
      if (compareMinor > sell) {
        await sql`
          update product_variants
          set compare_at_price_npr_minor = ${compareMinor},
              updated_at = now()
          where id = ${p.variant_id as string}
        `;
        compareUpdated++;
        console.log("COMPARE", slug, list, "→ sell", Math.round(sell / 100));
      }
    }

    const feats = PACKAGE_FEATURES[slug];
    if (feats?.length && !String(p.long_description ?? "").trim()) {
      await sql`
        update products
        set long_description = ${feats.join("\n")},
            updated_at = now()
        where id = ${p.id as string}
      `;
      featuresUpdated++;
      console.log("FEATURES", slug, feats.length);
    }
  }

  await sql.end();
  console.log({ compareUpdated, featuresUpdated });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
