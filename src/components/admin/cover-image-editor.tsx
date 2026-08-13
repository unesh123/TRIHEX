"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CoverImageEditor({
  productId,
  initialUrl,
  initialAlt,
}: {
  productId: string;
  initialUrl: string;
  initialAlt: string;
}) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [coverPath, setCoverPath] = useState(initialUrl);
  const [alt, setAlt] = useState(initialAlt);
  const [status, setStatus] = useState<"idle" | "uploading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFileChange(file: File | null) {
    if (!file) return;
    setStatus("uploading");
    setMessage("Uploading & publishing to storefront…");

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const data = new FormData();
      data.set("productId", productId);
      data.set("file", file);
      data.set("alt", alt || "Product cover");
      const res = await fetch("/api/admin/product-cover", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
        published?: boolean;
      };
      if (!res.ok || !json.ok || !json.url) {
        setStatus("error");
        setMessage(json.error ?? "Upload failed");
        setPreviewUrl(coverPath || initialUrl);
        return;
      }
      setCoverPath(json.url);
      setPreviewUrl(json.url);
      setStatus("ok");
      setMessage(
        json.published
          ? "Image live on the storefront ✓ (hard-refresh the shop if cached)."
          : "Image uploaded ✓ — click Save product below to publish.",
      );
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setStatus("error");
      setMessage("Network error during upload.");
      setPreviewUrl(coverPath || initialUrl);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--page-soft)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text)]">Product image</h3>
      <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
        Upload from your PC — the image is optimized, stored on Supabase, and
        published to the live shop immediately. You can still tweak alt text /
        URL and click Save product.
      </p>

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={alt || "Product cover preview"}
          className="h-48 w-48 rounded-xl border border-[var(--border)] bg-white object-contain"
        />
      ) : (
        <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white text-xs text-[var(--text-muted)]">
          No image
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={status === "uploading"}
          onClick={() => fileRef.current?.click()}
        >
          {status === "uploading" ? "Uploading…" : "Upload from PC"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {message ? (
        <p
          className={
            status === "ok"
              ? "text-xs font-medium text-[var(--success)]"
              : status === "error"
                ? "text-xs font-medium text-[var(--danger)]"
                : "text-xs text-[var(--text-muted)]"
          }
        >
          {message}
        </p>
      ) : null}

      <label className="block text-xs text-[var(--text-muted)]">
        Cover alt text
        <Input
          name="coverAlt"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          className="mt-1 bg-white"
        />
      </label>
      <label className="block text-xs text-[var(--text-muted)]">
        Cover URL
        <Input
          name="coverPath"
          value={coverPath}
          onChange={(e) => {
            setCoverPath(e.target.value);
            setPreviewUrl(e.target.value);
          }}
          className="mt-1 bg-white font-mono text-[11px]"
          placeholder="https://… or /media/covers/…"
        />
      </label>
    </div>
  );
}
