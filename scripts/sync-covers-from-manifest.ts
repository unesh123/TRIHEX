/**
 * Sync every non-archived product's primary product_media from the cover manifest.
 * Does not overwrite HTTPS (Supabase admin upload) URLs.
 */
import fs from "fs";
import path from "path";
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";

const MANIFEST = path.join(
  process.cwd(),
  "src",
  "lib",
  "catalog",
  "product-cover-manifest.json",
);

type Entry = {
  slug: string;
  publicPath: string;
  alt?: string;
};

async function main() {
  const entries = JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Entry[];
  const bySlug = new Map(entries.map((e) => [e.slug, e]));

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) throw new Error("DATABASE_URL missing");
  const sql = postgres(dbUrl, { prepare: false, max: 1 });

  const products = await sql`
    select id, slug, name, product_status
    from products
    where product_status <> 'ARCHIVED'
    order by name
  `;

  let upserted = 0;
  let skippedAdmin = 0;
  let missing = 0;

  for (const p of products) {
    const slug = p.slug as string;
    const entry = bySlug.get(slug);
    if (!entry?.publicPath) {
      console.warn("NO_MANIFEST", slug);
      missing++;
      continue;
    }

    const existing = await sql`
      select id, url, is_primary
      from product_media
      where product_id = ${p.id as string}
      order by is_primary desc, sort_order asc
    `;

    const primary = existing[0] as { id: string; url: string } | undefined;
    if (primary?.url?.startsWith("https://")) {
      console.log("KEEP_ADMIN", slug);
      skippedAdmin++;
      continue;
    }

    if (primary) {
      await sql`
        update product_media
        set url = ${entry.publicPath},
            alt_text = ${entry.alt ?? `${p.name as string} cover`},
            is_primary = true
        where id = ${primary.id}
      `;
    } else {
      await sql`
        insert into product_media (product_id, url, alt_text, sort_order, is_primary)
        values (
          ${p.id as string},
          ${entry.publicPath},
          ${entry.alt ?? `${p.name as string} cover`},
          0,
          true
        )
      `;
    }
    upserted++;
    console.log("SYNC", slug, entry.publicPath);
  }

  await sql.end();
  console.log({ upserted, skippedAdmin, missing, total: products.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
