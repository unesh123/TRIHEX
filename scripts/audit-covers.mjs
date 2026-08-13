import fs from "fs";
import path from "path";

const m = JSON.parse(
  fs.readFileSync("src/lib/catalog/product-cover-manifest.json", "utf8"),
);
const seed = fs.readFileSync("src/db/seed-data.ts", "utf8");
const slugs = new Set([...seed.matchAll(/slug:\s*"([^"]+)"/g)].map((x) => x[1]));
const covered = new Set(m.map((e) => e.slug));
const missing = [...slugs].filter((s) => !covered.has(s));
console.log("seed_slugs", slugs.size);
console.log("manifest", m.length);
console.log("no_cover_entry", missing.length);
missing.forEach((s) => console.log("MISSING_ENTRY", s));

const bySrc = {};
for (const e of m) {
  const key = e.sourceFile || e.publicPath;
  bySrc[key] = bySrc[key] || [];
  bySrc[key].push(e.slug);
}
for (const [src, arr] of Object.entries(bySrc)) {
  if (arr.length > 1) console.log("SHARED_ART", src, "->", arr.join(", "));
}

for (const e of m) {
  const file = path.join("public", e.publicPath);
  if (!fs.existsSync(file)) console.log("FILE_MISSING", e.slug, e.publicPath);
}
