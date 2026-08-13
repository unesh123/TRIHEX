/**
 * Ensure Supabase storage buckets exist. Never prints secrets.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";

config({ path: ".env.local" });
normalizeEnvAliases();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL/SERVICE_ROLE MISSING");
    process.exit(1);
  }

  const buckets = [
    {
      name: process.env.PRODUCT_MEDIA_STORAGE_BUCKET || "product-media",
      public: true,
    },
    {
      name: process.env.PAYMENT_PROOF_STORAGE_BUCKET || "payment-proofs",
      public: false,
    },
    {
      name:
        process.env.PRIVATE_DOCUMENT_STORAGE_BUCKET || "private-documents",
      public: false,
    },
    {
      name: process.env.PAYMENT_QR_STORAGE_BUCKET || "payment-qr",
      public: false,
    },
  ];

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing, error: listError } =
    await supabase.storage.listBuckets();
  if (listError) {
    console.error("LIST_BUCKETS_FAILED", listError.message);
    process.exit(1);
  }
  const existingNames = new Set((existing ?? []).map((b) => b.name));

  for (const b of buckets) {
    if (existingNames.has(b.name)) {
      console.log("BUCKET_EXISTS", b.name, b.public ? "public" : "private");
      continue;
    }
    const { error } = await supabase.storage.createBucket(b.name, {
      public: b.public,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
      ],
    });
    if (error) {
      console.error("BUCKET_CREATE_FAILED", b.name, error.message);
      process.exit(1);
    }
    console.log("BUCKET_CREATED", b.name, b.public ? "public" : "private");
  }

  const { data: after } = await supabase.storage.listBuckets();
  console.log(
    "BUCKETS_FINAL",
    (after ?? []).map((b) => `${b.name}:${b.public ? "public" : "private"}`).join(","),
  );
}

main();
