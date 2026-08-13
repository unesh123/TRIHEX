import sharp from "sharp";
import fs from "fs";
import path from "path";

async function inspect(f: string) {
  if (!fs.existsSync(f)) {
    console.log("MISSING", f);
    return;
  }
  const m = await sharp(f).metadata();
  console.log(
    path.basename(f),
    `${m.width}x${m.height}`,
    m.format,
    `${Math.round(fs.statSync(f).size / 1024)}KB`,
  );
}

async function main() {
  const files = [
    "assets/product-media/full-cards/designer-master-art-09.webp",
    "assets/product-media/full-cards/designer-master-art-22.webp",
    "assets/product-media/full-cards/designer-master-card-09.png",
    "assets/product-media/full-cards/designer-master-card-22.png",
    "assets/product-media/full-cards/designer-master-card-01.png",
    "TRIHEX_PRODUCT_IMAGES/TRIHEX_PRODUCT_IMAGES/02_abstract_artwork/canva-ribbon-abstract.png",
    "TRIHEX_PRODUCT_IMAGES/TRIHEX_PRODUCT_IMAGES/02_abstract_artwork/green-molecular-abstract.png",
    "TRIHEX_PRODUCT_IMAGES/TRIHEX_PRODUCT_IMAGES/02_abstract_artwork/cursor-code-abstract.png",
    "TRIHEX_PRODUCT_IMAGES/TRIHEX_PRODUCT_IMAGES/01_single_product_covers/google-ai-pro-18month-rs399-poster.png",
    "TRIHEX_PRODUCT_IMAGES/TRIHEX_PRODUCT_IMAGES/01_single_product_covers/trihex-ai-prompt-starter-pack.png",
    "public/media/covers/gemini/google-ai-pro-5tb-18-months.webp",
    "public/media/covers/trihex/trihex-prompt-pack.webp",
    "public/media/covers/grammarly/grammarly-pro-1-year.webp",
  ];
  for (const f of files) await inspect(f);
}
main();
