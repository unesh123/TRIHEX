/**
 * Real PostgreSQL concurrency: one stock unit, two connections, one wins.
 * Never prints connection strings.
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

  const a = postgres(url, { max: 1, prepare: false });
  const b = postgres(url, { max: 1, prepare: false });

  try {
    // Isolate a disposable variant
    const brand = await a`
      insert into brands (name, slug, is_own_brand)
      values ('Concurrency Test Brand', 'concurrency-test-brand', true)
      on conflict (slug) do update set name = excluded.name
      returning id`;
    const product = await a`
      insert into products (
        brand_id, name, slug, short_description, product_type, fulfillment_type,
        product_status, compliance_status, supply_authorization_type, vendor_proof_status
      ) values (
        ${brand[0].id},
        'Concurrency Test Product',
        'concurrency-test-product',
        'Isolated concurrency test',
        'OWNED_ASSET',
        'DOWNLOADABLE_OWNED_ASSET',
        'PUBLIC',
        'APPROVED',
        'OWN_DIGITAL_PRODUCT',
        'VERIFIED'
      )
      on conflict (slug) do update set name = excluded.name
      returning id`;

    const variant = await a`
      insert into product_variants (
        product_id, sku, variant_name, duration_value, duration_unit,
        supplier_currency, supplier_cost_minor, supplier_cost_usd_minor,
        manual_selling_price_npr_minor, pricing_mode, active, purchasable
      ) values (
        ${product[0].id},
        'THX-CONCURRENCY-001',
        'Test',
        1,
        'ONE_TIME',
        'USD',
        0,
        0,
        10000,
        'MANUAL_ONLY',
        true,
        true
      )
      on conflict (sku) do update set purchasable = true
      returning id`;

    const variantId = variant[0].id as string;

    // Reset stock to exactly 1 available
    await a`delete from stock_reservations where variant_id = ${variantId}`;
    await a`delete from inventory_movements where variant_id = ${variantId}`;
    await a`delete from inventory_lots where variant_id = ${variantId}`;
    await a`
      insert into inventory_lots (
        variant_id, quantity_received, quantity_available, quantity_reserved,
        quantity_sold, unit_cost_minor, cost_currency, status
      ) values (
        ${variantId}, 1, 1, 0, 0, 0, 'NPR', 'ACTIVE'
      )`;

    const keyA = `concurrency-a-${Date.now()}`;
    const keyB = `concurrency-b-${Date.now()}`;

    const [ra, rb] = await Promise.allSettled([
      a`select reserve_stock(${variantId}::uuid, 1, null, null, 30, null, ${keyA}) as id`,
      b`select reserve_stock(${variantId}::uuid, 1, null, null, 30, null, ${keyB}) as id`,
    ]);

    const success = [ra, rb].filter((r) => r.status === "fulfilled").length;
    const failed = [ra, rb].filter((r) => r.status === "rejected").length;

    const avail = await a`
      select coalesce(sum(quantity_available),0)::int as available,
             coalesce(sum(quantity_reserved),0)::int as reserved
      from inventory_lots where variant_id = ${variantId}`;
    const activeRes = await a`
      select count(*)::int as n from stock_reservations
      where variant_id = ${variantId} and status = 'ACTIVE'`;

    console.log("CONCURRENCY_SUCCESS", success);
    console.log("CONCURRENCY_REJECTED", failed);
    console.log("AVAILABLE", avail[0].available);
    console.log("RESERVED", avail[0].reserved);
    console.log("ACTIVE_RESERVATIONS", activeRes[0].n);

    const ok =
      success === 1 &&
      failed === 1 &&
      avail[0].available === 0 &&
      avail[0].reserved === 1 &&
      activeRes[0].n === 1;

    console.log("CONCURRENCY_RESULT", ok ? "PASS" : "FAIL");
    if (!ok) process.exit(1);
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message.replace(/postgres(ql)?:\/\/[^\s]+/gi, "[REDACTED]")
        : "unknown";
    console.error("CONCURRENCY_ERROR", msg);
    process.exit(1);
  } finally {
    await a.end({ timeout: 5 });
    await b.end({ timeout: 5 });
  }
}

main();
