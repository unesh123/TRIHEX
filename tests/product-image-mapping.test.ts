import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { ALL_SEED_PRODUCTS } from "@/db/seed-data";
import { getMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import {
  getAllProductCovers,
  getProductCover,
  isRasterCover,
} from "@/lib/catalog/product-covers";

const ROOT = process.cwd();

describe("product image mapping", () => {
  const covers = getAllProductCovers();
  const visible = getMerchandisingCatalogue({ includeBlocked: true });

  it("every visible product has media or explicit family fallback", () => {
    for (const p of visible) {
      const cover = getProductCover(p.slug);
      expect(cover).toBeTruthy();
      if (isRasterCover(cover)) {
        const abs = path.join(ROOT, "public", cover!.publicPath.replace(/^\//, ""));
        expect(fs.existsSync(abs), `${p.slug} missing ${cover!.publicPath}`).toBe(
          true,
        );
        expect(
          cover!.publicPath.startsWith("/media/covers/") ||
          cover!.publicPath.startsWith("/media/products/"),
        ).toBe(true);
      } else {
        expect(cover!.mode).toBe("SVG_FALLBACK");
      }
    }
  });

  it("no product uses a contact sheet as its cover", () => {
    for (const c of covers) {
      if (!c.publicPath) continue;
      expect(c.publicPath.includes("source-sheets")).toBe(false);
      expect(c.publicPath.includes("Designer")).toBe(false);
      expect(c.mode).not.toBe("FULL_CARD");
    }
  });

  it("every raster cover has dimensions and alt text", () => {
    for (const c of covers) {
      if (!isRasterCover(c)) continue;
      expect(c.alt.length).toBeGreaterThan(10);
      expect(c.artWidth).toBeGreaterThan(0);
      expect(c.artHeight).toBeGreaterThan(0);
    }
  });

  it("family-specific media mapping holds", () => {
    const familyOf = (slug: string) =>
      ALL_SEED_PRODUCTS.find((p) => p.slug === slug)?.brandSlug;

    for (const c of covers) {
      if (!isRasterCover(c)) continue;
      const brand = familyOf(c.slug);
      if (!brand) continue;
      if (brand === "openai") expect(c.family).toBe("chatgpt");
      else if (brand === "gemini") expect(c.family).toBe("gemini");
      else if (brand === "grok") expect(c.family).toBe("grok");
      else if (brand === "claude") expect(c.family).toBe("claude");
      else if (brand === "adobe") expect(c.family).toBe("adobe");
      else if (brand === "canva") expect(c.family).toBe("canva");
      else if (brand === "coursera") expect(c.family).toBe("coursera");
      else if (brand === "capcut") expect(c.family).toBe("capcut");
      else if (brand === "kling") expect(c.family).toBe("kling");
      else if (brand === "cursor") expect(c.family).toBe("cursor");
    }
  });

  it("CapCut and Kling do not share cover paths", () => {
    const capcut = covers.filter((c) => c.family === "capcut" && c.publicPath);
    const kling = covers.filter((c) => c.family === "kling" && c.publicPath);
    const paths = new Set(capcut.map((c) => c.publicPath));
    for (const k of kling) expect(paths.has(k.publicPath)).toBe(false);
  });

  it("Gemini mail variants retain separate covers", () => {
    const a = getProductCover("gemini-ai-pro-5tb-12m-mail-a");
    const b = getProductCover("gemini-ai-pro-5tb-12m-mail-b");
    // Archived from live catalogue; covers may remain on disk for rollback
    if (a && b && isRasterCover(a) && isRasterCover(b)) {
      expect(a.publicPath).not.toBe(b.publicPath);
    }
  });

  it("Gemini 5TB 12M cover is not the 18-month Rs.399 poster", () => {
    const c = getProductCover("gemini-ai-pro-5tb-12m-mail-a");
    expect(isRasterCover(c)).toBe(true);
    expect(c!.sourceFile ?? "").not.toMatch(/18month|rs399|rs300/i);
    const gem18 = ALL_SEED_PRODUCTS.find(
      (p) => p.slug === "gemini-pro-18-months-link",
    );
    const gem12 = ALL_SEED_PRODUCTS.find(
      (p) => p.slug === "gemini-ai-pro-5tb-12m-mail-a",
    );
    expect(gem18!.variants[0]!.manualSellingPriceNprMinor).toBe(39900);
    expect(gem12!.variants[0]!.manualSellingPriceNprMinor).toBe(369900);
    expect(gem12!.variants[0]!.manualSellingPriceNprMinor).not.toBe(
      gem18!.variants[0]!.manualSellingPriceNprMinor,
    );
  });

  it("Cursor covers use clean abstract art, not sheet crops", () => {
    for (const slug of ["cursor-pro-plus", "cursor-pro-30-days", "cursor-ultra"]) {
      const c = getProductCover(slug);
      expect(isRasterCover(c)).toBe(true);
      expect(c!.sourceFile ?? "").toMatch(/cursor-code-abstract/);
      expect(c!.publicPath.startsWith("/media/covers/cursor/")).toBe(true);
    }
  });

  it("services do not appear in AI Tools", () => {
    const ai = getMerchandisingCatalogue({ categorySlug: "ai-tools" });
    expect(ai.some((p) => p.brandSlug === "trihex")).toBe(false);
    expect(ai.some((p) => p.categorySlug === "services")).toBe(false);
  });

  it("blocked / under-review products are not purchasable", () => {
    for (const p of visible) {
      if (
        p.visibility === "BLOCKED" ||
        p.visibility === "AVAILABILITY_UNDER_REVIEW" ||
        p.visibility === "COMING_SOON" ||
        p.visibility === "OUT_OF_STOCK"
      ) {
        expect(p.purchasable).toBe(false);
      }
    }
  });

  it("Cursor and Canva EDU are not purchasable without authorization", () => {
    const cursor = visible.filter((p) => p.brandSlug === "cursor");
    const edu = visible.find((p) => p.slug === "canva-edu-1-year");
    for (const c of cursor) expect(c.purchasable).toBe(false);
    if (edu) expect(edu.purchasable).toBe(false);
  });

  it("live price and status are not derived from cover mode FULL_CARD", () => {
    // All public covers are ARTWORK_ONLY or SVG — baked price/status must not drive UI
    for (const c of covers) {
      if (c.publicPath) expect(c.mode).toBe("ARTWORK_ONLY");
    }
  });
});
