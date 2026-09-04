"use server";

import { revalidatePath } from "next/cache";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { appendAuditEvent } from "@/lib/audit/log";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import {
  applyProductStatus,
  complianceForStatus,
  isProductStatus,
} from "@/lib/catalog/apply-product-status";
import { assertHonestListPrice, isLossPrice } from "@/lib/pricing/honest-discounts";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) redirect("/admin/login");
  return gate.session;
}

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

export async function updateProductAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const productStatusRaw = String(formData.get("productStatus") ?? "DRAFT");
  const featured =
    formData.get("featured") === "on" || formData.get("featured") === "true";
  const coverPath = String(formData.get("coverPath") ?? "").trim();
  const coverAlt = String(formData.get("coverAlt") ?? "").trim();
  const features = String(formData.get("features") ?? "").trim();
  const coverFile = formData.get("coverFile");

  if (!productId || !name) redirect("/admin/products?error=invalid");

  if (!isProductStatus(productStatusRaw)) {
    redirect(`/admin/products/${productId}?error=status`);
  }
  const productStatus = productStatusRaw;
  const complianceStatus = complianceForStatus(productStatus);
  const db = requireDb();

  try {
    await db
      .update(schema.products)
      .set({
        name,
        shortDescription: shortDescription || null,
        longDescription: features || null,
        featured: productStatus === "ARCHIVED" ? false : featured,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, productId));

    // Status + Buy Now sync (DRAFT = under review → Check Availability)
    await applyProductStatus({ productId, productStatus });

    let finalCover = coverPath;
    if (coverFile instanceof File && coverFile.size > 0) {
      const bytes = Buffer.from(await coverFile.arrayBuffer());
      if (bytes.length > 6 * 1024 * 1024) {
        redirect(`/admin/products/${productId}?error=file_too_large`);
      }

      try {
        const { isProductMediaStorageConfigured, uploadObject } = await import(
          "@/lib/storage/adapter"
        );
        if (isProductMediaStorageConfigured()) {
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
            redirect(`/admin/products/${productId}?error=upload_url`);
          }
          finalCover = uploaded.publicUrl;
        } else {
          const family = "uploads";
          const outDir = path.join(
            process.cwd(),
            "public",
            "media",
            "covers",
            family,
          );
          await fs.mkdir(outDir, { recursive: true });
          const filename = `${productId.slice(0, 8)}-${Date.now()}.webp`;
          const dest = path.join(outDir, filename);
          await sharp(bytes)
            .resize(1200, 1200, { fit: "cover", position: "attention" })
            .toColorspace("srgb")
            .webp({ quality: 90 })
            .toFile(dest);
          finalCover = `/media/covers/${family}/${filename}`;
        }
      } catch (err) {
        console.error("[admin] cover upload failed", err);
        redirect(`/admin/products/${productId}?error=upload_failed`);
      }
    }

    if (
      finalCover.startsWith("/media/covers/") ||
      finalCover.startsWith("https://")
    ) {
      await upsertPrimaryCover(productId, finalCover, coverAlt || name);
    }

    await appendAuditEvent({
      action: "PRODUCT_UPDATED",
      actorId: session.userId ?? "admin",
      entityType: "product",
      entityId: productId,
      metadata: {
        name,
        productStatus,
        complianceStatus,
        featured,
        coverPath: finalCover || null,
      },
    });
  } catch (err) {
    // Next.js redirect() throws — never treat it as a save failure
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    console.error("[admin] updateProduct failed", err);
    redirect(`/admin/products/${productId}?error=save_failed`);
  }

  redirect(`/admin/products/${productId}?saved=1&kind=product`);
}

