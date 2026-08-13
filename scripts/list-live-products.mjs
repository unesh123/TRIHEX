import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  prepare: false,
  max: 1,
});
const rows = await sql`
  SELECT p.slug, p.name, b.slug as brand,
         v.duration_value, v.duration_unit
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN LATERAL (
    SELECT duration_value, duration_unit
    FROM product_variants
    WHERE product_id = p.id AND active = true
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 1
  ) v ON true
  WHERE p.product_status IN ('PUBLIC', 'DRAFT')
  ORDER BY b.slug, p.name
`;
for (const r of rows) {
  console.log(
    [r.brand, r.slug, r.name, r.duration_value, r.duration_unit].join("\t"),
  );
}
await sql.end({ timeout: 5 });
