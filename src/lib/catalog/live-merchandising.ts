import {
  filterCatalogue,
  buildMerchCard,
  type CatalogueOptions,
  type MerchCard,
} from "./merchandising";
import {
  resolveProductThumbnail,
  resolveProductInfographic,
  resolveProductGallery,
} from "./product-image-resolver";
import { isInternalOrTestSku } from "@/lib/commerce/catalogue-lint";

/** Live catalogue — Postgres prices/status when DATABASE_URL is set. Server-only. */
export async function getLiveMerchandisingCatalogue(
  options?: CatalogueOptions,
): Promise<MerchCard[]> {
  const { loadCatalogueProducts, loadPrimaryCoverPathsBySlug } = await import(
    "@/lib/catalog/live-catalogue"
  );
  // Catalogue rows and cover overrides are independent DB reads. Running them
  // together prevents their fail-soft timeouts from stacking on cold starts.
  const [products, covers] = await Promise.all([
    loadCatalogueProducts(),
    loadPrimaryCoverPathsBySlug(),
  ]);
  const cards = filterCatalogue(products, options).filter((c: MerchCard) => {
    const t = c.title.toLowerCase();
    if (t.includes("moths")) return false;
    if (/\(plan\)/.test(t) && t.includes("grok")) return false;
    return true;
  });
  return cards.map((c: MerchCard) => {
    const rawCover = covers.get(c.slug) ?? null;
    const thumb = resolveProductThumbnail(c.slug, rawCover, c.coverPublicPath);
    const info = resolveProductInfographic(c.slug, c.infographicPublicPath);
    const gallery = resolveProductGallery(c.slug);
    return {
      ...c,
      coverPublicPath: thumb,
      thumbnailPublicPath: thumb,
      infographicPublicPath: info,
      galleryPublicPaths: gallery,
    };
  });
}

export async function getLiveMerchCardBySlug(
  slug: string,
): Promise<MerchCard | null> {
  if (isInternalOrTestSku(slug)) return null;
  const { loadCatalogueProductBySlug, loadPrimaryCoverPathsBySlug } =
    await import("@/lib/catalog/live-catalogue");
  const [product, covers] = await Promise.all([
    loadCatalogueProductBySlug(slug),
    loadPrimaryCoverPathsBySlug(),
  ]);
  if (!product) return null;
  const card = buildMerchCard(product);
  const rawCover = covers.get(slug) ?? null;
  const thumb = resolveProductThumbnail(slug, rawCover, card.coverPublicPath);
  const info = resolveProductInfographic(slug, card.infographicPublicPath);
  const gallery = resolveProductGallery(slug);
  return {
    ...card,
    coverPublicPath: thumb,
    thumbnailPublicPath: thumb,
    infographicPublicPath: info,
    galleryPublicPaths: gallery,
  };
}
