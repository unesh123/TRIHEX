import Link from "next/link";
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Gift, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketplaceHeroProps {
  stats?: {
    productCount: number;
    vaultCount: number;
    dealsCount: number;
  };
}

export function MarketplaceHero({ stats }: MarketplaceHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-10 pb-16 md:pt-16 md:pb-24 text-slate-100 antialiased border-b border-slate-800">
      {/* Background Matrix Grid */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35"
        aria-hidden="true"
      />
      {/* Ambient Radial Lighting */}
      <div 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-600/25 to-cyan-400/15 blur-[120px]"
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute bottom-0 right-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="store-container relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Flagship Ticker Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1.5 text-xs font-semibold text-blue-300 shadow-sm shadow-blue-500/10 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono uppercase tracking-wider text-[11px] text-cyan-400">TRIHEX 2.0</span>
            <span className="text-slate-500">•</span>
            <span>Nepal&apos;s Verified Digital Intelligence Marketplace</span>
          </div>

          <Link
            href="/vip"
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 px-3.5 py-1.5 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:border-amber-400 hover:scale-105 transition-all backdrop-blur-md group"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:rotate-12 transition-transform" />
            <span>VIP Zone Unlocked</span>
            <span className="text-amber-400/80 font-mono text-[10px]">Rs. 3,999+</span>
          </Link>
        </div>

        {/* Headline */}
        <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Unlock Premium AI Tools,{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Secret Deals
          </span>{" "}
          &amp; Digital Assets
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
          Verified software subscriptions, lifetime deals, free developer credits, courses, templates, and exclusive digital drops — curated for creators, developers, and businesses in Nepal.
        </p>

        {/* CTAs with High-Visibility VIP Vault Button */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Button
            href="#trending-deals"
            size="lg"
            className="h-12 rounded-xl bg-blue-600 px-6 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
          >
            <Flame className="h-4 w-4 text-amber-300 fill-amber-300" />
            <span>Explore Premium Deals</span>
          </Button>

          <Link
            href="/vip"
            className="h-12 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 font-black text-slate-950 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all inline-flex items-center gap-2 group border border-amber-300/80"
          >
            <Crown className="h-4 w-4 text-slate-950 fill-slate-950" />
            <span>Unlock VIP Vault</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider group-hover:bg-slate-900 transition-colors">
              Tier 1·2·3
            </span>
          </Link>

          <Button
            href="#free-vault"
            variant="outline"
            size="lg"
            className="h-12 rounded-xl border-slate-700 bg-slate-900/80 px-6 font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-800 hover:text-white backdrop-blur-sm transition-all gap-2"
          >
            <Gift className="h-4 w-4 text-emerald-400" />
            <span>Enter Free Vault</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Button>
        </div>

        {/* Live Metrics Trust Banner — 5 Columns */}
        <div className="mt-12 grid grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-3.5 border-t border-slate-800/80 pt-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Verified Catalog</span>
            </div>
            <div className="mt-1 font-mono text-lg font-black text-white sm:text-xl">
              {stats?.productCount ?? 30}+ Tools
            </div>
            <p className="text-[10px] text-slate-500">100% human verified</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Gift className="h-3.5 w-3.5 text-emerald-400" />
              <span>Free Vault Assets</span>
            </div>
            <div className="mt-1 font-mono text-lg font-black text-emerald-400 sm:text-xl">
              Rs. 50,000+
            </div>
            <p className="text-[10px] text-slate-500">Zero cost perks</p>
          </div>

          {/* High-Level VIP Vault Highlight Card */}
          <Link
            href="/vip"
            className="group rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-950 p-3 text-left hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all block relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
              <div className="flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span>VIP All-Access</span>
              </div>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                PASS
              </span>
            </div>
            <div className="mt-1 font-mono text-lg font-black text-amber-300 sm:text-xl group-hover:scale-105 transition-transform origin-left">
              Rs. 3,999+
            </div>
            <p className="text-[10px] text-slate-400">Private drops &amp; hotline</p>
          </Link>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Nepal Instant Pay</span>
            </div>
            <div className="mt-1 font-mono text-lg font-black text-white sm:text-xl">
              eSewa &amp; Khalti
            </div>
            <p className="text-[10px] text-slate-500">Bank QR + WhatsApp</p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
              <span>Deal Radar</span>
            </div>
            <div className="mt-1 font-mono text-lg font-black text-cyan-300 sm:text-xl">
              Updated Daily
            </div>
            <p className="text-[10px] text-slate-500">Live cloud &amp; API drops</p>
          </div>
        </div>
      </div>
    </section>
  );
}
