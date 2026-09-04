import type { Metadata } from "next";
import Link from "next/link";
import { TRIHEX_ELITE_MEMBERSHIP } from "@/lib/membership/elite-product";
import { 
  Shield, 
  Crown, 
  Terminal, 
  FileText, 
  Headphones, 
  Check, 
  ArrowRight,
  Lock,
  MessageSquareQuote,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "TRIHEX ELITE — Founder & AI Intelligence Membership",
  description: "Executive-tier intelligence, master prompt vault access, and VIP software fulfillment desk for Nepal's engineering leaders.",
};

export default function EliteMembershipPage() {
  const membership = TRIHEX_ELITE_MEMBERSHIP;
  const priceDisplay = `NPR ${(membership.priceNprMinor / 100).toLocaleString("en-NP")}`;

  const waUrl = buildWhatsAppUrl(
    `Hello TRIHEX Operations,\n\nI am interested in applying for the TRIHEX ELITE Founder & AI Intelligence Membership (NPR 13,699/year). Please advise on current invitation availability and verification requirements.\n\nThank you.`
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-500/30">
      {/* Ambient background glow effects */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-25"
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 h-[28rem] w-[42rem] rounded-full bg-gradient-to-tr from-amber-500/10 via-cyan-500/10 to-indigo-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Top Status Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/40 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300 backdrop-blur-md">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span>Private Review Tier · Status: {membership.status}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mt-8 text-center">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Engineering Intelligence. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
              Fulfillment Without Friction.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg">
            {membership.tagline}
          </p>
        </div>

        {/* Pricing Card & Invitation Status */}
        <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 shadow-2xl shadow-amber-950/30 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Annual Membership Pass
              </span>
              <h2 className="mt-1 text-2xl font-bold text-white">TRIHEX ELITE</h2>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {priceDisplay}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase">
              / year (all inclusive)
            </span>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-300">
            Includes full VAT/PAN tax documentation, private research dispatches, priority WhatsApp desk, and full access to our original 100+ prompt templates.
          </p>

          <div className="mt-6 space-y-2.5">
            {membership.deliverables.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                <Check className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-600/25 transition"
            >
              Request Invitation &amp; Verification <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Applications are reviewed manually to ensure high professional conduct.
            </p>
          </div>
        </div>

        {/* The 4 Core Pillars */}
        <div className="mt-24">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Institutional Capabilities
            </span>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
              The Four Pillars of TRIHEX ELITE
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {membership.pillars.map((pillar, idx) => {
              const iconMap = [
                <FileText key={0} className="h-5 w-5 text-amber-400" />,
                <Terminal key={1} className="h-5 w-5 text-cyan-400" />,
                <Headphones key={2} className="h-5 w-5 text-indigo-400" />,
                <Crown key={3} className="h-5 w-5 text-emerald-400" />,
              ];

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-2.5">
                      {iconMap[idx]}
                    </div>
                    <h3 className="font-[family-name:var(--font-sora)] text-base font-bold text-white sm:text-lg">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>

                  <ul className="mt-4 space-y-2 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                    {pillar.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-slate-300 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Truthful FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Clear &amp; Transparent Terms
            </span>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {membership.faq.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm"
              >
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquareQuote className="h-4 w-4 text-amber-400 shrink-0" />
                  {item.question}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-300 pl-6">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance & Anti-Hype Notice */}
        <div className="mt-20 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-center text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-slate-300">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>TRIHEX Institutional Compliance Protocol</span>
          </div>
          <p className="mt-2 max-w-2xl mx-auto leading-relaxed text-[11px] text-slate-400">
            TRIHEX DIGITAL operates as a registered technology procurement and software services provider in Nepal. We do not offer financial advisory services, investment opportunities, or wealth guarantees. All licenses are procured lawfully according to vendor terms of service and Nepal foreign exchange regulations.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="text-xs text-amber-400 hover:underline"
            >
              ← Back to TRIHEX Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
