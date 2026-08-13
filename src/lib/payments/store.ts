/**
 * Manual payment store facade — delegates to repositories.
 */

import {
  createManualPaymentSubmission,
  type ManualPaymentRecord,
  markManualPaymentUnderReview,
  rejectManualPayment,
  verifyManualPayment,
} from "@/lib/payments/manual";
import { getRepositories } from "@/lib/repositories";
import {
  deductStockForPaidOrder,
  restoreStockForOrder,
} from "@/lib/inventory/order-stock";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function listManualPayments(): Promise<ManualPaymentRecord[]> {
  return getRepositories().payments.list();
}

export async function getManualPayment(
  id: string,
): Promise<ManualPaymentRecord | null> {
  return getRepositories().payments.get(id);
}

export async function submitManualPayment(
  input: Omit<Parameters<typeof createManualPaymentSubmission>[0], "id"> & {
    id?: string;
  },
): Promise<ManualPaymentRecord> {
  const record = createManualPaymentSubmission({
    ...input,
    id: input.id ?? nanoid(),
  });
  return getRepositories().payments.submit(record);
}

export async function reviewManualPayment(input: {
  id: string;
  action: "verify" | "reject" | "review";
  reviewerId: string;
  rejectionReason?: string;
}): Promise<ManualPaymentRecord> {
  const repos = getRepositories();
  const existing = await repos.payments.get(input.id);
  if (!existing) {
    throw new Error("Manual payment not found.");
  }

  let updated: ManualPaymentRecord;
  if (input.action === "review") {
    updated = markManualPaymentUnderReview(existing, input.reviewerId);
  } else if (input.action === "verify") {
    updated = verifyManualPayment(existing, input.reviewerId);
  } else {
    updated = rejectManualPayment(
      existing,
      input.reviewerId,
      input.rejectionReason ?? "Rejected by admin.",
    );
  }

  const saved = await repos.payments.save(updated);

  // Keep order status in sync with manual payment review
  if (input.action === "verify") {
    await repos.orders.updatePaymentStatus(saved.orderId, "PAID", "PAID");
    // Deduct product stock only after you manually approve payment
    const stock = await deductStockForPaidOrder(saved.orderId);
    if (!stock.ok) {
      console.error("[payment-review] stock deduct failed", stock.error);
    }
  } else if (input.action === "reject") {
    await repos.orders.updatePaymentStatus(
      saved.orderId,
      "UNPAID",
      "AWAITING_PAYMENT",
    );
    // If stock was committed on a previous approve, put it back
    await restoreStockForOrder(saved.orderId);
  } else if (input.action === "review") {
    await repos.orders.updatePaymentStatus(
      saved.orderId,
      "UNDER_REVIEW",
      "PROCESSING",
    );
  }

  try {
    revalidatePath("/admin");
    revalidatePath("/admin/payments/review");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/inventory");
    revalidatePath("/products");
  } catch {
    /* ignore in non-Next contexts */
  }

  return saved;
}

export async function findDuplicateReferences(
  reference: string,
): Promise<ManualPaymentRecord[]> {
  return getRepositories().payments.findByReference(reference);
}

export async function findDuplicateProofHashes(
  hash: string,
): Promise<ManualPaymentRecord[]> {
  const payments = getRepositories().payments;
  if (!payments.findByProofHash) return [];
  return payments.findByProofHash(hash);
}

export async function detectPaymentDuplicates(input: {
  reference: string;
  proofHash?: string | null;
  excludeOrderId?: string;
}): Promise<{
  duplicateReference: ManualPaymentRecord[];
  duplicateProof: ManualPaymentRecord[];
  hasWarning: boolean;
}> {
  const refHits = (await findDuplicateReferences(input.reference)).filter(
    (r) => r.orderId !== input.excludeOrderId,
  );
  const proofHits = input.proofHash
    ? (await findDuplicateProofHashes(input.proofHash)).filter(
        (r) => r.orderId !== input.excludeOrderId,
      )
    : [];
  return {
    duplicateReference: refHits,
    duplicateProof: proofHits,
    hasWarning: refHits.length > 0 || proofHits.length > 0,
  };
}