export async function updateVariantPriceAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const variantId = String(formData.get("variantId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const priceMajor = Number(formData.get("priceNpr") ?? "");
  const compareAtMajor = Number(formData.get("compareAtNpr") ?? "");
  const costMajor = Number(formData.get("costNpr") ?? "");
  const purchasable =
    formData.get("purchasable") === "on" || formData.get("purchasable") === "true";
  const qtyRaw = formData.get("seedVisibleQuantity");
  const seedVisibleQuantity =
    qtyRaw === "" || qtyRaw == null ? null : Number(qtyRaw);

  if (!variantId || !Number.isFinite(priceMajor) || priceMajor < 0) {
    redirect(
      productId
        ? `/admin/products/${productId}?error=price`
        : "/admin/pricing?error=invalid",
    );
  }

  const priceMinor = Math.round(priceMajor * 100);
  const db = requireDb();

  // Gemini 5TB floor + general loss guard when cost provided
  if (
    Number.isFinite(costMajor) &&
    costMajor > 0 &&
    isLossPrice(priceMinor, Math.round(costMajor * 100))
  ) {
    redirect(`/admin/products/${productId}?error=loss_price`);
  }

  if (Number.isFinite(compareAtMajor) && compareAtMajor > 0) {
    try {
      assertHonestListPrice({
        sellNprMinor: priceMinor,
        listNprMinor: Math.round(compareAtMajor * 100),
        costNprMinor: Number.isFinite(costMajor) && costMajor > 0
          ? Math.round(costMajor * 100)
          : null,
      });
    } catch {
      redirect(`/admin/products/${productId}?error=fake_discount`);
    }
  }

  const canSell =
    purchasable && priceMinor > 0 && seedVisibleQuantity !== 0;

  // Buy Now ON → force PUBLIC. Turning Buy Now OFF while PUBLIC → Under review.
  if (productId) {
    if (canSell) {
      await applyProductStatus({ productId, productStatus: "PUBLIC" });
    } else {
      const [current] = await db
        .select({ productStatus: schema.products.productStatus })
        .from(schema.products)
        .where(eq(schema.products.id, productId))
        .limit(1);
      if (current?.productStatus === "PUBLIC") {
        await applyProductStatus({ productId, productStatus: "DRAFT" });
      }
    }
  }

  const patch: Record<string, unknown> = {
    manualSellingPriceNprMinor: priceMinor,
    purchasable: canSell,
    seedVisibleQuantity,
    pricingMode: "MANUAL_ONLY",
    updatedAt: new Date(),
  };
  if (Number.isFinite(compareAtMajor) && compareAtMajor >= 0) {
    patch.compareAtPriceNprMinor =
      compareAtMajor > 0 ? Math.round(compareAtMajor * 100) : null;
  }
  if (Number.isFinite(costMajor) && costMajor >= 0) {
    // Store private supplier cost as USD minor via NPR/160
    patch.supplierCostUsdMinor = Math.round((costMajor / 160) * 100);
    patch.supplierCostMinor = Math.round((costMajor / 160) * 100);
  }

  await db
    .update(schema.productVariants)
    .set(patch as never)
    .where(eq(schema.productVariants.id, variantId));

  await appendAuditEvent({
    action: "PRODUCT_UPDATED",
    actorId: session.userId ?? "admin",
    entityType: "product_variant",
    entityId: variantId,
    metadata: {
      priceMinor,
      compareAtMinor: patch.compareAtPriceNprMinor ?? null,
      purchasable,
      seedVisibleQuantity,
      kind: "price",
    },
  });

  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  if (productId) {
    revalidatePath(`/admin/products/${productId}`);
    redirect(`/admin/products/${productId}?saved=1&kind=price`);
  }
  redirect("/admin/pricing?saved=1");
}

export async function softDeleteProductAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  if (!productId) redirect("/admin/products?error=invalid");

  const db = requireDb();
  await db
    .update(schema.products)
    .set({
      productStatus: "ARCHIVED",
      complianceStatus: "REJECTED",
      featured: false,
      searchable: false,
      updatedAt: new Date(),
      publishedAt: null,
    })
    .where(eq(schema.products.id, productId));

  await db
    .update(schema.productVariants)
    .set({ purchasable: false, active: false, updatedAt: new Date() })
    .where(eq(schema.productVariants.productId, productId));

  await appendAuditEvent({
    action: "PRODUCT_UPDATED",
    actorId: session.userId ?? "admin",
    entityType: "product",
    entityId: productId,
    metadata: { kind: "soft_delete", productStatus: "ARCHIVED" },
  });

  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products?archived=1");
}

