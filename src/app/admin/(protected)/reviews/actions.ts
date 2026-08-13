"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireDb } from "@/db";
import * as schema from "@/db/schema";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import { createManualReview } from "@/lib/reviews/store";

async function requireAdmin() {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) redirect("/admin/login");
  return gate.session;
}

export async function createReviewAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "").trim() || null;
  const categorySlug =
    String(formData.get("categorySlug") ?? "").trim() || null;
  const authorName = String(formData.get("authorName") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 5);
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  try {
    await createManualReview({
      productId,
      categorySlug,
      authorName,
      rating,
      title,
      body,
      status: "APPROVED",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "failed";
    redirect(`/admin/reviews?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/products");
  redirect("/admin/reviews?saved=1");
}

export async function setReviewStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    redirect("/admin/reviews?error=invalid");
  }
  const db = requireDb();
  await db
    .update(schema.reviews)
    .set({ status })
    .where(eq(schema.reviews.id, id));
  revalidatePath("/admin/reviews");
  revalidatePath("/products");
  redirect("/admin/reviews?saved=1");
}
