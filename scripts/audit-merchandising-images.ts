import { getLiveMerchandisingCatalogue } from "../src/lib/catalog/merchandising";
import fs from "fs";
import path from "path";

async function main() {
  const catalogue = await getLiveMerchandisingCatalogue({ includeBlocked: true });
  console.log(`Total catalogue items: ${catalogue.length}`);
  
  const missingThumbs: string[] = [];
  const publicDir = path.join(process.cwd(), "public");

  for (const c of catalogue) {
    const thumb = c.thumbnailPublicPath ?? c.coverPublicPath;
    const absPath = thumb ? path.join(publicDir, thumb.replace(/^\//, "")) : null;
    const exists = absPath ? fs.existsSync(absPath) : false;
    
    if (!exists) {
      missingThumbs.push(`${c.slug} -> attempted: ${thumb}`);
    }
  }

  console.log(`Missing thumbnails on disk: ${missingThumbs.length}`);
  missingThumbs.forEach((m) => console.log("  " + m));
}

main().then(() => process.exit(0)).catch(console.error);
