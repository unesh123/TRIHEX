import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
const id = "1127e9ab-9ec3-468b-b261-5fbbc3a755ca";

await sql`
  UPDATE products
  SET slug = 'grok-super-6-months', updated_at = now()
  WHERE id = ${id}
`;
console.log("Renamed bad Grok product → grok-super-6-months");

const typo = await sql`
  SELECT id, slug FROM products WHERE slug = 'super-grok-6-moths-plan'
`;
if (typo.length) {
  await sql`
    UPDATE products
    SET product_status = 'ARCHIVED', updated_at = now()
    WHERE id = ${typo[0].id}
  `;
  console.log("ARCHIVED", typo[0].slug);
}

const rows = await sql`
  SELECT slug, name, product_status
  FROM products
  WHERE lower(slug) LIKE '%grok%' OR lower(name) LIKE '%grok%'
  ORDER BY slug
`;
console.log(rows);
await sql.end({ timeout: 5 });
