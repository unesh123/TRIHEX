import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

const fixes = [
  {
    slug: "claude-max-x20-1-month",
    sell: 27600,
    costUsd: 115,
    stock: null,
    purchasable: true,
  },
  {
    slug: "grok-super-12-months",
    sell: 5280,
    costUsd: 22,
    stock: 3,
    purchasable: true,
  },
  {
    slug: "nordvpn-3-months",
    sell: 799,
    costUsd: 2,
    stock: 0,
    purchasable: false,
  },
];

for (const f of fixes) {
  const p = await sql`SELECT id FROM products WHERE slug = ${f.slug} LIMIT 1`;
  if (!p[0]) {
    console.log("MISSING", f.slug);
    continue;
  }
  await sql`
    UPDATE product_variants SET
      active = true,
      purchasable = ${f.purchasable},
      manual_selling_price_npr_minor = ${f.sell * 100},
      supplier_cost_usd_minor = ${Math.round(f.costUsd * 100)},
      supplier_cost_minor = ${Math.round(f.costUsd * 100)},
      pricing_mode = 'MANUAL_ONLY',
      seed_visible_quantity = ${f.stock},
      fx_rate_snapshot = ${160 * 100},
      updated_at = now()
    WHERE product_id = ${p[0].id}
  `;
  console.log("FIXED", f.slug, `sell=${f.sell}`, `buy=${f.purchasable}`);
}

await sql.end({ timeout: 5 });
