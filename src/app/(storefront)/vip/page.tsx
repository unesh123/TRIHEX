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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { TrixVipVaultClient } from "@/components/vip/trix-vip-vault-client";
import { getAllVipVaultItems } from "@/lib/vip/vip-store";

export const metadata: Metadata = {
  title: "TRIHEX VIP VAULT — Launched by Trix | Private Intelligence & Community",
  description:
    "Exclusive private vault launched by Trix: Advanced VIP chat rooms, private community access, unlimited Lovable builder methods, ethical hacking masterclasses, and encrypted threat intelligence.",
  openGraph: {
    title: "TRIHEX VIP VAULT — Launched by Trix",
    description:
      "High-level VIP chat rooms, specialized community access, unlimited generative AI methods, and ethical hacking playbooks.",
    url: "https://trihexdigital.shop/vip",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/vip",
  },
};

export const revalidate = 60;

export default function VipVaultPage() {
  const vipItems = getAllVipVaultItems();
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
            <span>LAUNCHED BY TRIX · TRIX TV EXCLUSIVE</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>LIVE OPERATIONAL VAULT</span>
          </div>
        </div>

        {/* Hero Title Section */}
        <div className="mt-8 text-center max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            TRIHEX VIP VAULT
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-semibold bg-gradient-to-r from-amber-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
            Private Community • Advanced VIP Chat Rooms • Uncensored Toolkits
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            Curated and launched directly by Trix. This is not an ordinary product catalogue — it is an exclusive, continuously updated roster of high-level engineering methods, private chatrooms, ethical hacking academies, and unrestricted developer blueprints.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={waVipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition duration-200 hover:scale-[1.02]"
            >
              <Crown className="h-4 w-4" />
              <span>Unlock VIP Access via Founder Desk</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition backdrop-blur-sm"
            >
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Cybersecurity Academy</span>
            </Link>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-amber-400">15+</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              VIP Toolkits & Methods
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-cyan-400">24/7</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Encrypted VIP Chat Rooms
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-violet-400">Zero Limits</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Unlimited Builders
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-emerald-400">100%</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Private Founder Desk
            </div>
          </div>
        </div>

        {/* Client Interactive VIP Vault List with Category Filter & Search */}
        <div className="mt-14">
          <TrixVipVaultClient initialItems={vipItems} />
        </div>

        {/* Bottom VIP Access Protocol Notice */}
        <div className="mt-16 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900/40 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <ShieldCheck className="h-4 w-4" />
                <span>TRIHEX VIP DISCRETION & COMPLIANCE PROTOCOL</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                How VIP Fulfillment & Community Invitation Works
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                VIP Vault assets, encrypted room keys, and builder access tokens are provisioned under strict private review. Contact the Founder Desk via WhatsApp with your account email to receive your private onboarding link and Discord/Telegram room credentials.
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
