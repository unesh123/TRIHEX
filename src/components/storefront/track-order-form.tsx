"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/storefront/order-timeline";
import { formatNpr } from "@/lib/money";
import { buildCustomerTimeline } from "@/lib/orders/fulfillment-checklist";
import {
  readGuestOrders,
  type GuestOrderRecord,
} from "@/lib/storefront/guest-orders";

interface TrackOrderFormProps {
  initialOrderNumber?: string;
}

interface TrackResult {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalNprMinor: number;
  secureToken?: string;
  whatsappDelivered?: boolean;
  deliveredAt?: string | null;
  timeline: {
    at: string;
    status: string;
    message: string;
    done?: boolean;
    active?: boolean;
  }[];
}

export function TrackOrderForm({ initialOrderNumber = "" }: TrackOrderFormProps) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [deviceOrders, setDeviceOrders] = useState<GuestOrderRecord[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDeviceOrders(readGuestOrders());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        order?: TrackResult;
        timeline?: TrackResult["timeline"];
      };
      if (!res.ok || !data.ok || !data.order) {
        setError(data.error ?? "Unable to track order.");
        return;
      }
      setResult({
        ...data.order,
        timeline: data.timeline ?? [],
      });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const steps = result
    ? buildCustomerTimeline({
        createdAt: result.timeline[0]?.at ?? new Date().toISOString(),
        paymentStatus: result.paymentStatus,
        orderStatus: result.status,
        whatsappDelivered: Boolean(result.whatsappDelivered),
        deliveredAt: result.deliveredAt ?? null,
      })
    : [];

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-lg border border-border bg-surface/60 p-5"
        >
          <label className="block text-sm">
            <span className="text-text-muted">Order number</span>
            <input
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="THX-YYMMDD-XXXXXX"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-text"
            />
          </label>
          <label className="block text-sm">
            <span className="text-text-muted">Email used at checkout</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-text"
            />
          </label>
          <p className="text-center text-xs text-text-muted">or</p>
          <label className="block text-sm">
            <span className="text-text-muted">Phone used at checkout</span>
            <input
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-text"
            />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Looking up…" : "Track order"}
          </Button>
        </form>

        {result ? (
          <div className="rounded-lg border border-border bg-surface-raised/60 p-5">
            <h2 className="font-semibold text-text">{result.orderNumber}</h2>
            <p className="mt-1 text-sm text-text-muted">
              Total {formatNpr(result.totalNprMinor)} · Payment:{" "}
              {result.paymentStatus}
            </p>
            <div className="mt-5">
              <OrderTimeline steps={steps} />
            </div>
            {result.secureToken ? (
              <Button
                href={`/orders/${result.secureToken}`}
                variant="secondary"
                className="mt-4"
              >
                Open secure order page
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <aside className="h-fit rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[var(--text)]">
          On this device
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Recent orders saved without login.
        </p>
        {deviceOrders.length === 0 ? (
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            No local orders yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {deviceOrders.slice(0, 8).map((o) => (
              <li key={o.orderNumber}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-left text-xs hover:border-[var(--primary)]"
                  onClick={() => setOrderNumber(o.orderNumber)}
                >
                  <span className="font-mono text-[var(--primary)]">
                    {o.orderNumber}
                  </span>
                  <span className="mt-0.5 block text-[var(--text-muted)]">
                    {formatNpr(o.totalNprMinor)} · {o.orderStatus}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button
          href="/account/orders"
          variant="outline"
          size="sm"
          className="mt-4 w-full"
        >
          All device orders
        </Button>
      </aside>
    </div>
  );
}
