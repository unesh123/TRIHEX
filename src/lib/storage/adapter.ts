/**
 * Storage adapter — private buckets for proofs/QR/docs; public for product media.
 * Without Supabase storage credentials, uploads fail closed (no fake public URLs).
 */

import { ConfigurationError } from "@/lib/config/persistence-guard";

export type StorageBucketKind =
  | "product_media"
  | "payment_proof"
  | "private_document"
  | "payment_qr";

const BUCKET_ENV: Record<StorageBucketKind, string> = {
  product_media: "PRODUCT_MEDIA_STORAGE_BUCKET",
  payment_proof: "PAYMENT_PROOF_STORAGE_BUCKET",
  private_document: "PRIVATE_DOCUMENT_STORAGE_BUCKET",
  payment_qr: "PAYMENT_QR_STORAGE_BUCKET",
};

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ValidatedUpload {
  contentType: string;
  size: number;
  extension: string;
  objectName: string;
}

export function validateUploadFile(input: {
  contentType: string;
  size: number;
  originalName?: string;
  kind: StorageBucketKind;
}): ValidatedUpload {
  if (!ALLOWED_IMAGE_TYPES.has(input.contentType)) {
    throw new Error(`Unsupported file type: ${input.contentType}`);
  }
  if (input.size <= 0 || input.size > MAX_BYTES) {
    throw new Error(`File size must be between 1 byte and ${MAX_BYTES} bytes.`);
  }

  const ext =
    input.contentType === "image/png"
      ? "png"
      : input.contentType === "image/webp"
        ? "webp"
        : input.contentType === "application/pdf"
          ? "pdf"
          : "jpg";

  const objectName = `${input.kind}/${crypto.randomUUID()}.${ext}`;
  return {
    contentType: input.contentType,
    size: input.size,
    extension: ext,
    objectName,
  };
}

export function getBucketName(kind: StorageBucketKind): string {
  const envKey = BUCKET_ENV[kind];
  const name = process.env[envKey];
  if (!name) {
    throw new ConfigurationError(
      `Storage bucket env ${envKey} is not configured.`,
    );
  }
  return name;
}

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      (process.env.PAYMENT_PROOF_STORAGE_BUCKET ||
        process.env.PRODUCT_MEDIA_STORAGE_BUCKET),
  );
}

export function isProductMediaStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.PRODUCT_MEDIA_STORAGE_BUCKET,
  );
}

/**
 * Upload bytes to private/public storage.
 * Returns storage path (not a permanent public URL for private buckets).
 */
export async function uploadObject(input: {
  kind: StorageBucketKind;
  contentType: string;
  size: number;
  body: ArrayBuffer | Buffer | Uint8Array;
  isPublic?: boolean;
  objectName?: string;
}): Promise<{ path: string; bucket: string; publicUrl?: string }> {
  if (input.kind === "product_media") {
    if (!isProductMediaStorageConfigured()) {
      throw new ConfigurationError(
        "Product media storage is not configured. Set PRODUCT_MEDIA_STORAGE_BUCKET.",
      );
    }
  } else if (!isStorageConfigured()) {
    throw new ConfigurationError(
      "Object storage is not configured. Set Supabase URL, service role key, and bucket names.",
    );
  }

  const validated = input.objectName
    ? {
        contentType: input.contentType,
        size: input.size,
        extension: input.objectName.split(".").pop() ?? "bin",
        objectName: input.objectName,
      }
    : validateUploadFile({
        contentType: input.contentType,
        size: input.size,
        kind: input.kind,
      });
  const bucket = getBucketName(input.kind);

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await supabase.storage
    .from(bucket)
    .upload(validated.objectName, input.body, {
      contentType: validated.contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  let publicUrl: string | undefined;
  if (input.isPublic || input.kind === "product_media") {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(validated.objectName);
    publicUrl = data.publicUrl;
  }

  return { path: validated.objectName, bucket, publicUrl };
}

/** Signed URL for private objects (proofs, QR preview, auth docs). */
export async function createSignedUrl(input: {
  kind: StorageBucketKind;
  path: string;
  expiresInSeconds?: number;
}): Promise<string> {
  if (!isStorageConfigured()) {
    throw new ConfigurationError("Object storage is not configured.");
  }
  const bucket = getBucketName(input.kind);
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(input.path, input.expiresInSeconds ?? 300);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create signed URL");
  }
  return data.signedUrl;
}
