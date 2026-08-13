import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

const rows = await sql`
  SELECT p.slug, p.name, p.product_status, p.compliance_status, p.featured,
         v.purchasable, v.manual_selling_price_npr_minor as price,
         v.seed_visible_quantity as stock
  FROM products p
  LEFT JOIN product_variants v ON v.product_id = p.id AND v.active = true
  WHERE p.product_status <> 'ARCHIVED'
  ORDER BY p.product_status, p.name
`;

const by = {};
for (const r of rows) {
  (by[r.product_status] ||= []).push(r);
}

for (const status of Object.keys(by).sort()) {
  console.log(`\n=== ${status} (${by[status].length}) ===`);
  for (const r of by[status]) {
    const price =
      r.price != null ? `Rs.${Math.round(Number(r.price) / 100)}` : "no-price";
    console.log(
      [
        r.slug,
        r.name,
        `buy=${r.purchasable}`,
        price,
        `stock=${r.stock}`,
        r.compliance_status,
      ].join(" | "),
    );
  }
}

const publicBuy = rows.filter(
  (r) => r.product_status === "PUBLIC" && r.purchasable,
);
const publicNoBuy = rows.filter(
  (r) => r.product_status === "PUBLIC" && !r.purchasable,
);
const draft = rows.filter((r) => r.product_status === "DRAFT");
const blocked = rows.filter((r) => r.product_status === "BLOCKED");

console.log("\n=== SUMMARY ===");
console.log(`PUBLIC + Buy Now: ${publicBuy.length}`);
console.log(`PUBLIC but Check Availability only: ${publicNoBuy.length}`);
console.log(`DRAFT / Under Review: ${draft.length}`);
console.log(`BLOCKED: ${blocked.length}`);
console.log(`Total non-archived: ${rows.length}`);

await sql.end({ timeout: 5 });
