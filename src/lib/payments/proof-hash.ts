import { createHash } from "crypto";

/** SHA-256 hex of payment proof bytes. */
export function hashProofBytes(bytes: Buffer | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function normalizePaymentReference(ref: string): string {
  return ref.trim().replace(/\s+/g, "").toUpperCase();
}
