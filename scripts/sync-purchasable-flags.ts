/**
 * Sync purchasable flags: only OWNER_AVAILABLE slugs get Buy Now.
 * Everything else stays Check Availability / hidden per status.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";
import {
  OWNER_AVAILABLE,
  OWNER_UNDER_REVIEW,
  OWNER_BLOCKED_SLUGS,
  OWNER_ARCHIVE_SLUGS,
} from "../src/db/catalogue-overrides";

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) throw new Error("DATABASE_URL required");
  const sql = postgres(dbUrl, { prepare: false, max: 1 });

  const buyNow = new Set(OWNER_AVAILABLE.map((o) => o.slug));
  const review = new Set(OWNER_UNDER_REVIEW.map((o) => o.slug));
  const blocked = new Set(OWNER_BLOCKED_SLUGS as readonly string[]);
  const archived = new Set(OWNER_ARCHIVE_SLUGS as readonly string[]);

  const products = await sql`
    select p.id, p.slug, p.product_status, p.compliance_status,
           v.id as variant_id, v.purchasable
    from products p
    join product_variants v on v.product_id = p.id
  `;

  for (const p of products) {
    const slug = p.slug as string;
    if (archived.has(slug)) {
      await sql`
        update products set product_status = 'ARCHIVED', searchable = false,
          featured = false, updated_at = now() where id = ${p.id}
      `;
      await sql`
        update product_variants set purchasable = false, active = false,
          updated_at = now() where id = ${p.variant_id}
      `;
      console.log("ARCHIVE", slug);
      continue;
    }
    if (blocked.has(slug)) {
      await sql`
        update products set product_status = 'BLOCKED',
          compliance_status = 'REJECTED', updated_at = now() where id = ${p.id}
      `;
      await sql`
        update product_variants set purchasable = false, updated_at = now()
        where id = ${p.variant_id}
      `;
      console.log("BLOCK", slug);
      continue;
    }
    if (buyNow.has(slug)) {
      await sql`
        update products set product_status = 'PUBLIC',
          compliance_status = 'APPROVED', needs_data_verification = false,
          published_at = coalesce(published_at, now()), updated_at = now()
        where id = ${p.id}
      `;
      await sql`
        update product_variants set purchasable = true, active = true,
          updated_at = now() where id = ${p.variant_id}
      `;
      console.log("BUY_NOW", slug);
      continue;
    }
    if (review.has(slug) || true) {
      // Default: under review — visible, not buyable
      await sql`
        update products set product_status = 'DRAFT',
          compliance_status = 'DOCUMENTS_REQUIRED',
          needs_data_verification = true, updated_at = now()
        where id = ${p.id} and product_status <> 'ARCHIVED'
      `;
      await sql`
        update product_variants set purchasable = false, updated_at = now()
        where id = ${p.variant_id}
      `;
      console.log("REVIEW", slug);
    }
  }

  await sql.end();
  console.log("DONE — Buy Now only for OWNER_AVAILABLE list");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
