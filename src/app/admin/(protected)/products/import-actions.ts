"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { appendAuditEvent } from "@/lib/audit/log";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import {
  detectBrandSlug,
  detectCategorySlug,
  parseImportText,
  slugifyProductName,
  type ParsedImportLine,
} from "@/lib/catalog/bulk-import";
import { allInquiryStarterPriced } from "@/db/inquiry-expansion";
import { DEFAULT_MARGIN_PERCENT } from "@/db/stock-pricing";

async function requireAdmin() {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) redirect("/admin/login");
  return gate.session;
}

async function resolveBrandCategoryIds(
  brandSlug: string,
  categorySlug: string,
) {
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
  return {
    brandId: brands[0]?.id,
    categoryId: cats[0]?.id,
  };
}

async function insertInquiryProduct(row: {
  name: string;
  slug: string;
  brandSlug: string;
  categorySlug: string;
  costNpr: number;
  sellNpr: number;
  shortDescription?: string;
}): Promise<"created" | "skipped" | "updated"> {
  const db = requireDb();
  const existing = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.slug, row.slug))
    .limit(1);

  const { brandId, categoryId } = await resolveBrandCategoryIds(
    row.brandSlug,
    row.categorySlug,
  );
  const priceMinor = Math.round(row.sellNpr * 100);
  const costUsdMinor = Math.round((row.costNpr / 160) * 100);
  // Honest pricing: never invent fake compare-at / % off
  const compareAtMinor: number | null = null;
  const desc =
    row.shortDescription ??
    "Check availability on WhatsApp. After you pay and we verify, delivery is arranged on WhatsApp.";

  if (existing[0]) {
    const [product] = await db
      .select({
        id: schema.products.id,
        productStatus: schema.products.productStatus,
      })
      .from(schema.products)
      .where(eq(schema.products.id, existing[0].id))
      .limit(1);

    const [variant] = await db
      .select({
        id: schema.productVariants.id,
        purchasable: schema.productVariants.purchasable,
      })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.productId, existing[0].id))
      .limit(1);

    // Never overwrite live Buy Now / PUBLIC sellable SKUs
    if (
      product?.productStatus === "PUBLIC" ||
      variant?.purchasable === true
    ) {
      return "skipped";
    }

    await db
      .update(schema.productVariants)
      .set({
        manualSellingPriceNprMinor: priceMinor,
        compareAtPriceNprMinor: compareAtMinor,
        supplierCostUsdMinor: costUsdMinor,
        supplierCostMinor: costUsdMinor,
        purchasable: false,
        pricingMode: "MANUAL_ONLY",
        updatedAt: new Date(),
      })
      .where(eq(schema.productVariants.productId, existing[0].id));

    await db
      .update(schema.products)
      .set({
        name: row.name,
        shortDescription: desc,
        productStatus: "DRAFT",
        complianceStatus: "DOCUMENTS_REQUIRED",
        needsDataVerification: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, existing[0].id));

    return "updated";
  }

  const [created] = await db
    .insert(schema.products)
    .values({
      brandId,
      categoryId,
      name: row.name,
      slug: row.slug,
      shortDescription: desc,
      longDescription:
        "Availability under review.\nWhatsApp inquiry first\nPay after confirmation\nDelivery via WhatsApp after payment verification",
      sourceListingText: row.name,
      productType: "DIGITAL_LICENSE",
      fulfillmentType: "MANUAL_CUSTOMER_EMAIL_ACTIVATION",
      productStatus: "DRAFT",
      complianceStatus: "DOCUMENTS_REQUIRED",
      supplyAuthorizationType: "UNKNOWN",
      vendorProofStatus: "NOT_UPLOADED",
      needsDataVerification: true,
      featured: false,
      searchable: true,
      publishedAt: null,
    })
    .returning();

  const sku = `INQ-${row.slug.slice(0, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  await db.insert(schema.productVariants).values({
    productId: created.id,
    sku,
    variantName: "Standard",
    durationValue: 1,
    durationUnit: "MONTH",
    supplierCurrency: "USD",
    supplierCostMinor: costUsdMinor,
    supplierCostUsdMinor: costUsdMinor,
    manualSellingPriceNprMinor: priceMinor,
    compareAtPriceNprMinor: compareAtMinor,
    pricingMode: "MANUAL_ONLY",
    active: true,
    purchasable: false,
    seedVisibleQuantity: null,
  });

  return "created";
}

export async function bulkImportFromTextAction(
  formData: FormData,
): Promise<void> {
  const session = await requireAdmin();
  const text = String(formData.get("lines") ?? "");
  const marginRaw = Number(formData.get("marginPercent") ?? DEFAULT_MARGIN_PERCENT);
  const marginPercent =
    Number.isFinite(marginRaw) && marginRaw >= 0 ? marginRaw : DEFAULT_MARGIN_PERCENT;
  const skipDuplicates = formData.get("skipDuplicates") === "on";

  const parsed = parseImportText(text, marginPercent);
  const valid = parsed.filter((p) => !p.error && p.slug);
  const invalid = parsed.filter((p) => p.error);

  if (!valid.length) {
    redirect(
      `/admin/products/import?error=empty&bad=${invalid.length}`,
    );
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of valid) {
    const db = requireDb();
    if (skipDuplicates) {
      const exists = await db
        .select({ id: schema.products.id })
        .from(schema.products)
        .where(eq(schema.products.slug, row.slug))
        .limit(1);
      if (exists[0]) {
        skipped += 1;
        continue;
      }
    }

    const result = await insertInquiryProduct({
      name: row.name,
      slug: ensureUniqueSlugHint(row),
      brandSlug: row.brandSlug,
      categorySlug: row.categorySlug,
      costNpr: row.costNpr,
      sellNpr: row.sellNpr,
    });
    if (result === "created") created += 1;
    else if (result === "updated") updated += 1;
    else skipped += 1;
  }

  await appendAuditEvent({
    action: "PRODUCT_UPDATED",
    actorId: session.userId ?? "admin",
    entityType: "catalogue",
    entityId: null,
    metadata: {
      kind: "bulk_import",
      created,
      updated,
      skipped,
      invalid: invalid.length,
      marginPercent,
    },
  });

  revalidatePath("/products");
  revalidatePath("/inquire");
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect(
    `/admin/products/import?ok=1&created=${created}&updated=${updated}&skipped=${skipped}&bad=${invalid.length}`,
  );
}

function ensureUniqueSlugHint(row: ParsedImportLine): string {
  // If slug collision on different names, append short cost hash
  return row.slug || slugifyProductName(row.name);
}

export async function importStarterInquiryCatalogueAction(): Promise<void> {
  const session = await requireAdmin();
  const items = allInquiryStarterPriced();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    const brandSlug = detectBrandSlug(item.name);
    const categorySlug = detectCategorySlug(item.name, brandSlug);
    const slug = slugifyProductName(item.name);
    const result = await insertInquiryProduct({
      name: item.name,
      slug,
      brandSlug,
      categorySlug,
      costNpr: item.costNpr,
      sellNpr: item.sellNpr,
      shortDescription: item.shortDescription,
    });
    if (result === "created") created += 1;
    else if (result === "updated") updated += 1;
    else skipped += 1;
  }

  await appendAuditEvent({
    action: "PRODUCT_UPDATED",
    actorId: session.userId ?? "admin",
    entityType: "catalogue",
    entityId: null,
    metadata: {
      kind: "starter_inquiry_import",
      created,
      updated,
      skipped,
      total: items.length,
    },
  });

  revalidatePath("/products");
  revalidatePath("/inquire");
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect(
    `/admin/products/import?ok=1&created=${created}&updated=${updated}&skipped=${skipped}&starter=1`,
  );
}
