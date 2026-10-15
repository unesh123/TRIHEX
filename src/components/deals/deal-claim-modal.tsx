"use client";

import { useState } from "react";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Tag,
  ArrowRight,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react";
import { VaultEntry } from "@/lib/vault/vault-types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface DealClaimModalProps {
  entry: VaultEntry | null;
  onClose: () => void;
}

export function DealClaimModal({ entry, onClose }: DealClaimModalProps) {
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const promoCode = entry.promoCode || "";
  const officialUrl = entry.officialVendorUrl || entry.destinationUrl;

  const handleCopy = () => {
    if (!promoCode) return;
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const waAssistedUrl = buildWhatsAppUrl(
    `Hello Trix. I am requesting assisted Nepal activation for "${entry.title}" (${entry.sourceName}). Promo Code: ${promoCode || "Direct Link"}.`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow Strip */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs font-mono">
                  <ShieldCheck className="h-3 w-3" />
                  TRIHEX VERIFIED RADAR
                </span>
                <span className="rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-2 py-0.5 text-[10px] font-bold">
                  {entry.sourceName}
                </span>
              </div>
              <h2 className="text-xl font-black text-white leading-snug">
                {entry.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-black/20 p-2 text-white/80 hover:bg-black/40 hover:text-white transition"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="rounded-lg bg-white/10 px-3 py-1 font-mono text-amber-300">
              Value: {entry.displayPrice}
            </div>
            {entry.cardRequired != null && (
              <div className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1 text-slate-200">
                <CreditCard className="h-3.5 w-3.5" />
                <span>{entry.cardRequired ? "Card Verification Required" : "No Card Required"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Summary */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {entry.summary}
          </p>

          {/* Promo Code Box */}
          {promoCode ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 font-mono flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  Verified Promo Code
                </span>
                <span className="text-[10px] text-blue-600 font-medium">
                  Click to copy &amp; apply
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-blue-300/60 bg-white p-2.5">
                <code className="font-mono text-sm sm:text-base font-black text-slate-900 tracking-wider">
                  {promoCode}
                </code>
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-900">
                <strong className="font-bold">Direct Partner Activation:</strong> No promo code needed! The discount or grant is automatically applied through the official portal.
              </div>
            </div>
          )}

          {/* Step-by-Step Claim Walkthrough */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Direct Official Claim Procedure
            </h4>
            <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
              <li>
                Click <strong className="text-slate-900">Open Official {entry.sourceName} Portal</strong> below to reach the official vendor site directly.
              </li>
              <li>
                Sign in or register using your student or developer email.
              </li>
              {promoCode ? (
                <li>
                  Paste promo code <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900 font-bold">{promoCode}</code> at checkout or grant submission.
                </li>
              ) : (
                <li>
                  Confirm developer verification or student status on the official vendor form.
                </li>
              )}
              <li>
                Your credits, free subscription, or educational grant will be instantly activated.
              </li>
            </ol>
          </div>

          {/* Eligibility Note */}
          {entry.eligibility && (
            <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-xl p-3">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-700">Eligibility Terms:</strong> {entry.eligibility}
              </span>
            </div>
          )}

          {/* CTAs: Direct Official Link + Assisted WhatsApp */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-xs font-bold text-white hover:bg-blue-600 transition shadow-sm hover:shadow-md"
            >
              <span>Open Official {entry.sourceName} Portal</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a
              href={waAssistedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shrink-0"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>Assisted Activation</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
