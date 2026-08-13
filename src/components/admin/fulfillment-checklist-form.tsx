"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isFulfillmentComplete } from "@/lib/orders/fulfillment-checklist";

export function FulfillmentChecklistForm({
  orderId,
  initial,
}: {
  orderId: string;
  initial: {
    activated: boolean;
    emailSent: boolean;
    whatsappDelivered: boolean;
    notes: string | null;
    deliveredAt: string | null;
  };
}) {
  const router = useRouter();
  const [activated, setActivated] = useState(initial.activated);
  const [emailSent, setEmailSent] = useState(initial.emailSent);
  const [whatsappDelivered, setWhatsappDelivered] = useState(
    initial.whatsappDelivered,
  );
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const complete = isFulfillmentComplete({ whatsappDelivered });

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/fulfillment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId,
          activated,
          emailSent,
          whatsappDelivered,
          notes,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Could not save checklist.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Fulfillment checklist
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Order is complete only when WhatsApp delivery is checked.
          </p>
        </div>
        <span
          className={
            complete
              ? "rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--success)]"
              : "rounded-full bg-[var(--warning-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--warning)]"
          }
        >
          {complete ? "Delivered" : "To deliver"}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={activated}
            onChange={(e) => setActivated(e.target.checked)}
          />
          Package activated / credentials ready
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={emailSent}
            onChange={(e) => setEmailSent(e.target.checked)}
          />
          Confirmation email sent
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={whatsappDelivered}
            onChange={(e) => setWhatsappDelivered(e.target.checked)}
          />
          Delivered on WhatsApp (required)
        </label>
        <label className="block text-xs text-[var(--text-muted)]">
          Fulfillment notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            placeholder="Account email used, redeem code sent, etc."
          />
        </label>
        {initial.deliveredAt ? (
          <p className="text-xs text-[var(--text-muted)]">
            Delivered at {new Date(initial.deliveredAt).toLocaleString("en-NP")}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save checklist"}
        </Button>
        {saved ? (
          <span className="text-xs font-medium text-[var(--success)]">Saved</span>
        ) : null}
        {error ? (
          <span className="text-xs text-[var(--danger)]">{error}</span>
        ) : null}
      </div>
    </section>
  );
}
