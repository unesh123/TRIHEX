"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Zap,
  Sparkles,
  Lock,
  MessageCircle,
} from "lucide-react";
import { VIP_PRICING_TIERS, type VipPricingTier } from "@/lib/vip/vip-tiers";
import { writeCart } from "@/components/storefront/cart-view";

export function VipPricingCheckout() {
  const router = useRouter();
  const [loadingTierId, setLoadingTierId] = useState<string | null>(null);

  const handleSelectTier = (tier: VipPricingTier) => {
    setLoadingTierId(tier.id);
    try {
      // 1. Write the VIP pass to cart
      writeCart([
        {
          productSlug: tier.slug,
          variantSku: tier.sku,
          quantity: 1,
          warranty: tier.durationLabel,
        },
      ]);
      // 2. Direct route to official site checkout page
      router.push("/checkout");
    } catch (err) {
      console.error("Failed to route to checkout:", err);
      router.push("/checkout");
    }
  };

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
          Zero monthly throttling. Access unmetered developer toolkits, exclusive live methods, private community chatrooms, and direct founder escalation. Pay securely via Bank QR on checkout.
        </p>
      </div>

      {/* 3 VIP Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VIP_PRICING_TIERS.map((tier) => {
          const is6Mo = tier.id === "6_MONTHS";
          const isLifetime = tier.id === "LIFETIME";
          const isLoading = loadingTierId === tier.id;

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

              {/* CTA Button — Routes Directly to Checkout Page */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectTier(tier)}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition duration-200 cursor-pointer disabled:opacity-50 ${
                    is6Mo
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                      : isLifetime
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-400 hover:to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Crown className="h-4 w-4" />
                  <span>
                    {isLoading
                      ? "Opening Checkout…"
                      : `Get VIP — Activate ${tier.name}`}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-[10px] text-slate-400 font-mono">
                  Direct Bank QR scan-to-pay on checkout · No hidden fees
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment & Fulfillment Transparency Banner */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-7 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <strong className="block text-white font-bold mb-1">
                1. Pay on Website via Bank QR
              </strong>
              <span>
                Click Get VIP, scan our official Bank QR (Fonepay/eSewa/Bank app) on the checkout page, and upload your payment screenshot.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <strong className="block text-white font-bold mb-1">
                2. Automatic VIP Registration
              </strong>
              <span>
                Your mobile number is registered in our database. Track your VIP status and order timeline anytime using just your phone number.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <strong className="block text-white font-bold mb-1">
                3. Instant WhatsApp Verification
              </strong>
              <span>
                After placing your order on the site, dispatch your payment receipt to WhatsApp for instant 1-click clearance and private access keys.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
