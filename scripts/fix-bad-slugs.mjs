import postgres from "postgres";

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url || url === "[SENSITIVE]") {
  console.error("No real DATABASE_URL");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });

const grok = await sql`
  SELECT id, slug, name, product_status
  FROM products
  WHERE lower(slug) LIKE '%grok%' OR lower(name) LIKE '%grok%'
  ORDER BY slug
`;
console.log("GROK PRODUCTS:");
for (const row of grok) console.log(`- [${row.product_status}] ${JSON.stringify(row.slug)} | ${row.name}`);

const bad = await sql`
  SELECT id, slug, name, product_status
  FROM products
  WHERE slug ~ '[^a-z0-9-]'
     OR position(' ' in slug) > 0
`;
console.log("\nBAD SLUGS:");
for (const row of bad) {
  const fixed = slugify(row.slug) || slugify(row.name);
  console.log(`- ${JSON.stringify(row.slug)} → ${fixed}`);
}

const apply = process.argv.includes("--apply");
if (apply && bad.length) {
  for (const row of bad) {
    let fixed = slugify(row.slug) || slugify(row.name);
    if (!fixed) continue;

    const exists = await sql`
      SELECT id FROM products WHERE slug = ${fixed} AND id <> ${row.id} LIMIT 1
    `;
    if (exists.length) {
      // Prefer archiving duplicate junk if a clean sibling already exists
      if (fixed.includes("grok") && fixed.includes("6-month")) {
        await sql`
          UPDATE products
          SET product_status = 'ARCHIVED', updated_at = now()
          WHERE id = ${row.id}
        `;
        console.log(`ARCHIVED duplicate ${row.id}: ${JSON.stringify(row.slug)}`);
        continue;
      }
      fixed = `${fixed}-fix`;
    }

    await sql`
      UPDATE products SET slug = ${fixed}, updated_at = now() WHERE id = ${row.id}
    `;
    console.log(`UPDATED ${row.id}: ${JSON.stringify(row.slug)} → ${fixed}`);
  }
} else if (bad.length) {
  console.log("\nDry run only. Re-run with --apply to update.");
}

await sql.end({ timeout: 5 });
