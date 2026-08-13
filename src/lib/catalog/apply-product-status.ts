/**
 * Apply storefront status for a product and keep Buy Now (purchasable) in sync.
 * DRAFT = Under review → no Buy Now (Check Availability on shop).
 */
import { eq } from "drizzle-orm";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { revalidatePath } from "next/cache";

export const PRODUCT_STATUSES = [
  "DRAFT",
  "BLOCKED",
  "PUBLIC",
  "ARCHIVED",
] as const;

export type ProductStatusValue = (typeof PRODUCT_STATUSES)[number];

export function isProductStatus(value: string): value is ProductStatusValue {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

export function complianceForStatus(
  productStatus: ProductStatusValue,
): "APPROVED" | "DOCUMENTS_REQUIRED" | "REJECTED" {
  if (productStatus === "PUBLIC") return "APPROVED";
  if (productStatus === "BLOCKED" || productStatus === "ARCHIVED")
    return "REJECTED";
  return "DOCUMENTS_REQUIRED";
}

export async function applyProductStatus(input: {
  productId: string;
  productStatus: ProductStatusValue;
}): Promise<{ slug: string | null }> {
  const { productId, productStatus } = input;
  const complianceStatus = complianceForStatus(productStatus);
  const db = requireDb();

  await db
    .update(schema.products)
    .set({
      productStatus: productStatus as never,
      complianceStatus: complianceStatus as never,
      needsDataVerification: productStatus === "DRAFT",
      searchable: productStatus !== "ARCHIVED",
      ...(productStatus === "ARCHIVED" ? { featured: false } : {}),
      updatedAt: new Date(),
      publishedAt: productStatus === "PUBLIC" ? new Date() : null,
    })
    .where(eq(schema.products.id, productId));

  // Under review / blocked / archived → never Buy Now
  if (productStatus !== "PUBLIC") {
    await db
      .update(schema.productVariants)
      .set({
        purchasable: false,
        active: productStatus !== "ARCHIVED",
        updatedAt: new Date(),
      })
      .where(eq(schema.productVariants.productId, productId));
  }

  const [slugRow] = await db
    .select({ slug: schema.products.slug })
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);

  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  if (slugRow?.slug) {
    revalidatePath(`/products/${slugRow.slug}`);
  }

  return { slug: slugRow?.slug ?? null };
}
