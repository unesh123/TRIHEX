/**
 * Resolve payment proof URLs for admin viewing.
 * Supports storage://bucket/path (signed) and /media/... (public local).
 */
import { createSignedUrl } from "@/lib/storage/adapter";

export async function resolveProofViewUrl(
  proofUrl: string | null | undefined,
): Promise<string | null> {
  if (!proofUrl) return null;

  if (proofUrl.startsWith("/media/")) {
    return proofUrl;
  }

  if (proofUrl.startsWith("http://") || proofUrl.startsWith("https://")) {
    return proofUrl;
  }

  if (proofUrl.startsWith("storage://")) {
    const without = proofUrl.slice("storage://".length);
    const slash = without.indexOf("/");
    if (slash < 0) return null;
    const objectPath = without.slice(slash + 1);
    try {
      return await createSignedUrl({
        kind: "payment_proof",
        path: objectPath,
        expiresInSeconds: 60 * 30,
      });
    } catch (err) {
      console.error("[proof-url] signed URL failed", err);
      return null;
    }
  }

  return null;
}

export function isUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
