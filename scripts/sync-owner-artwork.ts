import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";
import { premiumArtworkForSlug } from "../src/lib/catalog/premium-artwork";
import { OWNER_PRODUCT_ADDITIONS } from "../src/db/owner-product-additions";

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("Database configuration is missing");
  const sql = postgres(url, { max: 5, prepare: false });
  try {
    const rows = await sql<{ id: string; slug: string; name: string }[]>`select id, slug, name from products`;
    const media = rows.flatMap(row => {
      const artwork = premiumArtworkForSlug(row.slug);
      return artwork ? [{ ...row, artwork }] : [];
    });
    for (const row of media) {
      if (!fs.existsSync(path.join(process.cwd(), "public", row.artwork))) {
        throw new Error(`Missing artwork: ${row.artwork}`);
      }
    }
    for (const product of OWNER_PRODUCT_ADDITIONS) {
      const artwork = premiumArtworkForSlug(product.slug);
      if (!artwork || !fs.existsSync(path.join(process.cwd(), "public", artwork))) {
        throw new Error(`Missing artwork for addition: ${product.slug}`);
      }
    }
    if (!process.argv.includes("--apply")) {
      console.log(JSON.stringify({ mode: "dry-run", images: media.length, additions: OWNER_PRODUCT_ADDITIONS.map(p => p.name) }));
      return;
    }
    const previousMedia = await sql`select id, product_id, url, alt_text, is_primary, sort_order from product_media order by product_id, sort_order`;
    const backupDir = path.join(process.cwd(), "data", "backups");
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(backupDir, `artwork-media-${new Date().toISOString().replace(/[:.]/g, "-")}.json`), JSON.stringify(previousMedia, null, 2));
    await sql.begin(async tx => {
      for (const row of media) {
        const primary = await tx`select id from product_media where product_id=${row.id} order by is_primary desc, sort_order asc limit 1`;
        if (primary[0]) {
          await tx`update product_media set url=${row.artwork}, alt_text=${row.name + " product artwork"}, is_primary=true where id=${primary[0].id}`;
        } else {
          await tx`insert into product_media (product_id,url,alt_text,is_primary,sort_order) values (${row.id},${row.artwork},${row.name + " product artwork"},true,0)`;
        }
      }
      for (const p of OWNER_PRODUCT_ADDITIONS) {
        await tx`insert into brands (slug,name) values (${p.brandSlug},'MuseAI') on conflict (slug) do nothing`;
        const [brand] = await tx`select id from brands where slug=${p.brandSlug}`;
        const [category] = await tx`select id from categories where slug=${p.categorySlug}`;
        const [created] = await tx`insert into products (brand_id,category_id,name,slug,short_description,source_listing_text,product_type,fulfillment_type,product_status,compliance_status,supply_authorization_type,vendor_proof_status,needs_data_verification)
          values (${brand.id},${category.id},${p.name},${p.slug},${p.shortDescription},${p.sourceListingText},${p.productType},${p.fulfillmentType},${p.productStatus},${p.complianceStatus},${p.supplyAuthorizationType},${p.vendorProofStatus},true)
          on conflict (slug) do nothing returning id`;
        if (!created) continue;
        const v = p.variants[0];
        await tx`insert into product_variants (product_id,sku,variant_name,manual_selling_price_npr_minor,pricing_mode,purchasable,duration_value,duration_unit)
          values (${created.id},${v.sku},${v.variantName},${v.manualSellingPriceNprMinor!},'MANUAL_ONLY',false,null,null)`;
        await tx`insert into product_media (product_id,url,alt_text,is_primary) values (${created.id},${premiumArtworkForSlug(p.slug)!},${p.name},true)`;
      }
    });
    console.log(JSON.stringify({ mode: "applied", images: media.length }));
  } finally { await sql.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
