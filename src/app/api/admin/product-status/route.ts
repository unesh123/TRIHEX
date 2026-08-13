import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import {
  applyProductStatus,
  isProductStatus,
} from "@/lib/catalog/apply-product-status";
import { appendAuditEvent } from "@/lib/audit/log";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      productId?: string;
      productStatus?: string;
    };
    const productId = String(body.productId ?? "").trim();
    const productStatus = String(body.productStatus ?? "").trim();

    if (!productId) {
      return NextResponse.json(
        { ok: false, error: "productId required" },
        { status: 400 },
      );
    }
    if (!isProductStatus(productStatus)) {
      return NextResponse.json(
        { ok: false, error: "Invalid status" },
        { status: 400 },
      );
    }

    const { slug } = await applyProductStatus({ productId, productStatus });

    await appendAuditEvent({
      action: "PRODUCT_UPDATED",
      actorId: gate.session.userId ?? "admin",
      entityType: "product",
      entityId: productId,
      metadata: {
        kind: "status",
        productStatus,
        slug,
      },
    });

    return NextResponse.json({
      ok: true,
      productStatus,
      purchasable: productStatus === "PUBLIC" ? undefined : false,
      message:
        productStatus === "DRAFT"
          ? "Under review — Buy Now is off. Shop shows Check Availability."
          : productStatus === "PUBLIC"
            ? "Public on shop. Enable Purchasable under Price & stock for Buy Now."
            : `Status set to ${productStatus}.`,
    });
  } catch (err) {
    console.error("[admin] product-status failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not update status" },
      { status: 500 },
    );
  }
}
