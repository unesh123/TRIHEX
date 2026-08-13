import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

const slugs = [
  "claude-max-x20-1-month",
  "grok-super-12-months",
  "nordvpn-3-months",
  "adobe-cc-4-months",
  "apple-music-6-months",
];

for (const slug of slugs) {
  const p = await sql`
    SELECT id, slug, name, product_status FROM products WHERE slug = ${slug}
  `;
  console.log("\nPRODUCT", p);
  if (!p[0]) continue;
  const v = await sql`
    SELECT id, sku, active, purchasable, manual_selling_price_npr_minor,
           supplier_cost_usd_minor, seed_visible_quantity, pricing_mode
    FROM product_variants WHERE product_id = ${p[0].id}
  `;
  console.log("VARIANTS", v);
}

// Also check if aliases still exist as separate products
const aliases = await sql`
  SELECT slug, product_status FROM products
  WHERE slug IN (
    'claude-x20-w30d', 'super-grok-12-months', 'nordvpn-mail-3-months',
    'nordvpn-shared-3-months', 'grok-super-1-year-fww'
  )
`;
console.log("\nALIASES", aliases);

await sql.end({ timeout: 5 });
