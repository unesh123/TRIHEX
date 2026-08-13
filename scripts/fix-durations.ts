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

  const fixes: Array<{ slug: string; value: number; unit: "MONTH" | "YEAR" }> = [
    { slug: "manus-ai-pro-12-months", value: 12, unit: "MONTH" },
    { slug: "replit-core-12-months", value: 12, unit: "MONTH" },
    { slug: "elevenlabs-creator-12-months", value: 12, unit: "MONTH" },
    { slug: "super-grok-12-months", value: 12, unit: "MONTH" },
    { slug: "super-grok-6-months", value: 6, unit: "MONTH" },
    { slug: "adobe-cc-individual-1-year", value: 1, unit: "YEAR" },
    { slug: "coursera-premium-1-year", value: 1, unit: "YEAR" },
    { slug: "microsoft-365-family-1-year", value: 1, unit: "YEAR" },
    { slug: "prime-video-6-months", value: 6, unit: "MONTH" },
    { slug: "chatgpt-go-3-months", value: 3, unit: "MONTH" },
    { slug: "adobe-cc-2-months", value: 2, unit: "MONTH" },
  ];

  for (const f of fixes) {
    const [p] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, f.slug))
      .limit(1);
    if (!p) {
      console.log("missing", f.slug);
      continue;
    }
    await db
      .update(schema.productVariants)
      .set({
        durationValue: f.value,
        durationUnit: f.unit,
        updatedAt: new Date(),
      })
      .where(eq(schema.productVariants.productId, p.id));
    console.log("ok", f.slug, f.value, f.unit);
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
