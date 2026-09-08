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
  Lock
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
        className="pointer-events-none absolute bottom-0 right-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="store-container relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Flagship Ticker Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1.5 text-xs font-semibold text-blue-300 shadow-sm shadow-blue-500/10 backdrop-blur-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono uppercase tracking-wider text-[11px] text-cyan-400">TRIHEX 2.0</span>
          <span className="text-slate-500">•</span>
          <span>Nepal&apos;s Verified Digital Intelligence Marketplace</span>
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
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

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Button
            href="#trending-deals"
            size="lg"
            className="h-12 rounded-xl bg-blue-600 px-6 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
          >
            <Flame className="h-4 w-4 text-amber-300 fill-amber-300" />
            <span>Explore Premium Deals</span>
          </Button>

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

        {/* Live Metrics Trust Banner */}
        <div className="mt-12 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4 border-t border-slate-800/80 pt-8">
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

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left">
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
