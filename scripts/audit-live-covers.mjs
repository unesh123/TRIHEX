/**
 * Audit which live products still use generic / missing covers.
 * Usage: node --env-file=.env.local scripts/audit-live-covers.mjs
 */
import postgres from "postgres";
import fs from "fs";
import path from "path";

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  ssl: "require",
  max: 1,
});

const rows = await sql`
  SELECT
    p.id,
    p.slug,
    p.name,
    b.slug AS brand_slug,
    p.product_status,
    (
      SELECT pm.url
      FROM product_media pm
      WHERE pm.product_id = p.id
      ORDER BY pm.is_primary DESC, pm.sort_order ASC
      LIMIT 1
    ) AS cover
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  WHERE p.product_status IN ('PUBLIC', 'DRAFT')
  ORDER BY b.slug, p.name
`;

const GENERIC_HINTS = [
  "generated-real-product-poster",
  "abstract",
  "designer-master",
  "circle",
  "placeholder",
];

function isGeneric(cover) {
  if (!cover) return true;
  const c = cover.toLowerCase();
  return GENERIC_HINTS.some((h) => c.includes(h));
}

const missing = [];
const generic = [];
const ok = [];

for (const r of rows) {
  const fileOk = r.cover
    ? fs.existsSync(path.join("public", r.cover.replace(/^\//, "")))
    : false;
  const entry = {
    slug: r.slug,
    title: r.name,
    brand: r.brand_slug,
    cover: r.cover,
    fileOk,
    status: r.product_status,
  };
  if (!r.cover || !fileOk) missing.push(entry);
  else if (isGeneric(r.cover)) generic.push(entry);
  else ok.push(entry);
}

console.log("TOTAL", rows.length);
console.log("OK_UNIQUE", ok.length);
console.log("GENERIC_OR_ABSTRACT", generic.length);
console.log("MISSING_OR_BROKEN", missing.length);
console.log("\n=== MISSING ===");
for (const e of missing)
  console.log(e.brand, "|", e.slug, "|", e.title, "|", e.cover);
console.log("\n=== GENERIC ===");
for (const e of generic) console.log(e.brand, "|", e.slug, "|", e.cover);
console.log("\n=== BY BRAND COUNTS ===");
const counts = {};
for (const r of rows) {
  const b = r.brand_slug || "unknown";
  counts[b] = (counts[b] || 0) + 1;
}
for (const [b, n] of Object.entries(counts).sort()) console.log(b, n);

await sql.end({ timeout: 5 });
