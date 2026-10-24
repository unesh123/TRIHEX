"use client";

import { useState, useRef } from "react";
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
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  RefreshCw,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTier, setSelectedTier] = useState<"1_MONTH" | "6_MONTHS" | "LIFETIME">("6_MONTHS");
  const [phone, setPhone] = useState(user.phone || existingMember?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState<"BANK_QR" | "ESEWA" | "KHALTI">("BANK_QR");
  const [paymentReference, setPaymentReference] = useState("");
  const [payerName, setPayerName] = useState(user.fullName || "");
  const [notes, setNotes] = useState("");

  // Payment Proof Screenshot state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<string | null>(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);
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

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    if (!file) {
      setProofFile(null);
      setProofPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setErrorMsg("Please upload an image file (PNG, JPG, WEBP) or PDF payment slip.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("File size must be under 15MB.");
      return;
    }

    setErrorMsg(null);
    setProofFile(file);

    if (file.type.startsWith("image/")) {
      const preview = URL.createObjectURL(file);
      setProofPreviewUrl(preview);
    } else {
      setProofPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

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

  const handleCopyOrderNumber = (ordNum: string) => {
    navigator.clipboard.writeText(ordNum);
    setCopiedOrderNumber(true);
    setTimeout(() => setCopiedOrderNumber(false), 2000);
  };

  const getWaConfirmUrl = (ordNum?: string | null) => {
    const orderRefText = ordNum ? `Order #: ${ordNum}\n` : "";
    const proofNote = proofFile ? `Payment Slip: Attached in order (${proofFile.name})\n` : "";
    const remarksNote = notes ? `Remarks: ${notes}\n` : "";

    return buildWhatsAppUrl(
      `Hello Trix (Admin)! I have completed payment for TRIHEX VIP Vault.\n\n` +
      `${orderRefText}` +
      `User ID: ${customerCode}\n` +
      `Name: ${user.fullName || payerName}\n` +
      `Email: ${user.email}\n` +
      `Mobile: ${phone}\n` +
      `Selected Plan: ${currentPrice.label} (Rs. ${currentPrice.npr.toLocaleString()})\n` +
      `Payment Method: ${paymentMethod}\n` +
      `Payment Ref / ID: ${paymentReference || "Direct Bank QR"}\n` +
      `${remarksNote}` +
      `${proofNote}\n` +
      `Please verify my payment screenshot and activate my VIP Vault access!`
    );
  };

  const waConfirmUrl = getWaConfirmUrl(submittedOrderNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid mobile / WhatsApp number.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.set("tier", selectedTier);
      formData.set("phone", phone.trim());
      formData.set("email", user.email);
      formData.set("name", user.fullName || payerName.trim());
      formData.set("paymentMethod", paymentMethod);
      formData.set("paymentReference", paymentReference.trim());
      formData.set("payerName", payerName.trim());
      formData.set("notes", notes.trim());

      if (proofFile) {
        formData.set("proof", proofFile);
      }

      const res = await fetch("/api/vip/request-access", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        if (data.orderNumber) {
          setSubmittedOrderNumber(data.orderNumber);
        }
        setSuccessStatus(true);

        // Open WhatsApp directly to Trix with pre-filled details including Order # & Proof Status
        const exactWaUrl = getWaConfirmUrl(data.orderNumber);
        window.open(exactWaUrl, "_blank");
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
          Request Access for VIP Vault
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

            {/* Order & User ID Details Box */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-slate-950/80 px-3.5 py-1.5 text-xs">
                <span className="text-slate-400 font-semibold uppercase">Customer User ID:</span>
                <span className="font-mono font-black text-amber-300">{customerCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
                >
                  {copiedCode ? "Copied" : "Copy"}
                </button>
              </div>

              {submittedOrderNumber && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-950/80 px-3.5 py-1.5 text-xs">
                  <span className="text-slate-400 font-semibold uppercase">Order #:</span>
                  <span className="font-mono font-black text-cyan-300">{submittedOrderNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderNumber(submittedOrderNumber)}
                    className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer"
                  >
                    {copiedOrderNumber ? "Copied" : "Copy"}
                  </button>
                </div>
              )}

              {proofFile && (
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-300 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Payment Screenshot Attached</span>
                </div>
              )}
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
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
              Submit Another Slip / Update
            </button>
          </div>
        </div>
      ) : (
        /* The Complete VIP Checkout Form with Payment Screenshot Upload */
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

          {/* 2. Official Payment Gateway & QR Code */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                2. Official Payment Gateway (Scan to Pay)
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Instant Fonepay / eSewa / Bank QR
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("BANK_QR")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                  paymentMethod === "BANK_QR"
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-950/40"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Bank / Fonepay QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("ESEWA")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                  paymentMethod === "ESEWA"
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950/40"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>eSewa Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("KHALTI")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                  paymentMethod === "KHALTI"
                    ? "bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-950/40"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Khalti Wallet</span>
              </button>
            </div>

            {/* Account Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <span className="text-slate-400">Account / Wallet ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-sm">9801970291</span>
                  <button
                    type="button"
                    onClick={() => handleCopy("9801970291", "account")}
                    className="text-amber-400 hover:text-amber-300 p-1 cursor-pointer"
                    title="Copy Account Number"
                  >
                    {copiedAccount === "account" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
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

          {/* 3. Customer Verification Details: Phone, Payment ID, Remarks */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              3. Payment Verification &amp; Account Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Mobile / WhatsApp Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9801970291 / 9840978295"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                />
              </div>

              {/* Payment ID / Ref */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Payment ID / Transaction UTR Ref <span className="text-slate-500">(Recommended)</span>
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. 19284729104 / ESW-881923"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                />
              </div>

              {/* Payer Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Payer Account Name
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Name on your Bank / eSewa account"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Remarks / Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Remarks / Transfer Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. VIP Vault access payment"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* 4. PAYMENT SCREENSHOT / SLIP UPLOAD AREA */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-amber-400" />
                  <span>Upload Payment Screenshot / Slip</span>
                </span>
                <span className="text-[11px] text-amber-300 font-medium">
                  PNG, JPG, WEBP, or PDF
                </span>
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {/* Upload Dropzone / Preview */}
              {proofFile ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {proofPreviewUrl ? (
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 shrink-0">
                        <img
                          src={proofPreviewUrl}
                          alt="Screenshot preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        <FileText className="h-7 w-7 text-emerald-400" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="line-clamp-1">{proofFile.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {(proofFile.size / 1024).toFixed(1)} KB · Ready to transmit to Admin
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileChange(null)}
                      className="p-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:text-rose-200 cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                    isDragging
                      ? "border-amber-400 bg-amber-950/30 text-white"
                      : "border-slate-800 bg-slate-900/40 hover:border-amber-500/50 hover:bg-slate-900/70"
                  }`}
                >
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Click to choose payment screenshot, or drag &amp; drop here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Attach the transfer slip from eSewa, Khalti, or Mobile Banking for fastest activation
                    </p>
                  </div>
                </div>
              )}
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
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Crown className="h-5 w-5" />
              )}
              <span className="tracking-wide">
                {loading
                  ? "TRANSMITTING PAYMENT PROOF & ORDER…"
                  : "COMPLETE PAYMENT & SUBMIT PROOF"}
              </span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Admin will verify your payment slip and unlock the 👑 VIP Tag directly for your account.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
