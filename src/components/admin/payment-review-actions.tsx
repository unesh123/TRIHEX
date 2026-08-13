"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PaymentReviewActions({
  paymentId,
  orderHref,
}: {
  paymentId: string;
  orderHref: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"verify" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState(
    "Payment proof unclear — please resubmit.",
  );

  async function run(action: "verify" | "reject", reason?: string) {
    setBusy(action);
    setError(null);
    setDone(null);
    try {
      const body: Record<string, string> = { id: paymentId, action };
      if (action === "reject") {
        const trimmed = (reason ?? rejectReason).trim();
        if (!trimmed) {
          setError("Rejection reason is required.");
          setBusy(null);
          return;
        }
        body.rejectionReason = trimmed;
      }

      const res = await fetch("/api/payments/manual/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      let json: { ok?: boolean; error?: string } = {};
      try {
        json = (await res.json()) as typeof json;
      } catch {
        setError(`Server error (${res.status}). Try again.`);
        setBusy(null);
        return;
      }

      if (!res.ok || !json.ok) {
        setError(json.error ?? `Action failed (${res.status})`);
        setBusy(null);
        return;
      }

      setDone(action === "verify" ? "Payment approved." : "Payment rejected.");
      setRejectOpen(false);
      setBusy(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy != null}
          onClick={() => run("verify")}
        >
          {busy === "verify" ? "Approving…" : "Approve payment"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={busy != null}
          onClick={() => setRejectOpen((v) => !v)}
        >
          Reject
        </Button>
        <a
          href={orderHref}
          className="text-xs font-medium text-[var(--primary)] hover:underline"
        >
          View order →
        </a>
      </div>

      {rejectOpen ? (
        <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--page-soft)] p-3">
          <label className="block text-xs text-[var(--text-muted)]">
            Rejection reason
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={busy != null}
            onClick={() => run("reject")}
          >
            {busy === "reject" ? "Rejecting…" : "Confirm reject"}
          </Button>
        </div>
      ) : null}

      {done ? (
        <p className="text-xs font-medium text-[var(--success)]">{done}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      ) : null}
    </div>
  );
}
