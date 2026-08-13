import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import {
  isProductMediaStorageConfigured,
  uploadObject,
} from "@/lib/storage/adapter";

export const runtime = "nodejs";

async function upsertPrimaryCover(
  productId: string,
  url: string,
  alt: string,
) {
  const db = requireDb();
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

export async function POST(req: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isProductMediaStorageConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "PRODUCT_MEDIA_STORAGE_BUCKET is not configured on the server.",
      },
      { status: 500 },
    );
  }

  try {
    const form = await req.formData();
    const productId = String(form.get("productId") ?? "").trim();
    const altText = String(form.get("alt") ?? "").trim();
    const file = form.get("file");

    if (!productId) {
      return NextResponse.json(
        { ok: false, error: "productId required" },
        { status: 400 },
      );
    }
    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json(
        { ok: false, error: "Image file required" },
        { status: 400 },
      );
    }
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "Max file size is 6MB" },
        { status: 400 },
      );
    }

    const db = requireDb();
    const [product] = await db
      .select({ id: schema.products.id, slug: schema.products.slug, name: schema.products.name })
      .from(schema.products)
      .where(eq(schema.products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const webp = await sharp(bytes)
      .resize(1200, 1200, { fit: "cover", position: "attention" })
      .toColorspace("srgb")
      .webp({ quality: 90 })
      .toBuffer();

    const uploaded = await uploadObject({
      kind: "product_media",
      contentType: "image/webp",
      size: webp.length,
      body: webp,
      isPublic: true,
      objectName: `product_media/${productId}/${Date.now()}.webp`,
    });

    if (!uploaded.publicUrl) {
      return NextResponse.json(
        { ok: false, error: "Upload succeeded but no public URL returned" },
        { status: 500 },
      );
    }

    const alt = altText || `${product.name} cover`;
    await upsertPrimaryCover(productId, uploaded.publicUrl, alt);

    await db
      .update(schema.products)
      .set({ updatedAt: new Date() })
      .where(eq(schema.products.id, productId));

    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/products/${product.slug}`);

    return NextResponse.json({
      ok: true,
      url: uploaded.publicUrl,
      path: uploaded.path,
      published: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[admin/product-cover]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
