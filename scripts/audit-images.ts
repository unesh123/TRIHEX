import fs from "fs";
import path from "path";
import { ALL_SEED_PRODUCTS } from "../src/db/seed-data";
import { getLiveMerchandisingCatalogue } from "../src/lib/catalog/merchandising";
import {
  resolveProductThumbnail,
  resolveProductInfographic,
  resolveProductGallery,
  FALLBACK_PRODUCT_IMAGE,
} from "../src/lib/catalog/product-image-resolver";
import manifest from "../src/lib/catalog/product-cover-manifest.json";

interface AuditResult {
  slug: string;
  title: string;
  visibility: string;
  thumbnail: {
    resolvedPath: string;
    exists: boolean;
    exactCaseMatches: boolean;
    sizeBytes: number;
    isFallback: boolean;
  };
  infographic: {
    resolvedPath: string;
    exists: boolean;
    exactCaseMatches: boolean;
    sizeBytes: number;
  };
  gallery: Array<{
    path: string;
    exists: boolean;
    exactCaseMatches: boolean;
    sizeBytes: number;
  }>;
}

function verifyFileCase(absPath: string): { exists: boolean; exactCase: boolean; size: number } {
  if (!fs.existsSync(absPath)) {
    return { exists: false, exactCase: false, size: 0 };
  }

  const stat = fs.statSync(absPath);
  const dir = path.dirname(absPath);
  const base = path.basename(absPath);

  try {
    const entries = fs.readdirSync(dir);
    const exactCase = entries.includes(base);
    return { exists: true, exactCase, size: stat.size };
  } catch {
    return { exists: true, exactCase: true, size: stat.size };
  }
}

async function runImageAudit() {
  const publicDir = path.join(process.cwd(), "public");
  const liveCatalogue = await getLiveMerchandisingCatalogue({ includeBlocked: true });
  
  const allSlugs = new Set<string>();
  liveCatalogue.forEach((c) => allSlugs.add(c.slug));
  ALL_SEED_PRODUCTS.forEach((p) => allSlugs.add(p.slug));
  (manifest as Array<{ slug: string }>).forEach((m) => allSlugs.add(m.slug));

  const results: AuditResult[] = [];
  let totalMissingThumbs = 0;
  let totalMissingInfos = 0;
  let totalCaseMismatches = 0;
  let totalFallbackThumbs = 0;

  for (const slug of Array.from(allSlugs).sort()) {
    const liveItem = liveCatalogue.find((c) => c.slug === slug);
    const seedItem = ALL_SEED_PRODUCTS.find((p) => p.slug === slug);
    const title = liveItem?.title ?? seedItem?.name ?? slug;
    const visibility = liveItem?.visibility ?? "NOT_IN_LIVE_CATALOGUE";

    const thumbPath = resolveProductThumbnail(liveItem ?? { slug });
    const infoPath = resolveProductInfographic(liveItem ?? { slug });
    const galleryPaths = resolveProductGallery(liveItem ?? { slug });

    const thumbAbs = path.join(publicDir, thumbPath.replace(/^\//, ""));
    const infoAbs = path.join(publicDir, infoPath.replace(/^\//, ""));

    const thumbCheck = verifyFileCase(thumbAbs);
    const infoCheck = verifyFileCase(infoAbs);

    const isFallback = thumbPath === FALLBACK_PRODUCT_IMAGE;
    if (isFallback) totalFallbackThumbs++;
    if (!thumbCheck.exists) totalMissingThumbs++;
    if (!infoCheck.exists) totalMissingInfos++;
    if (thumbCheck.exists && !thumbCheck.exactCase) totalCaseMismatches++;
    if (infoCheck.exists && !infoCheck.exactCase) totalCaseMismatches++;

    const galleryChecks = galleryPaths.map((gp) => {
      const gAbs = path.join(publicDir, gp.replace(/^\//, ""));
      const check = verifyFileCase(gAbs);
      if (check.exists && !check.exactCase) totalCaseMismatches++;
      return {
        path: gp,
        exists: check.exists,
        exactCaseMatches: check.exactCase,
        sizeBytes: check.size,
      };
    });

    results.push({
      slug,
      title,
      visibility,
      thumbnail: {
        resolvedPath: thumbPath,
        exists: thumbCheck.exists,
        exactCaseMatches: thumbCheck.exactCase,
        sizeBytes: thumbCheck.size,
        isFallback,
      },
      infographic: {
        resolvedPath: infoPath,
        exists: infoCheck.exists,
        exactCaseMatches: infoCheck.exactCase,
        sizeBytes: infoCheck.size,
      },
      gallery: galleryChecks,
    });
  }

  const report = {
    auditTimestamp: new Date().toISOString(),
    totalSlugsAudited: allSlugs.size,
    liveCatalogueCount: liveCatalogue.length,
    metrics: {
      totalMissingThumbs,
      totalMissingInfos,
      totalCaseMismatches,
      totalFallbackThumbs,
    },
    results,
  };

  fs.writeFileSync("image-audit.json", JSON.stringify(report, null, 2), "utf8");
  console.log("=== IMAGE FORENSIC AUDIT COMPLETE ===");
  console.log(`Total Slugs Checked: ${allSlugs.size}`);
  console.log(`Live Catalogue Products: ${liveCatalogue.length}`);
  console.log(`Missing Thumbnails: ${totalMissingThumbs}`);
  console.log(`Missing Infographics: ${totalMissingInfos}`);
  console.log(`Case Mismatches (Linux Hazard): ${totalCaseMismatches}`);
  console.log(`Using Generic Fallback: ${totalFallbackThumbs}`);
  console.log("Wrote image-audit.json successfully.");
}

runImageAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
