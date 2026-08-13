"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/storefront/account-shell";
import { Button } from "@/components/ui/button";
import { formatNpr } from "@/lib/money";
import {
  readGuestOrders,
  type GuestOrderRecord,
} from "@/lib/storefront/guest-orders";

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<GuestOrderRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setOrders(readGuestOrders());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <AccountShell
      title="Your orders"
      description="Orders placed on this device are saved here — no login required. Use Track order for live server status."
    >
      {!ready ? (
        <p className="text-sm text-[var(--text-muted)]">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white px-5 py-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No orders saved on this device yet. After checkout, your order number
            and status appear here automatically.
          </p>
          <Button href="/products" className="mt-4">
            Shop products
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.orderNumber}
              className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-[var(--primary)]">
                    {o.orderNumber}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text)]">
                    {o.itemsSummary || "Order"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {new Date(o.placedAt).toLocaleString("en-NP")} ·{" "}
                    {o.paymentMethod.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatNpr(o.totalNprMinor)}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {o.orderStatus} · {o.paymentStatus}
                  </p>
                  {o.proofUploaded ? (
                    <p className="text-xs text-[var(--success)]">
                      Screenshot uploaded
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.secureToken ? (
                  <Button
                    href={`/orders/${o.secureToken}`}
                    size="sm"
                    variant="secondary"
                  >
                    Order timeline
                  </Button>
                ) : null}
                <Button
                  href={`/track-order?orderNumber=${encodeURIComponent(o.orderNumber)}`}
                  size="sm"
                  variant="outline"
                >
                  Track status
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-[var(--text-muted)]">
        Tip: orders stay on <strong>this phone/browser</strong>. Clearing site
        data removes the local list — keep your order number or{" "}
        <Link href="/track-order" className="text-[var(--primary)] hover:underline">
          track with email/phone
        </Link>
        .
      </p>
    </AccountShell>
  );
}
