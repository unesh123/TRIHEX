"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const OPTIONS = [
  {
    value: "PUBLIC",
    label: "PUBLIC — live on shop",
  },
  {
    value: "DRAFT",
    label: "DRAFT — under review (Check Availability)",
  },
  {
    value: "BLOCKED",
    label: "BLOCKED — shows unavailable",
  },
  {
    value: "ARCHIVED",
    label: "ARCHIVED — hidden from shop",
  },
] as const;

export function ProductStatusControl({
  productId,
  initialStatus,
}: {
  productId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // Keep local select in sync when server props change after refresh
    const id = window.setTimeout(() => setStatus(initialStatus), 0);
    return () => window.clearTimeout(id);
  }, [initialStatus]);

  async function saveStatus(next: string) {
    setError("");
    setMessage("");
    setStatus(next);

    try {
      const res = await fetch("/api/admin/product-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, productStatus: next }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Status save failed");
        setStatus(initialStatus);
        return;
      }
      setMessage(json.message ?? "Status saved");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Network error — status not saved");
      setStatus(initialStatus);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs text-[var(--text-muted)]">
        Storefront status
        <select
          value={status}
          disabled={pending}
          onChange={(e) => void saveStatus(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm disabled:opacity-60"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
        Changing status saves immediately. Under review turns off Buy Now and
        shows <strong>Check Availability</strong> on the shop.
      </p>
      {pending ? (
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          Saving status…
        </p>
      ) : null}
      {message ? (
        <p className="text-xs font-medium text-[var(--success)]">{message}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-[var(--danger)]">{error}</p>
      ) : null}
    </div>
  );
}
