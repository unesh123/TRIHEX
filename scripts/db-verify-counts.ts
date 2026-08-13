/**
 * Post-seed verification counts. Never prints secrets.
 */
import { config } from "dotenv";
import postgres from "postgres";
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";

config({ path: ".env.local" });
normalizeEnvAliases();

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL MISSING");
    process.exit(1);
  }
  const sql = postgres(url, { max: 1, prepare: false });
  try {
    const tableCount = await sql`
      select count(*)::int as n from information_schema.tables
      where table_schema='public' and table_type='BASE TABLE'`;
    console.log("PUBLIC_TABLE_COUNT", tableCount[0].n);

    const funcs = await sql`
      select routine_name from information_schema.routines
      where routine_schema='public' and routine_type='FUNCTION'
      and routine_name in ('reserve_stock','convert_reservation_to_sale','release_reservation')
      order by routine_name`;
    console.log(
      "INVENTORY_FUNCS",
      funcs.map((r) => r.routine_name).join(",") || "(none)",
    );

    const counts = await sql`
      select
        (select count(*)::int from products) as products,
        (select count(*)::int from product_variants) as variants,
        (select count(*)::int from products p
           join brands b on b.id = p.brand_id where b.is_own_brand = true) as own_products,
        (select count(*)::int from products p
           left join brands b on b.id = p.brand_id
           where coalesce(b.is_own_brand, false) = false) as screenshot_or_third_party,
        (select count(*)::int from products where product_status = 'PUBLIC') as public_products,
        (select count(*)::int from products where product_status = 'DRAFT') as draft_products,
        (select count(*)::int from products where product_status = 'BLOCKED') as blocked_products,
        (select count(*)::int from categories) as categories,
        (select count(*)::int from brands) as brands,
        (select count(*)::int from inventory_lots) as inventory_lots,
        (select count(*)::int from (
          select sku from product_variants group by sku having count(*) > 1
        ) d) as duplicate_skus,
        (select count(*)::int from (
          select slug from products group by slug having count(*) > 1
        ) d) as duplicate_slugs,
        (select count(*)::int from product_variants
          where supplier_cost_minor is null) as missing_costs,
        (select count(*)::int from product_variants
          where purchasable = true
            and manual_selling_price_npr_minor is null
            and computed_selling_price_npr_minor is null) as purchasable_missing_prices
    `;
    for (const [k, v] of Object.entries(counts[0])) {
      console.log("COUNT", k, v);
    }

    const gemini = await sql`
      select p.slug, p.product_status, p.compliance_status, v.sku,
             v.purchasable,
             v.supplier_cost_usd_minor, v.supplier_currency,
             v.fx_rate_snapshot,
             v.manual_selling_price_npr_minor, v.pricing_mode
      from products p
      join product_variants v on v.product_id = p.id
      where p.slug = 'gemini-pro-upgrade-link-18-months'
      limit 1
    `;
    if (gemini.length === 0) {
      console.log("GEMINI_RECORD MISSING");
    } else {
      const g = gemini[0];
      const fx = Number(g.fx_rate_snapshot ?? 0);
      const costUsd = Number(g.supplier_cost_usd_minor ?? 0);
      const converted =
        fx > 0 ? Math.round((costUsd * fx) / 100) : null; // USD minor × NPR-minor-per-USD / 100
      console.log("GEMINI_SLUG", g.slug);
      console.log("GEMINI_PRODUCT_STATUS", g.product_status);
      console.log("GEMINI_COMPLIANCE", g.compliance_status);
      console.log("GEMINI_PURCHASABLE", g.purchasable);
      console.log("GEMINI_SUPPLIER_COST_USD_MINOR", g.supplier_cost_usd_minor);
      console.log("GEMINI_FX_SNAPSHOT", g.fx_rate_snapshot);
      console.log("GEMINI_CONVERTED_NPR_MINOR_CALC", converted);
      console.log("GEMINI_MANUAL_PRICE_NPR_MINOR", g.manual_selling_price_npr_minor);
      console.log("GEMINI_PRICING_MODE", g.pricing_mode);
      console.log(
        "GEMINI_GROSS_NPR_MINOR",
        g.manual_selling_price_npr_minor != null && converted != null
          ? Number(g.manual_selling_price_npr_minor) - converted
          : null,
      );
    }
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message.replace(/postgres(ql)?:\/\/[^\s]+/gi, "[REDACTED]")
        : "unknown";
    console.error("VERIFY_ERROR", msg);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
