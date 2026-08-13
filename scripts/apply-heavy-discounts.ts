/**
 * Set compare-at (list) prices so storefront shows ~70–90% off.
 * Sell prices are NEVER changed.
 *
 * Usage: npx tsx scripts/apply-heavy-discounts.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";

/** Target discount fraction per slug (0.70–0.90). Default 0.80. */
const TARGET: Record<string, number> = {
  "gemini-pro-18-months-link": 0.85,
  "gemini-pro-cdk-12-months": 0.82,
  "gemini-ai-pro-5tb-12m-mail-a": 0.78,
  "chatgpt-plus-1-month-fw": 0.8,
  "capcut-pro-7-days": 0.85,
  "capcut-pro-30-days": 0.82,
  "capcut-pro-6-months": 0.75,
  "canva-pro-1-year": 0.78,
  "grammarly-pro-1-year": 0.8,
  "coursera-premium-1-year": 0.75,
  "ai-prompt-starter-pack": 0.7,
  "small-business-ai-setup-consultation": 0.72,
  "custom-workflow-automation-discovery": 0.72,
  "grok-super-3-months": 0.78,
  "grok-super-10-months": 0.75,
  "claude-pro-1-month": 0.7,
  "elevenlabs-1-month": 0.8,
  "kling-standard-680-750-credits": 0.82,
  "kling-ultra-26k-credits": 0.75,
  "adobe-cc-2-months": 0.8,
  "canva-edu-1-year": 0.85,
  "figma-edu-2-years": 0.8,
  "office365-100gb-lifetime": 0.88,
  "office365-1tb-lifetime": 0.88,
  "microsoft-365-family-10-months": 0.78,
  "notion-business-3-months": 0.82,
  "youtube-premium-1-year": 0.72,
  "cursor-pro-1-month": 0.75,
};

function roundNiceNpr(n: number): number {
  if (n < 100) return Math.max(99, Math.ceil(n / 10) * 10 - 1);
  if (n < 1000) return Math.ceil(n / 50) * 50 - 1; // e.g. 999, 1499
  if (n < 5000) return Math.ceil(n / 100) * 100 - 1;
  if (n < 20000) return Math.ceil(n / 500) * 500 - 1;
  return Math.ceil(n / 1000) * 1000 - 1;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) throw new Error("DATABASE_URL required");
  const sql = postgres(dbUrl, { prepare: false, max: 1 });

  const rows = await sql`
    select p.slug, p.name,
           v.id as variant_id,
           v.manual_selling_price_npr_minor as sell_minor,
           v.compare_at_price_npr_minor as compare_minor
    from products p
    join product_variants v on v.product_id = p.id
    where p.product_status <> 'ARCHIVED'
      and v.manual_selling_price_npr_minor is not null
      and v.manual_selling_price_npr_minor > 0
    order by p.name
  `;

  console.log("slug | sell | old_list | new_list | discount%");
  for (const r of rows) {
    const sellMinor = Number(r.sell_minor);
    const sell = sellMinor / 100;
    const frac = TARGET[r.slug as string] ?? 0.8;
    // list = sell / (1 - discount)
    const rawList = sell / (1 - frac);
    const list = roundNiceNpr(rawList);
    const listMinor = Math.round(list * 100);
    if (listMinor <= sellMinor) {
      console.warn("SKIP too low", r.slug, sell, list);
      continue;
    }
    const pct = Math.round(((list - sell) / list) * 100);
    await sql`
      update product_variants
      set compare_at_price_npr_minor = ${listMinor},
          updated_at = now()
      where id = ${r.variant_id as string}
    `;
    const oldList =
      r.compare_minor != null ? Math.round(Number(r.compare_minor) / 100) : "—";
    console.log(
      `${r.slug} | Rs.${sell} | Rs.${oldList} → Rs.${list} | −${pct}%`,
    );
  }

  await sql.end();
  console.log("DONE — sell prices untouched");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
