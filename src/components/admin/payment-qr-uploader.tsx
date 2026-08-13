"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PaymentQrUploader({
  currentUrl,
}: {
  currentUrl: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/admin/payment-qr", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        url?: string;
      };
      if (!res.ok || !json.ok) {
        setMessage(json.error ?? "Upload failed");
        return;
      }
      setPreview(json.url ?? null);
      setMessage("QR saved. Checkout will use this image after refresh.");
      form.reset();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {preview ? (
        <div className="max-w-[240px] rounded-xl border border-border bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Current payment QR preview"
            className="h-auto w-full object-contain"
          />
        </div>
      ) : (
        <p className="text-sm text-text-muted">No uploaded QR yet — using static fallback.</p>
      )}

      <label className="block text-sm">
        <span className="font-medium text-text">Payee display name</span>
        <input
          name="payeeName"
          defaultValue="TRIHEX DIGITAL"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          required
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-text">Customer instructions (optional)</span>
        <textarea
          name="instructions"
          rows={3}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="Put your order number in payment remarks."
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-text">QR image (PNG / JPEG / WebP)</span>
        <input
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          className="mt-1 block w-full text-sm"
        />
      </label>

      <Button type="submit" disabled={busy}>
        {busy ? "Uploading…" : "Upload & publish QR"}
      </Button>
      {message ? <p className="text-sm text-text-muted">{message}</p> : null}
    </form>
  );
}
