import { getDb } from "../src/db";
import * as schema from "../src/db/schema";
import { eq } from "drizzle-orm";
import { getLiveMerchandisingCatalogue } from "../src/lib/catalog/merchandising";

async function main() {
  const db = getDb();
  if (db) {
    const rows = await db
      .select({
        slug: schema.products.slug,
        url: schema.productMedia.url,
        isPrimary: schema.productMedia.isPrimary,
        sortOrder: schema.productMedia.sortOrder,
      })
      .from(schema.productMedia)
      .innerJoin(
        schema.products,
        eq(schema.productMedia.productId, schema.products.id),
      )
      .limit(10);
    console.log("DB Rows sample:", rows);
  } else {
    console.log("No DB connection");
  }

  const live = await getLiveMerchandisingCatalogue();
  console.log("Live sample (first 5):");
  for (const c of live.slice(0, 5)) {
    console.log({
      slug: c.slug,
      title: c.title,
      coverPublicPath: c.coverPublicPath,
      thumbnailPublicPath: c.thumbnailPublicPath,
    });
  }
}

main().then(() => process.exit(0)).catch(console.error);
