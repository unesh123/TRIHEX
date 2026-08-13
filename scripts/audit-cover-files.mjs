import postgres from "postgres";
import fs from "fs";
import path from "path";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
const rows = await sql`
  SELECT p.slug, p.name, p.product_status, m.url as cover_url
  FROM products p
  LEFT JOIN product_media m ON m.product_id = p.id AND m.is_primary = true
  WHERE p.product_status = 'PUBLIC'
  ORDER BY p.name
`;

const broken = [];
const ok = [];
for (const r of rows) {
  const url = r.cover_url;
  if (!url) {
    broken.push({ ...r, reason: "no-url" });
    continue;
  }
  if (url.startsWith("http")) {
    ok.push({ slug: r.slug, url, kind: "remote" });
    continue;
  }
  const local = path.join("public", url.replace(/^\//, ""));
  if (!fs.existsSync(local)) {
    broken.push({ ...r, reason: "missing-file", local });
  } else {
    ok.push({ slug: r.slug, url, kind: "local" });
  }
}

console.log("PUBLIC products", rows.length);
console.log("OK covers", ok.length);
console.log("BROKEN covers", broken.length);
for (const b of broken) {
  console.log("-", b.slug, b.reason, b.cover_url || "", b.local || "");
}

await sql.end({ timeout: 5 });
