/**
 * Manual payment proof workflow:
 * SUBMITTED → UNDER_REVIEW → VERIFIED | REJECTED
 */

export const ManualPaymentStatus = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;

export type ManualPaymentStatus =
  (typeof ManualPaymentStatus)[keyof typeof ManualPaymentStatus];

const TRANSITIONS: Record<ManualPaymentStatus, ManualPaymentStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["VERIFIED", "REJECTED", "SUBMITTED"],
  VERIFIED: [],
  REJECTED: ["SUBMITTED"],
};

export interface ManualPaymentRecord {
  id: string;
  orderId: string;
  method: "ESEWA_MANUAL" | "KHALTI_MANUAL" | "BANK_TRANSFER";
  status: ManualPaymentStatus;
  amountNprMinor: number;
  referenceCode: string | null;
  proofUrl: string | null;
  proofContentHash?: string | null;
  payerName: string | null;
  notes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

export function canTransitionManualPayment(
  from: ManualPaymentStatus,
  to: ManualPaymentStatus,
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertManualPaymentTransition(
  from: ManualPaymentStatus,
  to: ManualPaymentStatus,
): void {
  if (!canTransitionManualPayment(from, to)) {
    throw new Error(`Invalid manual payment transition: ${from} → ${to}`);
  }
}

export function createManualPaymentSubmission(input: {
  id: string;
  orderId: string;
  method: ManualPaymentRecord["method"];
  amountNprMinor: number;
  referenceCode?: string | null;
  proofUrl?: string | null;
  proofContentHash?: string | null;
  payerName?: string | null;
  notes?: string | null;
}): ManualPaymentRecord {
  if (!Number.isInteger(input.amountNprMinor) || input.amountNprMinor <= 0) {
    throw new Error("Manual payment amount must be a positive integer (NPR minor).");
  }
  if (!input.proofUrl && !input.referenceCode) {
    throw new Error("Provide a proof URL or payment reference code.");
  }

  return {
    id: input.id,
    orderId: input.orderId,
    method: input.method,
    status: "SUBMITTED",
    amountNprMinor: input.amountNprMinor,
    referenceCode: input.referenceCode ?? null,
    proofUrl: input.proofUrl ?? null,
    proofContentHash: input.proofContentHash ?? null,
    payerName: input.payerName ?? null,
    notes: input.notes ?? null,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  };
}

export function markManualPaymentUnderReview(
  record: ManualPaymentRecord,
  reviewerId: string,
): ManualPaymentRecord {
  assertManualPaymentTransition(record.status, "UNDER_REVIEW");
  return {
    ...record,
    status: "UNDER_REVIEW",
    reviewedBy: reviewerId,
  };
}

export function verifyManualPayment(
  record: ManualPaymentRecord,
  reviewerId: string,
): ManualPaymentRecord {
  // One-click approve from SUBMITTED or UNDER_REVIEW
  if (record.status === "VERIFIED") {
    return record;
  }
  if (record.status === "REJECTED") {
    throw new Error("Rejected payments cannot be approved. Ask customer to resubmit proof.");
  }
  if (record.status === "SUBMITTED") {
    assertManualPaymentTransition("SUBMITTED", "UNDER_REVIEW");
    assertManualPaymentTransition("UNDER_REVIEW", "VERIFIED");
  } else {
    assertManualPaymentTransition(record.status, "VERIFIED");
  }

  return {
    ...record,
    status: "VERIFIED",
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerId,
    rejectionReason: null,
  };
}

export function rejectManualPayment(
  record: ManualPaymentRecord,
  reviewerId: string,
  reason: string,
): ManualPaymentRecord {
  if (!reason.trim()) {
    throw new Error("Rejection reason is required.");
  }
  assertManualPaymentTransition(record.status, "REJECTED");
  return {
    ...record,
    status: "REJECTED",
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerId,
    rejectionReason: reason.trim(),
  };
}
