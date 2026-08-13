import postgres from "postgres";
import fs from "fs";
import path from "path";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
const rows = await sql`
  SELECT p.slug, p.name, p.product_status, m.url as cover_url,
         b.slug as brand_slug
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN product_media m ON m.product_id = p.id AND m.is_primary = true
  WHERE p.product_status <> 'ARCHIVED'
  ORDER BY p.product_status, p.name
`;

const need = [];
for (const r of rows) {
  const url = r.cover_url;
  let localOk = false;
  if (url?.startsWith("/media/")) {
    localOk = fs.existsSync(path.join("public", url.replace(/^\//, "")));
  } else if (url?.startsWith("http")) {
    localOk = true; // remote counts but we may still want local
  }
  if (!url || !localOk) {
    need.push({ slug: r.slug, name: r.name, status: r.product_status, brand: r.brand_slug, reason: !url ? "missing" : "file-missing" });
  }
}

console.log("Need generation:", need.length);
for (const n of need) console.log(n.status, n.slug, n.reason);

// Also list all DRAFT + PUBLIC for full regeneration list
console.log("\nALL ACTIVE SLUGS", rows.length);
for (const r of rows) {
  console.log([r.product_status, r.slug, r.brand_slug || "?", r.cover_url || "NONE"].join(" | "));
}

await sql.end({ timeout: 5 });
