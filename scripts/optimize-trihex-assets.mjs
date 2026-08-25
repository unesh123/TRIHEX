import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const generatedDir = path.join(root, "public", "media", "covers", "trihex-generated");
const brandDir = path.join(root, "public", "brand");

async function optimize(input, output, width) {
  await sharp(input)
    .resize(width, width, { fit: "cover", position: "center" })
    .toColorspace("srgb")
    .webp({ quality: 86, effort: 6, alphaQuality: 95 })
    .toFile(output);
  fs.unlinkSync(input);
}

for (const file of fs.readdirSync(generatedDir)) {
  if (!file.endsWith(".png")) continue;
  const input = path.join(generatedDir, file);
  const output = path.join(generatedDir, file.replace(/\.png$/, ".webp"));
  await optimize(input, output, 1200);
}

for (const file of fs.readdirSync(brandDir)) {
  if (!file.endsWith(".png")) continue;
  const input = path.join(brandDir, file);
  const output = path.join(brandDir, file.replace(/\.png$/, ".webp"));
  await optimize(input, output, 512);
}

console.log("Optimized generated TRIHEX assets to WebP.");
