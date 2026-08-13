import postgres from "postgres";
import fs from "fs";
import path from "path";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
const rows = await sql`
  SELECT p.slug, p.name, p.product_status, m.url as cover_url
  FROM products p
  LEFT JOIN product_media m ON m.product_id = p.id AND m.is_primary = true
  WHERE p.product_status <> 'ARCHIVED'
  ORDER BY p.name
`;

const missing = rows.filter((r) => !r.cover_url);
const has = rows.filter((r) => r.cover_url);
console.log("TOTAL", rows.length);
console.log("WITH DB COVER", has.length);
console.log("MISSING DB COVER", missing.length);
for (const r of missing) {
  console.log("-", r.product_status, r.slug);
}

const manifest = JSON.parse(
  fs.readFileSync("src/lib/catalog/product-cover-manifest.json", "utf8"),
);
const manSlugs = new Set(manifest.map((m) => m.slug));
const noManifest = rows.filter((r) => !manSlugs.has(r.slug));
console.log("\nNO MANIFEST ENTRY", noManifest.length);
for (const r of noManifest) console.log("-", r.slug);

const publicRoot = "public/media/covers";
let fileCount = 0;
function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".webp") || f.endsWith(".png")) fileCount++;
  }
}
walk(publicRoot);
console.log("\nPUBLIC COVER FILES", fileCount);

await sql.end({ timeout: 5 });
