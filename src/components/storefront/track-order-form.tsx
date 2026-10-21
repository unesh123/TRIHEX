"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  LockKeyhole,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
  Crown,
  Zap,
  Phone,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Receipt,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/storefront/order-timeline";
import { formatNpr } from "@/lib/money";
import { buildCustomerTimeline } from "@/lib/orders/fulfillment-checklist";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  readGuestOrders,
  type GuestOrderRecord,
} from "@/lib/storefront/guest-orders";

interface TrackOrderFormProps {
  initialOrderNumber?: string;
  initialPhone?: string;
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

interface VipStatusResult {
  isVip: boolean;
  tier: string;
  tierName: string;
  vipTag: "VIP" | "PRO" | "STARTER" | "NORMAL";
  tagMeta: {
    label: string;
    shortLabel: string;
    glow: string;
    border: string;
    badgeBg: string;
    chipClass: string;
    icon: string;
  } | null;
  status: string;
  name: string;
  expiresAt: string | null;
  isLifetime: boolean;
  verificationToken?: string;
  totalOrders?: number;
  totalSpentNpr?: number;
}

interface OrderSummaryItem {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalNprMinor: number;
  createdAt: string;
  whatsappDelivered?: boolean;
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

export function TrackOrderForm({
  initialOrderNumber = "",
  initialPhone = "",
}: TrackOrderFormProps) {
  const [activeTab, setActiveTab] = useState<"phone" | "orderNumber">(
    initialPhone ? "phone" : initialOrderNumber ? "orderNumber" : "phone",
  );
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [vipResult, setVipResult] = useState<VipStatusResult | null>(null);
  const [phoneOrders, setPhoneOrders] = useState<OrderSummaryItem[]>([]);
  const [deviceOrders, setDeviceOrders] = useState<GuestOrderRecord[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const id = window.setTimeout(() => setDeviceOrders(readGuestOrders()), 0);
    return () => window.clearTimeout(id);
  }, []);

  // Auto trigger lookup if phone param was passed in URL
  useEffect(() => {
    if (initialPhone && initialPhone.trim().length >= 7) {
      handleTrackByPhone(initialPhone.trim());
    }
  }, [initialPhone]);

  async function handleTrackByPhone(targetPhone: string) {
    setError(null);
    setResult(null);
    setVipResult(null);
    setPhoneOrders([]);
    setLoading(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: targetPhone.trim() }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error ?? "No orders or VIP clearance found for this mobile number.");
        return;
      }

