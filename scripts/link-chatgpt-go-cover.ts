/**
 * Attach cover for chatgpt-go-3-months (DB slug) from coupon artwork.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";
normalizeEnvAliases();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

async function main() {
  const candidates = [
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL,
  ]
    .map((v) => (v ?? "").trim().replace(/^["']|["']$/g, ""))
    .filter((v) => /^postgres(ql)?:\/\//i.test(v));
  const client = postgres(candidates[0]!, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  const [p] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, "chatgpt-go-3-months"))
    .limit(1);
  if (!p) {
    console.log("product missing");
    await client.end();
    return;
  }

  const url = "/media/covers/chatgpt/chatgpt-go-3-months-coupon.webp";
  const existing = await db
    .select()
    .from(schema.productMedia)
    .where(eq(schema.productMedia.productId, p.id));
  const primary = existing.find((m) => m.isPrimary) ?? existing[0];
  if (primary) {
    await db
      .update(schema.productMedia)
      .set({ url, altText: "ChatGPT Go 3 months product cover", isPrimary: true })
      .where(eq(schema.productMedia.id, primary.id));
  } else {
    await db.insert(schema.productMedia).values({
      productId: p.id,
      url,
      altText: "ChatGPT Go 3 months product cover",
      sortOrder: 0,
      isPrimary: true,
    });
  }
  console.log("Linked cover to chatgpt-go-3-months");
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
