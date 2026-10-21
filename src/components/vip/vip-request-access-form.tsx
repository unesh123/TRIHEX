"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Crown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  Smartphone,
  CreditCard,
  MessageCircle,
  AlertCircle,
  Copy,
  Check,
  User,
} from "lucide-react";
import type { StorefrontUser } from "@/lib/auth/user-session";
import type { VipMember } from "@/lib/vip/vip-member-store";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { STOREFRONT_BANK_QR_PATH } from "@/lib/payments/storefront-payment";
import { PaymentQrCard } from "@/components/storefront/payment-qr-card";

interface VipRequestAccessFormProps {
  user: StorefrontUser;
  existingMember: VipMember | null;
  qrSrc?: string | null;
}

export function VipRequestAccessForm({
  user,
  existingMember,
  qrSrc,
}: VipRequestAccessFormProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<"1_MONTH" | "6_MONTHS" | "LIFETIME">("6_MONTHS");
  const [phone, setPhone] = useState(user.phone || existingMember?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState<"BANK_QR" | "ESEWA" | "KHALTI">("BANK_QR");
  const [paymentReference, setPaymentReference] = useState("");
  const [payerName, setPayerName] = useState(user.fullName || "");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<boolean>(
    existingMember?.status === "PENDING_VERIFICATION" &&
      Boolean(existingMember.phone && existingMember.phone.length >= 7)
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const customerCode =
    user.customerCode ||
    existingMember?.verificationToken ||
    `THX-USR-${user.email ? user.email.slice(0, 4).toUpperCase() : "9702"}`;

  const priceMap = {
    "1_MONTH": { npr: 3999, label: "1 Month VIP Pass", duration: "30 Days Access" },
    "6_MONTHS": { npr: 5999, label: "6 Months VIP Pass", duration: "180 Days Access (Best Value)" },
    "LIFETIME": { npr: 7999, label: "Permanent Lifetime VIP", duration: "Zero Expiry · All Future Toolkits" },
  };

  const currentPrice = priceMap[selectedTier];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(customerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(key);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const waConfirmUrl = buildWhatsAppUrl(
    `Hello Trix (Admin)! I have completed payment for TRIHEX VIP Vault.\n\n` +
    `User ID: ${customerCode}\n` +
    `Name: ${user.fullName || payerName}\n` +
    `Email: ${user.email}\n` +
    `Mobile: ${phone}\n` +
    `Selected Plan: ${currentPrice.label} (Rs. ${currentPrice.npr.toLocaleString()})\n` +
    `Payment Ref: ${paymentReference || "Direct Bank QR"}\n\n` +
    `Please confirm my payment and activate my VIP Vault access!`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid mobile / WhatsApp number.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/vip/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          phone: phone.trim(),
          email: user.email,
          name: user.fullName || payerName.trim(),
          paymentMethod,
          paymentReference: paymentReference.trim(),
          payerName: payerName.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessStatus(true);
        // Open WhatsApp directly to Trix with pre-filled details
        window.open(waConfirmUrl, "_blank");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to submit VIP access request.");
      }
    } catch {
      setErrorMsg("Connection error while requesting VIP access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900/95 p-6 sm:p-10 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-slate-100 backdrop-blur-xl">
      {/* Glow highlight */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-amber-500/20 blur-3xl" />

      {/* Header */}
      <div className="relative text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Crown className="h-4 w-4 text-amber-400" />
          <span>TRIHEX VIP CLEARANCE ACTIVATION</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Request Access for VIP
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Logged in with Google as <strong className="text-white">{user.fullName}</strong> (<span className="text-amber-300 font-mono">{user.email}</span>).
        </p>

        {/* Customer User ID Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-slate-950/90 px-4 py-2 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">
            Your Customer User ID:
          </span>
          <span className="font-mono font-black text-amber-300 text-sm tracking-wide">
            {customerCode}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
          >
            {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedCode ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Success / Pending State */}
      {successStatus ? (
        <div className="mt-8 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/30 p-6 sm:p-8 text-center space-y-4 shadow-[0_0_35px_rgba(245,158,11,0.2)] animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-300">
            <Clock className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300 border border-amber-400/40">
              STATUS: PENDING ADMIN APPROVAL
            </span>
            <h3 className="mt-3 text-xl font-bold text-white">
              VIP Request Registered &amp; Queued for Activation
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Your request for <strong className="text-amber-300">{existingMember?.tierName || currentPrice.label}</strong> has been transmitted directly to the Admin Desk under User ID <strong className="text-amber-300 font-mono">{customerCode}</strong>.
            </p>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Trix is verifying your payment slip on WhatsApp and will activate your 👑 <strong className="text-amber-300">VIP Tag</strong> in the system. The complete Vault directory will unlock automatically.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={waConfirmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition hover:scale-105 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Confirm on WhatsApp for Fast Clearance</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              Refresh Status
            </button>
            <button
              type="button"
              onClick={() => setSuccessStatus(false)}
              className="w-full sm:w-auto rounded-xl border border-amber-500/40 bg-amber-950/40 px-5 py-3.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/60 transition cursor-pointer"
            >
              Edit Payment Slip / Plan
            </button>
          </div>
        </div>
      ) : (
        /* The Bold Request Form with Exact Product Checkout QR Card */
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* 1. Plan Tier Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
              1. Select VIP Membership Clearance Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["1_MONTH", "6_MONTHS", "LIFETIME"] as const).map((tierKey) => {
                const info = priceMap[tierKey];
                const isSelected = selectedTier === tierKey;
                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setSelectedTier(tierKey)}
                    className={`relative flex flex-col justify-between rounded-2xl p-4 text-left transition duration-200 border cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-gradient-to-b from-amber-950/60 to-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{info.label}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">{info.duration}</p>
                    </div>
                    <div className="mt-3">
                      <span className="text-lg font-black text-amber-300 font-mono">
                        Rs. {info.npr.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Official Payment Gateway — Exact QR Card Used in Product Checkout */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                2. Official Payment Gateway (Scan to Pay)
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Instant Fonepay / eSewa / Bank QR
              </span>
            </div>

            {/* Account Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <span className="text-slate-400">Account / eSewa ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-sm">9801970291</span>
                  <button
                    type="button"
                    onClick={() => handleCopy("9801970291", "esewa")}
                    className="text-amber-400 hover:text-amber-300 p-1 cursor-pointer"
                    title="Copy eSewa ID"
                  >
                    {copiedAccount === "esewa" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <span className="text-slate-400">Recipient Name:</span>
                <span className="font-bold text-white">Unesh Bastola (TRIHEX)</span>
              </div>
            </div>

            {/* Exact Checkout Payment QR Card */}
            <div className="overflow-hidden rounded-2xl text-slate-900">
              <PaymentQrCard
                amountMinor={currentPrice.npr * 100}
                qrSrc={qrSrc}
                orderNumber={`VIP-${selectedTier}-${phone ? phone.slice(-4) : customerCode.slice(-4)}`}
              />
            </div>
          </div>

          {/* 3. Customer Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Your Mobile / WhatsApp Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9801970291"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Transaction Ref / UTR No. (Optional)
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. 19284729104 / eSewa slip code"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Big Bold CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 py-4 text-base font-black text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transition duration-200 hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              <Crown className="h-5 w-5" />
              <span className="tracking-wide">
                {loading ? "SUBMITTING VIP REQUEST…" : "COMPLETE PAYMENT & CONFIRM ON WHATSAPP"}
              </span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Admin will confirm payment slip and unlock the 👑 VIP Tag directly for your account.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