export async function createProductAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugRaw || name);
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const features = String(formData.get("features") ?? "").trim();
  const priceMajor = Number(formData.get("priceNpr") ?? 0);
  const compareAtMajor = Number(formData.get("compareAtNpr") ?? "");
  const brandSlug = String(formData.get("brandSlug") ?? "trihex").trim();
  const categorySlug = String(formData.get("categorySlug") ?? "ai-tools").trim();
  const productStatus = String(formData.get("productStatus") ?? "DRAFT");
  const featured =
    formData.get("featured") === "on" || formData.get("featured") === "true";
  const purchasableRequested =
    formData.get("purchasable") === "on" ||
    formData.get("purchasable") === "true";
  const qtyRaw = formData.get("seedVisibleQuantity");
  const seedVisibleQuantity =
    qtyRaw === "" || qtyRaw == null ? null : Number(qtyRaw);

  if (!name || !slug) redirect("/admin/products/new?error=invalid");

  if (!isProductStatus(productStatus)) {
    redirect("/admin/products/new?error=status");
  }

  const complianceStatus = complianceForStatus(productStatus);
  const priceMinor = Math.round(Math.max(0, priceMajor) * 100);
  const compareAtMinor =
    Number.isFinite(compareAtMajor) && compareAtMajor > 0
      ? Math.round(compareAtMajor * 100)
      : null;
  const purchasable =
    purchasableRequested &&
    productStatus === "PUBLIC" &&
    priceMinor > 0;

  const db = requireDb();
  const brands = await db
    .select()
    .from(schema.brands)
    .where(eq(schema.brands.slug, brandSlug))
    .limit(1);
  const cats = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.slug, categorySlug))
    .limit(1);

  const [row] = await db
    .insert(schema.products)
    .values({
      brandId: brands[0]?.id,
      categoryId: cats[0]?.id,
      name,
      slug,
      shortDescription: shortDescription || null,
      longDescription: features || null,
      sourceListingText: name,
      productType: "DIGITAL_LICENSE",
      fulfillmentType: "MANUAL_CUSTOMER_EMAIL_ACTIVATION",
      productStatus: productStatus as never,
      complianceStatus: complianceStatus as never,
      supplyAuthorizationType: "UNKNOWN",
      vendorProofStatus: "NOT_UPLOADED",
      needsDataVerification: productStatus === "DRAFT",
      featured,
      searchable: productStatus !== "ARCHIVED",
      publishedAt: productStatus === "PUBLIC" ? new Date() : null,
    })
    .returning();

  const durationVal = Number(formData.get("durationValue") ?? 1) || 1;
  const durationUnitRaw = String(formData.get("durationUnit") ?? "MONTH");
  const durationUnit = ["DAY", "WEEK", "MONTH", "YEAR", "ONE_TIME"].includes(durationUnitRaw)
    ? durationUnitRaw
    : "MONTH";

  const sku = `THX-${slug.slice(0, 12).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  await db.insert(schema.productVariants).values({
    productId: row.id,
    sku,
    variantName: `${durationVal} ${durationUnit.toLowerCase() === "month" ? "Month" : durationUnit.toLowerCase() === "year" ? "Year" : "Term"} Access`,
    durationValue: durationVal,
    durationUnit: durationUnit as never,
    supplierCurrency: "USD",
    supplierCostMinor: 0,
    supplierCostUsdMinor: 0,
    manualSellingPriceNprMinor: priceMinor,
    compareAtPriceNprMinor: compareAtMinor,
    pricingMode: "MANUAL_ONLY",
    active: productStatus !== "ARCHIVED",
    purchasable,
    seedVisibleQuantity: Number.isFinite(seedVisibleQuantity as number)
      ? seedVisibleQuantity
      : null,
  });

  await appendAuditEvent({
    action: "PRODUCT_UPDATED",
    actorId: session.userId ?? "admin",
    entityType: "product",
    entityId: row.id,
    metadata: {
      kind: "create",
      name,
      slug,
      productStatus,
      priceMinor,
      compareAtMinor,
      seedVisibleQuantity,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/admin/products/${row.id}?saved=1&kind=create`);
}
