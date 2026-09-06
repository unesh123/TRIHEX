import { eq, and, desc, or } from "drizzle-orm";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";

export type ApprovedReview = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
};

export async function listApprovedReviewsForProduct(input: {
  productId: string;
  categorySlug?: string | null;
}): Promise<ApprovedReview[]> {
  try {
    const db = requireDb();
    const productMatch = eq(schema.reviews.productId, input.productId);
    const where = input.categorySlug
      ? and(
          eq(schema.reviews.status, "APPROVED"),
          or(productMatch, eq(schema.reviews.categorySlug, input.categorySlug)),
        )
      : and(eq(schema.reviews.status, "APPROVED"), productMatch);

    const rows = await db
      .select()
      .from(schema.reviews)
      .where(where)
      .orderBy(desc(schema.reviews.createdAt))
      .limit(20);

    return rows.map((r) => ({
      id: r.id,
      authorName: r.authorName?.trim() || "Customer",
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error loading approved reviews for product:", input.productId, error);
    return [];
  }
}

export async function listApprovedReviewsForSlug(input: {
  slug: string;
  categorySlug?: string | null;
}): Promise<ApprovedReview[]> {
  try {
    const db = requireDb();
    const [product] = await db
      .select({ id: schema.products.id, categorySlug: schema.categories.slug })
      .from(schema.products)
      .leftJoin(
        schema.categories,
        eq(schema.products.categoryId, schema.categories.id),
      )
      .where(eq(schema.products.slug, input.slug))
      .limit(1);

    if (!product) return [];
    return await listApprovedReviewsForProduct({
      productId: product.id,
      categorySlug: input.categorySlug ?? product.categorySlug,
    });
  } catch (error) {
    console.error("Error loading approved reviews for slug:", input.slug, error);
    return [];
  }
}

export async function listAllReviewsAdmin() {
  const db = requireDb();
  return db
    .select({
      id: schema.reviews.id,
      productId: schema.reviews.productId,
      authorName: schema.reviews.authorName,
      categorySlug: schema.reviews.categorySlug,
      rating: schema.reviews.rating,
      title: schema.reviews.title,
      body: schema.reviews.body,
      status: schema.reviews.status,
      createdAt: schema.reviews.createdAt,
      productName: schema.products.name,
      productSlug: schema.products.slug,
    })
    .from(schema.reviews)
    .leftJoin(schema.products, eq(schema.reviews.productId, schema.products.id))
    .orderBy(desc(schema.reviews.createdAt))
    .limit(100);
}

export async function createManualReview(input: {
  productId?: string | null;
  categorySlug?: string | null;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}) {
  if (!input.productId && !input.categorySlug) {
    throw new Error("Pick a product or category.");
  }
  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Rating must be 1–5.");
  }
  const db = requireDb();
  const [row] = await db
    .insert(schema.reviews)
    .values({
      productId: input.productId || null,
      categorySlug: input.categorySlug || null,
      authorName: input.authorName.trim(),
      rating: input.rating,
      title: input.title?.trim() || null,
      body: input.body.trim(),
      status: input.status ?? "APPROVED",
    })
    .returning();
  return row;
}
