import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sources = JSON.parse(fs.readFileSync("artwork-sources.json", "utf8"));
const out = path.join(root, "public/media/artwork");
fs.mkdirSync(out, { recursive: true });
const report = [];
for (const [key, source] of Object.entries(sources)) {
  const dest = path.join(out, `${key}.webp`);
  let buffer;
  for (const quality of [84, 78, 72, 66]) {
    buffer = await sharp(source).rotate().resize(960, 960, { fit: "cover" }).toColorspace("srgb").webp({ quality, effort: 6 }).toBuffer();
    if (buffer.length <= 180000) break;
  }
  if (buffer.length > 180000) throw new Error(`Image exceeds budget: ${key}`);
  fs.writeFileSync(dest, buffer);
  report.push({ key, bytes: buffer.length });
}
console.log(JSON.stringify({ count: report.length, totalBytes: report.reduce((n, r) => n + r.bytes, 0), largestBytes: Math.max(...report.map(r => r.bytes)) }));
