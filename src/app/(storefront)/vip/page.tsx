import type { Metadata } from "next";
import Link from "next/link";
import {
  Crown,
  Terminal,
  ShieldAlert,
  Zap,
  Lock,
  Sparkles,
  Users2,
  CheckCircle2,
  ArrowRight,
  Flame,
  Globe2,
  MessageSquare,
  ShieldCheck,
  Search,
  ExternalLink,
  Code2,
  Video,
  Database,
  Radio,
  Cpu,
  User,
} from "lucide-react";
import { getCurrentStorefrontUser } from "@/lib/auth/user-session";
import { getVipMemberRecordByEmail } from "@/lib/vip/vip-member-store";
import { VipRequestAccessForm } from "@/components/vip/vip-request-access-form";
import { FluxDirectoryVault } from "@/components/vip/flux-directory-vault";
import { VipPricingCheckout } from "@/components/vip/vip-pricing-checkout";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { isOwnerEmail } from "@/lib/auth/owner";
import { resolveStorefrontBankQrPath } from "@/lib/payments/resolve-bank-qr";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { PaymentQrCard } from "@/components/storefront/payment-qr-card";
import { STOREFRONT_BANK_QR_PATH } from "@/lib/payments/storefront-payment";

export const metadata: Metadata = {
  title: "TRIHEX VIP VAULT — 564+ Advanced Tools & Verified Developer Perks",
  description:
    "Exclusive private vault launched by Trix: Verified AI credits, student discounts, API developer passes, private chat rooms, and unrestricted developer blueprints.",
  openGraph: {
    title: "TRIHEX VIP VAULT — Private Intelligence & Perks",
    description:
      "Access 564+ verified developer offers, AI API credits, free builder subscriptions, and private mastermind community.",
    url: "https://trihexdigital.shop/vip",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/vip",
  },
};

export const dynamic = "force-dynamic";

interface VipPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VipVaultPage({ searchParams }: VipPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const qrSrc = await resolveStorefrontBankQrPath();
  const user = await getCurrentStorefrontUser();
  const isOwner = user?.email ? isOwnerEmail(user.email) : false;
  const vipRecord = user?.email ? await getVipMemberRecordByEmail(user.email) : null;
  const isVipActive =
    isOwner ||
    (vipRecord?.status === "ACTIVE" &&
      (!vipRecord.expiresAt || new Date(vipRecord.expiresAt).getTime() > Date.now()));

  // CASE 1: USER HAS VERIFIED ACTIVE VIP CLEARANCE -> OPEN THE COMPLETE FLUX DIRECTORY VAULT!
  if (user && isVipActive) {
    return <FluxDirectoryVault />;
  }

  const waVipUrl = buildWhatsAppUrl(
    "Hello Trix. I am requesting direct verification and invitation access to the TRIHEX VIP Vault, Private Mastermind Community & Advanced VIP Chat Rooms."
  );

  return (
    <div className="relative min-h-screen bg-[#070913] text-slate-100 antialiased selection:bg-amber-500/30">
      {/* Ambient background glow & grid */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-25"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[32rem] w-[56rem] rounded-full bg-gradient-to-tr from-violet-600/15 via-amber-500/15 to-cyan-500/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        {/* Trix TV Style Header Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md">
            <Crown className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>LAUNCHED BY TRIX · VIP VAULT CLEARANCE</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>564+ VERIFIED ASSETS</span>
          </div>
        </div>

        {/* Hero Title Section */}
        <div className="mt-8 text-center max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            TRIHEX VIP VAULT
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-semibold bg-gradient-to-r from-amber-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
            564+ Advanced AI Offers • Free Developer Passes • Uncensored Toolkits
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            Curated and launched directly by Trix. Once activated by admin, VIP members get immediate unthrottled access to 564+ developer credit claims, AI subscriptions, private chatrooms, and unmetered Lovable generation pipelines.
          </p>
        </div>

        {/* VIP STATUS & ACTIVATION GATEWAY */}
        <div className="mt-12">
          {user ? (
            /* CASE 2: SIGNED IN WITH GOOGLE -> SHOW BOLD "REQUEST ACCESS FOR VIP" */
            <VipRequestAccessForm user={user} existingMember={vipRecord} qrSrc={qrSrc} />
          ) : (
            /* CASE 3: GUEST -> PROMPT GOOGLE SIGN-IN TO LINK USER ID & QR CHECKOUT */
            <div className="mx-auto max-w-xl space-y-6">
              <div className="rounded-3xl border border-amber-500/40 bg-slate-900/95 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
                  <Crown className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-white tracking-tight">
                  Sign in with Google to Unlock VIP
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                  Sign in with your Google account to get your verified <strong>Customer User ID</strong>, access the scan-to-pay QR checkout, and link your VIP Vault clearance.
                </p>

                <div className="mt-6">
                  <GoogleAuthButton nextUrl="/vip" label="Sign in with Google to Unlock" />
                </div>
              </div>

              {/* VIP Pricing & Payment QR Preview */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-center space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>3 OFFICIAL VIP CLEARANCE TIERS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <span className="text-xs font-bold text-slate-300">1 Month Pass</span>
                    <p className="text-lg font-black text-amber-300 font-mono mt-1">Rs. 3,999</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">30 Days Full Access</p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/50 bg-amber-950/30 p-4 shadow-sm">
                    <span className="text-xs font-bold text-amber-300">6 Months (Popular)</span>
                    <p className="text-lg font-black text-amber-300 font-mono mt-1">Rs. 5,999</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">180 Days Full Access</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <span className="text-xs font-bold text-slate-300">Lifetime Pack</span>
                    <p className="text-lg font-black text-amber-300 font-mono mt-1">Rs. 7,999</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Permanent Access</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Direct payment via eSewa, Khalti, or Mobile Banking QR. Admin confirms payment on WhatsApp and unlocks the VIP Vault for your Google ID.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-amber-400">564+</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verified VIP Assets
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-cyan-400">100</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              AI &amp; ML Toolkits
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-violet-400">232</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              100% Free Credits
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-emerald-400">100%</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin Verified
            </div>
          </div>
        </div>

        {/* Bottom VIP Access Protocol Notice */}
        <div className="mt-16 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900/40 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <ShieldCheck className="h-4 w-4" />
                <span>TRIHEX VIP DISCRETION &amp; COMPLIANCE PROTOCOL</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                How VIP Fulfillment &amp; Community Invitation Works
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                VIP Vault assets, encrypted room keys, and builder access tokens are provisioned under strict private review. Contact the Founder Desk via WhatsApp with your account email to receive your private onboarding link and Discord VIP room credentials.
              </p>
            </div>
            <a
              href={waVipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition shrink-0"
            >
              Contact Trix on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
