import Link from "next/link";
import { Terminal, Lock, Gift, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export function HomeVaultBanner() {
  return (
    <section className="mt-16 sm:mt-24">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 text-white shadow-2xl">
        {/* Glow accents */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-purple-600/15 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-black tracking-wider text-blue-400">
              <Terminal className="h-3.5 w-3.5" />
              <span>TRIHEX UNDERGROUND VAULT</span>
            </div>

            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Classified Drops, Dev Loots &amp; Master Prompts
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore secret monetization masterclasses, covert traffic workflows, free cloud serverless credits ($90+ value), unsealed legal dockets, and interactive purchasing power calculators.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Verified Delivery
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Lock className="h-3.5 w-3.5" />
                Master Decryption Keys
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <Gift className="h-3.5 w-3.5" />
                Free Dev Vouchers
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/vault"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 active:scale-[0.98]"
              >
                <span>Enter The Classified Vault</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/vault?tab=interactive-tools"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 text-xs font-bold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>The Silent Tax Tool</span>
              </Link>
            </div>
          </div>

          {/* Quick Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5">VIP COURSE</span>
                <span>Rs. 499</span>
              </div>
              <h4 className="mt-2 text-xs font-bold text-white">AI Money Maker Vault</h4>
              <p className="mt-1 text-[11px] text-slate-400">
                50+ Prompts, dropship funnels &amp; master unlock key.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400">
                <span className="rounded bg-cyan-500/20 px-2 py-0.5">FREE PERK</span>
                <span>$90 FREE</span>
              </div>
              <h4 className="mt-2 text-xs font-bold text-white">Wasmer Pro Serverless</h4>
              <p className="mt-1 text-[11px] text-slate-400">
                3 Months free global WebAssembly edge cloud compute.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                <span className="rounded bg-amber-500/20 px-2 py-0.5">SALES VAULT</span>
                <span>Rs. 399</span>
              </div>
              <h4 className="mt-2 text-xs font-bold text-white">Psychology of Closing</h4>
              <p className="mt-1 text-[11px] text-slate-400">
                47 Objection rebuttal scripts &amp; cold outreach matrices.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[10px] font-bold text-purple-400">
                <span className="rounded bg-purple-500/20 px-2 py-0.5">INTERACTIVE</span>
                <span>FREE TOOL</span>
              </div>
              <h4 className="mt-2 text-xs font-bold text-white">The Silent Tax Engine</h4>
              <p className="mt-1 text-[11px] text-slate-400">
                113 Years of BLS CPI inflation &amp; fiat decay simulator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
