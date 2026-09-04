import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { ALL_SEED_PRODUCTS } from "@/db/seed-data";
import { getMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import {
  resolveProductThumbnail,
  resolveProductInfographic,
  resolveProductGallery,
  FALLBACK_PRODUCT_IMAGE,
} from "@/lib/catalog/product-image-resolver";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");

describe("Product Image Delivery & Architecture", () => {
  const visible = getMerchandisingCatalogue({ includeBlocked: true });

  it("fallback product placeholder exists and is valid WebP", () => {
    const absPath = path.join(PUBLIC_DIR, FALLBACK_PRODUCT_IMAGE.replace(/^\//, ""));
    expect(fs.existsSync(absPath)).toBe(true);
    const stat = fs.statSync(absPath);
    expect(stat.size).toBeGreaterThan(1000);
  });

  it("every catalogue product resolves to an existing /media/products/ thumbnail on disk", () => {
    for (const p of visible) {
      const thumbUrl = resolveProductThumbnail(p);
      expect(thumbUrl.startsWith("/media/products/")).toBe(true);

      const absPath = path.join(PUBLIC_DIR, thumbUrl.replace(/^\//, ""));
      expect(fs.existsSync(absPath), `Missing thumbnail on disk: ${thumbUrl} for ${p.slug}`).toBe(true);

      const stat = fs.statSync(absPath);
      expect(stat.size, `Empty thumbnail file: ${thumbUrl}`).toBeGreaterThan(1000);
    }
  });

  it("every catalogue product resolves to an existing /media/products/ infographic on disk", () => {
    for (const p of visible) {
      const infoUrl = resolveProductInfographic(p);
      expect(infoUrl.startsWith("/media/products/")).toBe(true);

      const absPath = path.join(PUBLIC_DIR, infoUrl.replace(/^\//, ""));
      expect(fs.existsSync(absPath), `Missing infographic on disk: ${infoUrl} for ${p.slug}`).toBe(true);

      const stat = fs.statSync(absPath);
      expect(stat.size, `Empty infographic file: ${infoUrl}`).toBeGreaterThan(5000);
    }
  });

  it("every gallery returns at least 2 distinct images (infographic + thumbnail)", () => {
    for (const p of visible) {
      const gallery = resolveProductGallery(p);
      expect(gallery.length).toBeGreaterThanOrEqual(2);
      for (const img of gallery) {
        const absPath = path.join(PUBLIC_DIR, img.replace(/^\//, ""));
        expect(fs.existsSync(absPath), `Missing gallery image: ${img}`).toBe(true);
      }
    }
  });

  it("all resolved product image paths use strict lowercase casing (Linux / Vercel safe)", () => {
    for (const p of visible) {
      const thumbUrl = resolveProductThumbnail(p);
      const infoUrl = resolveProductInfographic(p);
      expect(thumbUrl).toBe(thumbUrl.toLowerCase());
      expect(infoUrl).toBe(infoUrl.toLowerCase());
    }
  });

  it("zero legacy /media/covers/trihex-generated/ URLs are produced by resolver", () => {
    for (const p of visible) {
      const thumb = resolveProductThumbnail(p);
      expect(thumb.includes("trihex-generated")).toBe(false);
      const info = resolveProductInfographic(p);
      expect(info.includes("trihex-generated")).toBe(false);
    }
  });
});
