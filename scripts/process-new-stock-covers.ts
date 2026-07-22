/**
 * Process July 2026 stock cover PNGs → webp, update manifest, upload to Supabase + product_media.
 * Usage: npx tsx scripts/process-new-stock-covers.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";
normalizeEnvAliases();

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import {
  isProductMediaStorageConfigured,
  uploadObject,
} from "../src/lib/storage/adapter";

const ASSETS_DIR =
  process.env.CURSOR_ASSETS_DIR ||
  path.join(
    process.env.USERPROFILE || "",
    ".cursor/projects/c-Users-unesh-OneDrive-all-my-cloud-stroge-Desktop-AITRIHEX/assets",
  );

const WORKSPACE = process.cwd();
const MANIFEST_PATH = path.join(
  WORKSPACE,
  "src/lib/catalog/product-cover-manifest.json",
);

type CoverMap = {
  slug: string;
  family: string;
  file: string;
  alt: string;
};

const COVERS: CoverMap[] = [
  {
    slug: "manus-ai-pro-12-months",
    family: "trihex",
    file: "cover-manus-ai-pro-12m.png",
    alt: "Manus AI Pro 12 months product cover",
  },
  {
    slug: "replit-core-1-month",
    family: "trihex",
    file: "cover-replit-core-1m.png",
    alt: "Replit Core 1 month product cover",
  },
  {
    slug: "replit-core-12-months",
    family: "trihex",
    file: "cover-replit-core-12m.png",
    alt: "Replit Core 12 months product cover",
  },
  {
    slug: "vidiq-max-1-month",
    family: "youtube",
    file: "cover-vidiq-max-1m.png",
    alt: "VidIQ Max 1 month product cover",
  },
  {
    slug: "gamma-ai-pro-1-month",
    family: "trihex",
    file: "cover-gamma-ai-pro-1m.png",
    alt: "Gamma AI Pro 1 month product cover",
  },
  {
    slug: "coursera-premium-1-year",
    family: "coursera",
    file: "cover-coursera-plus-1y.png",
    alt: "Coursera Plus 1 year product cover",
  },
  {
    slug: "super-grok-6-months",
    family: "grok",
    file: "cover-super-grok-6m.png",
    alt: "Super Grok 6 months product cover",
  },
  {
    slug: "super-grok-12-months",
    family: "grok",
    file: "cover-super-grok-12m.png",
    alt: "Super Grok 12 months product cover",
  },
  {
    slug: "elevenlabs-creator-12-months",
    family: "elevenlabs",
    file: "cover-elevenlabs-creator-12m.png",
    alt: "ElevenLabs Creator 12 months product cover",
  },
  {
    slug: "google-ai-ultra-25k-1-month",
    family: "gemini",
    file: "cover-google-ai-ultra-25k.png",
    alt: "Google AI Ultra 25K credits product cover",
  },
  {
    slug: "adobe-cc-2-months",
    family: "adobe",
    file: "cover-adobe-cc-2m.png",
    alt: "Adobe Creative Cloud 2 months product cover",
  },
  {
    slug: "adobe-cc-individual-1-year",
    family: "adobe",
    file: "cover-adobe-cc-1y.png",
    alt: "Adobe Creative Cloud Individual 1 year product cover",
  },
  {
    slug: "chatgpt-go-3-months-coupon",
    family: "chatgpt",
    file: "cover-chatgpt-go-3m.png",
    alt: "ChatGPT Go 3 months product cover",
  },
  {
    slug: "chatgpt-plus-1-month-20d",
    family: "chatgpt",
    file: "cover-chatgpt-plus-20d.png",
    alt: "ChatGPT Plus 1 month 20-day warranty product cover",
  },
  {
    slug: "chatgpt-plus-1-month-no-warranty",
    family: "chatgpt",
    file: "cover-chatgpt-plus-no-warranty.png",
    alt: "ChatGPT Plus 1 month no warranty product cover",
  },
  {
    slug: "prime-video-1-month",
    family: "streaming",
    file: "cover-prime-video-1m.png",
    alt: "Amazon Prime Video 1 month product cover",
  },
  {
    slug: "prime-video-6-months",
    family: "streaming",
    file: "cover-prime-video-6m.png",
    alt: "Amazon Prime Video 6 months product cover",
  },
  {
    slug: "soundcloud-artist-pro-1-month",
    family: "streaming",
    file: "cover-soundcloud-artist-pro-1m.png",
    alt: "SoundCloud Artist Pro 1 month product cover",
  },
  {
    slug: "microsoft-365-family-1-year",
    family: "microsoft",
    file: "cover-ms365-family-1y.png",
    alt: "Microsoft 365 Family 1 year product cover",
  },
  {
    slug: "linkedin-career-2-months",
    family: "learning",
    file: "cover-linkedin-career-2m.png",
    alt: "LinkedIn Career 2 months product cover",
  },
  {
    slug: "lovable-ai-pro-1-month",
    family: "trihex",
    file: "cover-lovable-ai-pro-1m.png",
    alt: "Lovable AI Pro 1 month product cover",
  },
  {
    slug: "veo-3-ultra-45k-1-month",
    family: "gemini",
    file: "cover-veo-3-ultra-45k.png",
    alt: "Veo 3 Ultra 45K credits product cover",
  },
];

async function upsertPrimaryCover(
  db: ReturnType<typeof drizzle>,
  productId: string,
  url: string,
  alt: string,
) {
  const existing = await db
    .select()
    .from(schema.productMedia)
    .where(eq(schema.productMedia.productId, productId));
  const primary = existing.find((m) => m.isPrimary) ?? existing[0];
  if (primary) {
    await db
      .update(schema.productMedia)
      .set({ url, altText: alt, isPrimary: true })
      .where(eq(schema.productMedia.id, primary.id));
  } else {
    await db.insert(schema.productMedia).values({
      productId,
      url,
      altText: alt,
      sortOrder: 0,
      isPrimary: true,
    });
  }
}

async function main() {
  const candidates = [
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ]
    .map((v) => (v ?? "").trim().replace(/^["']|["']$/g, ""))
    .filter((v) => /^postgres(ql)?:\/\//i.test(v));

  const url = candidates[0];
  if (!url) throw new Error("Valid postgres DATABASE_URL / POSTGRES_URL required");

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  let manifest: Array<Record<string, unknown>> = [];
  try {
    manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  } catch {
    manifest = [];
  }

  const missing: string[] = [];
  const done: string[] = [];

  for (const cover of COVERS) {
    const src = path.join(ASSETS_DIR, cover.file);
    try {
      await fs.access(src);
    } catch {
      missing.push(`${cover.slug} ← missing source ${cover.file}`);
      continue;
    }

    const outDir = path.join(WORKSPACE, "public/media/covers", cover.family);
    await fs.mkdir(outDir, { recursive: true });
    const canonical = `${cover.slug}.webp`;
    const outFile = path.join(outDir, canonical);
    const publicPath = `/media/covers/${cover.family}/${canonical}`;

    const webp = await sharp(src)
      .resize(1200, 1200, { fit: "cover", position: "attention" })
      .toColorspace("srgb")
      .webp({ quality: 90 })
      .toBuffer();
    await fs.writeFile(outFile, webp);

    // Also copy png source into workspace assets for reference
    const wsAssets = path.join(WORKSPACE, "assets/product-media/generated");
    await fs.mkdir(wsAssets, { recursive: true });
    await fs.copyFile(src, path.join(wsAssets, cover.file));

    let finalUrl = publicPath;
    if (isProductMediaStorageConfigured()) {
      try {
        const uploaded = await uploadObject({
          kind: "product_media",
          contentType: "image/webp",
          size: webp.length,
          body: webp,
          isPublic: true,
          objectName: `product_media/${cover.slug}/${Date.now()}.webp`,
        });
        if (uploaded.publicUrl) finalUrl = uploaded.publicUrl;
      } catch (err) {
        console.error(`upload failed ${cover.slug}`, err);
      }
    }

    const [product] = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.slug, cover.slug))
      .limit(1);

    if (product) {
      await upsertPrimaryCover(db, product.id, finalUrl, cover.alt);
    } else {
      missing.push(`${cover.slug} — image ready but product not in DB yet`);
    }

    const entry = {
      slug: cover.slug,
      family: cover.family,
      canonical,
      publicPath: finalUrl.startsWith("http") ? publicPath : finalUrl,
      mode: "ARTWORK_ONLY",
      sourceFile: `assets/product-media/generated/${cover.file}`,
      alt: cover.alt,
      resolutionNote: "GENERATED_JULY_2026",
      artWidth: 1200,
      artHeight: 1200,
      lowResReplacementRecommended: false,
    };
    const idx = manifest.findIndex((m) => m.slug === cover.slug);
    if (idx >= 0) manifest[idx] = entry;
    else manifest.push(entry);

    done.push(`${cover.slug} → ${finalUrl}`);
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  const neededMd = `# Images still needed / status

Generated: ${new Date().toISOString()}

## Ready (${done.length})
${done.map((d) => `- ✅ ${d}`).join("\n") || "- (none)"}

## Missing or pending (${missing.length})
${missing.map((m) => `- ⚠️ ${m}`).join("\n") || "- None"}

## Intentionally skipped (0 stock)
- Super Grok 1 Month
- NordVPN 3 Months

## Notes
- Gemini Pro 18M Buy Now deal kept if existing cost is lower (no duplicate overwrite).
- Price-unknown BLOCK SKUs (LinkedIn, Lovable, Veo) have placeholder covers; replace after supplier quotes.
- Covers are abstract (no trademark logos). Swap with official art later if licensed.
`;

  await fs.writeFile(path.join(WORKSPACE, "IMAGES_STILL_NEEDED.md"), neededMd);
  console.log({ done: done.length, missing: missing.length });
  for (const d of done) console.log(d);
  for (const m of missing) console.log("MISSING", m);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