      if (data.vip) {
        setVipResult(data.vip);
      }
      if (Array.isArray(data.orders)) {
        setPhoneOrders(data.orders);
      }
      if (data.latestOrder) {
        setResult({
          ...data.latestOrder,
          timeline: data.timeline ?? [],
        });
      }
    } catch {
      setError("Unable to connect to order tracking gateway. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (activeTab === "phone") {
      if (!phone || phone.trim().length < 7) {
        setError("Please enter a valid Nepali mobile number (e.g. 98XXXXXXXX).");
        return;
      }
      return handleTrackByPhone(phone);
    }

    // Order number mode
    if (!orderNumber.trim()) {
      setError("Please enter your order number (e.g. THX-YYMMDD-XXXXXX).");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError("Enter the email or Nepali mobile number used at checkout.");
      return;
    }

    setResult(null);
    setVipResult(null);
    setPhoneOrders([]);
    setLoading(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim().toUpperCase(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok || !data.order) {
        setError(data.error ?? "Unable to find that order. Check the details and try again.");
        return;
      }

      setResult({ ...data.order, timeline: data.timeline ?? [] });
      if (data.vip) {
        setVipResult(data.vip);
      }
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
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                Live Customer Intelligence
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                Track Order &amp; VIP Status.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                Track everything through the site using just the mobile number you provided during checkout or VIP activation.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-soft)] px-3 py-2 text-xs font-bold text-[var(--primary)]">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Encrypted lookup
            </span>
          </div>

          {/* Mode Tabs: Phone vs Order Number */}
          <div className="mt-6 flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("phone")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "phone"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>📱 Track by Mobile Number (Instant)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orderNumber")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "orderNumber"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>🧾 Order Number</span>
            </button>
          </div>

          {/* Tab Inputs */}
          {activeTab === "phone" ? (
            <div className="mt-4">
              <label className="block text-sm">
                <span className="font-semibold text-[var(--text)]">
                  Your Nepali Mobile Number *
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="e.g. 98XXXXXXXX"
                  className="mt-2 h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3.5 font-mono text-sm tracking-wide text-[var(--text)] outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                />
              </label>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                Shows your active VIP tag (VIP Elite, Pro, Starter), clearance expiration, and all recent orders.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="font-semibold text-[var(--text)]">Order number *</span>
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
          )}

          {error ? (
            <p role="alert" className="mt-4 rounded-xl bg-[var(--danger-soft)] px-3.5 py-3 text-sm font-medium text-[var(--danger)]">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={loading} className="mt-5 w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            {loading ? "Checking Status & Clearance…" : activeTab === "phone" ? "Track VIP & Orders" : "Track Order"}
          </Button>
        </form>

        {/* 1. VIP Identity & Clearance Card (Shows when phone lookup or VIP detected) */}
        <AnimatePresence>
          {vipResult && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`relative overflow-hidden rounded-[1.5rem] border-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl ${
                vipResult.vipTag === "VIP"
                  ? "border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                  : vipResult.vipTag === "PRO"
                  ? "border-cyan-400/90 shadow-[0_0_30px_rgba(6,182,212,0.25)]"
                  : vipResult.vipTag === "STARTER"
                  ? "border-emerald-400/90 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                  : "border-slate-700"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      vipResult.vipTag === "VIP"
                        ? "bg-amber-400/20 text-amber-300"
                        : vipResult.vipTag === "PRO"
                        ? "bg-cyan-400/20 text-cyan-300"
                        : "bg-emerald-400/20 text-emerald-300"
                    }`}
                  >
                    {vipResult.vipTag === "VIP" ? (
                      <Crown className="h-6 w-6" />
                    ) : vipResult.vipTag === "PRO" ? (
                      <Zap className="h-6 w-6" />
                    ) : (
                      <ShieldCheck className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-black uppercase font-mono tracking-wider ${
                        vipResult.vipTag === "VIP"
                          ? "bg-amber-400 text-slate-950 font-bold"
                          : vipResult.vipTag === "PRO"
                          ? "bg-cyan-400 text-slate-950 font-bold"
                          : "bg-emerald-400 text-slate-950 font-bold"
                      }`}
                    >
                      {vipResult.tagMeta?.label || "TRIHEX VERIFIED"}
                    </span>
                    <h3 className="mt-1 font-[family-name:var(--font-sora)] text-xl font-bold text-white">
                      {vipResult.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-bold ${
                      vipResult.status === "ACTIVE"
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                    <span>STATUS: {vipResult.status.replaceAll("_", " ")}</span>
                  </span>
                </div>
              </div>

              {/* VIP Clearance Details Grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <span className="text-[10px] text-slate-400 font-sans block uppercase">Tier Plan:</span>
                  <strong className="text-amber-300 font-bold">{vipResult.tierName}</strong>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <span className="text-[10px] text-slate-400 font-sans block uppercase">Clearance Expiry:</span>
                  <strong className="text-white">
                    {vipResult.isLifetime ? "Permanent Lifetime" : vipResult.expiresAt ? new Date(vipResult.expiresAt).toLocaleDateString() : "Pending Activation"}
                  </strong>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <span className="text-[10px] text-slate-400 font-sans block uppercase">Orders Placed:</span>
                  <strong className="text-emerald-400 font-bold">{vipResult.totalOrders ?? 1} Order(s)</strong>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <span className="text-[10px] text-slate-400 font-sans block uppercase">Security Token:</span>
                  <strong className="text-slate-300 truncate block text-[11px]">{vipResult.verificationToken || "THX-VERIFIED"}</strong>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <p className="text-xs text-slate-400">
                  {vipResult.status === "ACTIVE"
                    ? "Your VIP tag is active. You have full clearance to the private tools, VIP vault, and founder desk."
                    : "Your Bank QR payment is under review by administrator. Send your screenshot on WhatsApp for instant clearance."}
                </p>
                <div className="flex gap-2">
                  <Button href="/vip" variant="secondary" size="sm">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                    VIP Zone
                  </Button>
                  <Button
                    href={buildWhatsAppUrl(`Hello Trix, I am tracking my VIP Clearance for mobile ${phone || vipResult.name}.`)}
                    external
                    variant="outline"
                    size="sm"
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    WhatsApp Desk
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. List of Orders matching Mobile Phone */}
        {phoneOrders.length > 0 && (
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-soft sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-[var(--text)]">
                Orders for this Mobile Number ({phoneOrders.length})
              </h3>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                Click any order to view its timeline
              </span>
            </div>

            <div className="grid gap-2.5">
              {phoneOrders.map((ord) => (
                <button
                  key={ord.orderNumber}
                  type="button"
                  onClick={() => {
                    setOrderNumber(ord.orderNumber);
                    setActiveTab("orderNumber");
                    onSubmit({ preventDefault: () => {} } as any);
                  }}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition hover:border-[var(--primary)] hover:bg-[var(--page-soft)] cursor-pointer ${
                    result?.orderNumber === ord.orderNumber
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-white"
                  }`}
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-[var(--primary)]">
                      {ord.orderNumber}
                    </span>
                    <span className="block text-xs text-[var(--text-muted)] mt-0.5">
                      Placed: {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs font-mono text-[var(--text)]">
                      {formatNpr(ord.totalNprMinor)}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        ord.status === "FULFILLED" || ord.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ord.status.replaceAll("_", " ")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Detailed Order Timeline */}
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
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Order reference
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                    {result.orderNumber}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Total {formatNpr(result.totalNprMinor)} · Payment {result.paymentStatus.replaceAll("_", " ").toLowerCase()}
                  </p>
                </div>
                <span className={`rounded-xl px-3 py-2 text-xs font-bold ${currentStatus.tone}`}>
                  {currentStatus.label}
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-[var(--page-soft)] p-4">
                <div className="flex gap-3">
                  <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {currentStatus.detail}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                  Delivery timeline
                </p>
                <div className="mt-4">
                  <OrderTimeline steps={steps} />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {result.secureToken ? (
                  <Button href={`/orders/${result.secureToken}`} variant="secondary">
                    Open secure order page
                  </Button>
                ) : null}
                <Button
                  href={buildWhatsAppUrl(`Hello TRIHEX DIGITAL, I need help with order ${result.orderNumber}.`)}
                  external
                  variant="outline"
                >
                  <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Ask about this order
                </Button>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Right Column: Device Orders */}
      <aside className="h-fit rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-[var(--text)]">On this device</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              Orders placed on this device are saved locally for quick 1-click tracking.
            </p>
          </div>
        </div>
        {deviceOrders.length === 0 ? (
          <p className="mt-5 rounded-xl bg-[var(--page-soft)] p-3 text-xs leading-relaxed text-[var(--text-muted)]">
            No local orders yet. Orders placed on this device will appear here.
          </p>
        ) : (
          <ul className="mt-5 space-y-2">
            {deviceOrders.slice(0, 8).map((order) => (
              <li key={order.orderNumber}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-left transition hover:border-[var(--primary)]/45 hover:bg-[var(--page-soft)] cursor-pointer"
                  onClick={() => {
                    setOrderNumber(order.orderNumber);
                    setActiveTab("orderNumber");
                  }}
                >
                  <span className="font-mono text-xs font-bold text-[var(--primary)]">
                    {order.orderNumber}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--text-muted)]">
                    {formatNpr(order.totalNprMinor)} · {order.orderStatus.replaceAll("_", " ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button href="/account/orders" variant="outline" size="sm" className="mt-5 w-full">
          All device orders
        </Button>
      </aside>
    </div>
  );
}
