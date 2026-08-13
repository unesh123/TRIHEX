"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LockKeyhole, PackageCheck, Search, ShieldCheck } from "lucide-react";
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

const statusCopy: Record<string, { label: string; detail: string; tone: string }> = {
  AWAITING_PAYMENT: {
    label: "Awaiting payment",
    detail: "Complete your selected payment method, then upload proof from your secure order page.",
    tone: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  PROCESSING: {
    label: "Payment or fulfillment in progress",
    detail: "TRIHEX is reviewing payment or preparing the next fulfillment step.",
    tone: "bg-[var(--primary-soft)] text-[var(--primary)]",
  },
  PAID: {
    label: "Payment confirmed",
    detail: "Your payment is confirmed and fulfillment can proceed.",
    tone: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  FULFILLED: {
    label: "Delivered",
    detail: "Your order has been marked delivered. Use support if anything needs attention.",
    tone: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  CANCELLED: {
    label: "Cancelled",
    detail: "This order is not progressing. Check the secure order page or contact support for the next step.",
    tone: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
};

function getStatusCopy(status: string) {
  return statusCopy[status] ?? {
    label: status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
    detail: "Your order is recorded. The timeline below shows the latest customer-visible steps.",
    tone: "bg-[var(--primary-soft)] text-[var(--primary)]",
  };
}

export function TrackOrderForm({ initialOrderNumber = "" }: TrackOrderFormProps) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [deviceOrders, setDeviceOrders] = useState<GuestOrderRecord[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const id = window.setTimeout(() => setDeviceOrders(readGuestOrders()), 0);
    return () => window.clearTimeout(id);
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim().toUpperCase(),
          email: email || undefined,
          phone: phone || undefined,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        order?: TrackResult;
        timeline?: TrackResult["timeline"];
      };
      if (!response.ok || !data.ok || !data.order) {
        setError(data.error ?? "Unable to find that order. Check the details and try again.");
        return;
      }
      setResult({ ...data.order, timeline: data.timeline ?? [] });
    } catch {
      setError("We could not reach order tracking just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const steps = useMemo(
    () =>
      result
        ? buildCustomerTimeline({
            createdAt: result.timeline[0]?.at ?? new Date().toISOString(),
            paymentStatus: result.paymentStatus,
            orderStatus: result.status,
            whatsappDelivered: Boolean(result.whatsappDelivered),
            deliveredAt: result.deliveredAt ?? null,
          })
        : [],
    [result],
  );
  const currentStatus = result ? getStatusCopy(result.status) : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <form
          onSubmit={onSubmit}
          className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-soft sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Secure lookup</p>
              <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">Find your exact order.</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">Use your order number together with the email or Nepali mobile number used at checkout. This protects your payment and fulfillment information.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-soft)] px-3 py-2 text-xs font-bold text-[var(--primary)]">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Private order status
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="font-semibold text-[var(--text)]">Order number</span>
              <input
                required
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                placeholder="THX-YYMMDD-XXXXXX"
                className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3.5 font-mono text-sm tracking-wide text-[var(--text)] outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-[var(--text)]">Checkout email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3.5 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-[var(--text)]">or Nepali mobile</span>
              <input
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="98XXXXXXXX"
                className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3.5 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
              />
            </label>
          </div>

          {error ? (
            <p role="alert" className="mt-4 rounded-xl bg-[var(--danger-soft)] px-3.5 py-3 text-sm font-medium text-[var(--danger)]">{error}</p>
          ) : null}
          <Button type="submit" size="lg" disabled={loading} className="mt-5 w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            {loading ? "Checking order…" : "Track order"}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {result && currentStatus ? (
            <motion.section
              key={result.orderNumber}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-soft sm:p-7"
              aria-live="polite"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Order reference</p>
                  <h2 className="mt-1 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">{result.orderNumber}</h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Total {formatNpr(result.totalNprMinor)} · Payment {result.paymentStatus.replaceAll("_", " ").toLowerCase()}</p>
                </div>
                <span className={`rounded-xl px-3 py-2 text-xs font-bold ${currentStatus.tone}`}>{currentStatus.label}</span>
              </div>
              <div className="mt-5 rounded-2xl bg-[var(--page-soft)] p-4">
                <div className="flex gap-3">
                  <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{currentStatus.detail}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Delivery timeline</p>
                <div className="mt-4"><OrderTimeline steps={steps} /></div>
              </div>
              {result.secureToken ? (
                <Button href={`/orders/${result.secureToken}`} variant="secondary" className="mt-6">
                  Open secure order page
                </Button>
              ) : null}
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>

      <aside className="h-fit rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 className="font-semibold text-[var(--text)]">On this device</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">Recent order references are stored only in this browser to make repeat tracking faster.</p>
          </div>
        </div>
        {deviceOrders.length === 0 ? (
          <p className="mt-5 rounded-xl bg-[var(--page-soft)] p-3 text-xs leading-relaxed text-[var(--text-muted)]">No local orders yet. Your order reference will appear here after checkout on this device.</p>
        ) : (
          <ul className="mt-5 space-y-2">
            {deviceOrders.slice(0, 8).map((order) => (
              <li key={order.orderNumber}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-left transition hover:border-[var(--primary)]/45 hover:bg-[var(--page-soft)]"
                  onClick={() => setOrderNumber(order.orderNumber)}
                >
                  <span className="font-mono text-xs font-bold text-[var(--primary)]">{order.orderNumber}</span>
                  <span className="mt-1 block text-xs text-[var(--text-muted)]">{formatNpr(order.totalNprMinor)} · {order.orderStatus.replaceAll("_", " ")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button href="/account/orders" variant="outline" size="sm" className="mt-5 w-full">All device orders</Button>
      </aside>
    </div>
  );
}
