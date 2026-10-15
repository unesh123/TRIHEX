"use client";

import { useState } from "react";
import {
  Crown,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  X,
  MessageCircle,
  Lock,
  Flame,
  Radio,
  Star,
} from "lucide-react";
import { VIP_PRICING_TIERS, type VipPricingTier } from "@/lib/vip/vip-tiers";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function VipPricingCheckout() {
  const [selectedTier, setSelectedTier] = useState<VipPricingTier | null>(null);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stagedRecord, setStagedRecord] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleOpenCheckout = (tier: VipPricingTier) => {
    const generatedToken = `THX-VIP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setToken(generatedToken);
    setSelectedTier(tier);
    setStagedRecord(false);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSubmitActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      alert("Please enter a valid Google Account email address.");
      return;
    }
    if (!selectedTier) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/vip/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tierId: selectedTier.id,
          priceNpr: selectedTier.priceNpr,
          verificationToken: token,
        }),
      });
      setStagedRecord(true);
    } catch {
      // Continue to WhatsApp anyway
      setStagedRecord(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const waVerificationUrl = selectedTier
    ? buildWhatsAppUrl(
        `Hello Trix. I have initiated payment for the TRIHEX VIP Pack (${selectedTier.name} - NPR ${selectedTier.priceNpr.toLocaleString()}).\nAccount Email: ${email || "[Your Email]"}\nVerification Token: ${token}\nPlease confirm and provision my private VIP credentials.`
      )
    : "#";

  return (
    <div className="space-y-12">
      {/* Pricing Header Strip */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/60 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-300 font-mono shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Crown className="h-4 w-4 text-amber-400" />
          <span>OFFICIAL TRIHEX VIP PASS PRICING</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Select Your VIP Clearance Level
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Zero monthly throttling. Access unmetered developer toolkits, exclusive live methods, private community chatrooms, and direct founder escalation.
        </p>
      </div>

      {/* 3 VIP Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VIP_PRICING_TIERS.map((tier) => {
          const is6Mo = tier.id === "6_MONTHS";
          const isLifetime = tier.id === "LIFETIME";

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all duration-300 ${
                is6Mo
                  ? "border-2 border-amber-400/90 bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-amber-950/40 shadow-[0_0_35px_rgba(245,158,11,0.25)] scale-[1.02]"
                  : isLifetime
                  ? "border-2 border-purple-500/80 bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-purple-950/40 shadow-[0_0_35px_rgba(168,85,247,0.2)]"
                  : "border border-white/10 bg-slate-900/60 hover:border-white/20"
              }`}
            >
              {/* Card Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider font-mono ${
                    is6Mo
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : isLifetime
                      ? "bg-purple-500 text-white font-bold"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {tier.badge}
                </span>
                {tier.savingsLabel && (
                  <span className="text-[10px] font-bold text-emerald-400">
                    {tier.savingsLabel}
                  </span>
                )}
              </div>

              {/* Title & Pricing */}
              <div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                    Rs. {tier.priceNpr.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {tier.durationLabel}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Includes full unmetered VIP Zone and private founder hotline.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="my-6 border-t border-white/10 pt-6 space-y-2.5 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  VIP Inclusions:
                </span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {tier.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          is6Mo
                            ? "text-amber-400"
                            : isLifetime
                            ? "text-purple-400"
                            : "text-blue-400"
                        }`}
                      />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => handleOpenCheckout(tier)}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition duration-200 cursor-pointer ${
                  is6Mo
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    : isLifetime
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-400 hover:to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Crown className="h-4 w-4" />
                <span>Activate {tier.name}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* VIP Checkout & QR Verification Modal */}
      {selectedTier && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedTier(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-900 text-white shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 text-[10px] font-black uppercase text-amber-300 font-mono">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  GOOGLE OAUTH &bull; MANUAL QR ACTIVATION
                </div>
                <h3 className="mt-1 text-xl font-bold text-white">
                  Activate {selectedTier.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Amount: <strong className="text-amber-400">Rs. {selectedTier.priceNpr.toLocaleString()}</strong> ({selectedTier.durationLabel})
                </p>
              </div>
              <button
                onClick={() => setSelectedTier(null)}
                className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step 1: Account Email Input */}
            <form onSubmit={handleSubmitActivation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-1.5">
                  Your Google Account Email (For VIP Provisioning):
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. developer@gmail.com"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <span className="block mt-1 text-[10px] text-slate-400">
                  All encrypted Discord/Telegram room invitations and methods will be authorized for this email.
                </span>
              </div>

              {/* Unique Cryptographic Verification Token */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Cryptographic Verification Token:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <code className="block font-mono text-xs font-bold text-amber-300 tracking-wider">
                  {token}
                </code>
              </div>

              {/* Payment Details Box (Fonepay & eSewa) */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono uppercase">
                    <QrCode className="h-4 w-4" />
                    Nepal Instant Payment Mode
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ZERO TRANSACTION FEE
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-slate-400">Account Name:</span>
                    <strong className="text-white">TRIHEX DIGITAL</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-slate-400">Fonepay / eSewa:</span>
                    <strong className="text-amber-300 font-mono">Available on Founder Desk</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Payable Amount:</span>
                    <strong className="text-emerald-400 font-mono font-bold">
                      Rs. {selectedTier.priceNpr.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Submit & WhatsApp Verification CTA */}
              <div className="pt-2 space-y-2.5">
                <a
                  href={waVerificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (email && email.includes("@")) {
                      handleSubmitActivation({ preventDefault: () => {} } as any);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3.5 text-xs font-bold text-white hover:from-emerald-400 hover:to-emerald-500 transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Verify Payment &amp; Get VIP Credentials on WhatsApp</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <p className="text-center text-[10px] text-slate-400">
                  Trix verifies your transaction in real-time and grants VIP Discord role &amp; private keys within 15 minutes.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
