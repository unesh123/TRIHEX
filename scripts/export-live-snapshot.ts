import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";
normalizeEnvAliases();

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/db/schema";
import fs from "fs";
import path from "path";

async function main() {
  let connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    console.error("No DATABASE_URL found");
    process.exit(1);
  }
  if (
    (connectionString.startsWith('"') && connectionString.endsWith('"')) ||
    (connectionString.startsWith("'") && connectionString.endsWith("'"))
  ) {
    connectionString = connectionString.slice(1, -1).trim();
  }

  const client = postgres(connectionString, { prepare: false, max: 5 });
  const db = drizzle(client, { schema });

  console.log("Connected to PostgreSQL. Fetching live tables...");

  const products = await db.select().from(schema.products);
  const variants = await db.select().from(schema.productVariants);
  const orders = await db.select().from(schema.orders);
  const orderItems = await db.select().from(schema.orderItems);
  const payments = await db.select().from(schema.payments);
  const paymentSubmissions = await db.select().from(schema.manualPaymentSubmissions);

  console.log(`Live DB counts:`);
  console.log(`- Products: ${products.length} (Public: ${products.filter(p => p.productStatus === "PUBLIC").length}, Archived: ${products.filter(p => p.productStatus === "ARCHIVED").length})`);
  console.log(`- Variants: ${variants.length} (Active: ${variants.filter(v => v.active).length}, Purchasable: ${variants.filter(v => v.purchasable).length})`);
  console.log(`- Orders: ${orders.length}`);
  console.log(`- Order Items: ${orderItems.length}`);
  console.log(`- Payment Proofs: ${payments.length}`);

  const testProducts = products.filter(p => /test/i.test(p.slug) || /test/i.test(p.name));
  const testVariants = variants.filter(v => /test/i.test(v.sku) || /test/i.test(v.variantName));
  console.log(`\nTest items found in DB:`);
  console.log(`- Test products:`, testProducts.map(p => ({ id: p.id, slug: p.slug, status: p.productStatus })));
  console.log(`- Test variants:`, testVariants.map(v => ({ id: v.id, sku: v.sku, active: v.active, purchasable: v.purchasable })));

  const outDir = path.resolve("data/backups");
  fs.mkdirSync(outDir, { recursive: true });
  const snapshotFile = path.join(outDir, `live-db-snapshot.json`);
  fs.writeFileSync(snapshotFile, JSON.stringify({
    exportedAt: new Date().toISOString(),
    counts: {
      products: products.length,
      variants: variants.length,
      orders: orders.length,
      orderItems: orderItems.length,
      payments: payments.length,
      paymentSubmissions: paymentSubmissions.length,
    },
    products,
    variants,
    orders,
    orderItems,
    payments,
    paymentSubmissions,
  }, null, 2), "utf-8");

  console.log(`\nSuccessfully saved complete raw DB snapshot to: ${snapshotFile}`);
  await client.end();
}

main().catch(console.error);
