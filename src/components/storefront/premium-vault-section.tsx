import Link from "next/link";
import { 
  Crown, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Terminal,
  Layers,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PREMIUM_ASSETS = [
  {
    title: "AI Automation Agency Blueprint (2026)",
    tag: "AGENCY BLUEPRINT",
    valuation: "Rs. 35,000",
    priceNpr: 1499,
    description: "Production workflows for deploying self-hosted n8n AI agent workflows, automated WhatsApp lead capture, and CRM syncing for Nepal businesses.",
    bullets: ["Complete n8n & Supabase workflow templates", "Client outreach cold scripts & contracts", "Lifetime access & monthly updates"],
    slug: "ai-money-maker-digital-course-2026",
  },
  {
    title: "The Psychology of Closing (High-Ticket Sales)",
    tag: "SALES MASTERY",
    valuation: "Rs. 20,000",
    priceNpr: 999,
    description: "Objection handling, buyer psychology, and closing frameworks specifically engineered for selling digital software, retainers, and tech services.",
    bullets: ["Verbatim negotiation objection playbooks", "Audio walkthroughs & case studies", "Instant delivery via WhatsApp"],
    slug: "the-psychology-of-closing-bundle",
  },
  {
    title: "The Passive Rebel — Antisocial Lead Generation",
    tag: "GROWTH SYSTEM",
    valuation: "Rs. 18,000",
    priceNpr: 799,
    description: "Inbound funnel frameworks to generate qualified digital leads without cold calling, dancing on social media, or spending huge advertising budgets.",
    bullets: ["Zero-ad spend content syndication matrix", "High-conversion Notion lead magnets", "Full replacement warranty"],
    slug: "the-passive-rebel-antisocial-leads",
  },
];

export function PremiumVaultSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-amber-500/20 relative overflow-hidden">
      {/* Golden Luxury Glows */}
      <div 
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-amber-500/5 blur-[140px]" 
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute top-0 right-1/4 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" 
        aria-hidden="true" 
      />

      <div className="store-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 shadow-sm shadow-amber-500/10">
            <Crown className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>TRIHEX Premium VIP Vault</span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Exclusive Digital Assets &amp; Business Systems
          </h2>

          <p className="mt-3 text-sm text-slate-300 sm:text-base leading-relaxed">
            Reserved for serious operators, creators, and agency founders. Battle-tested blueprints, automated funnel architectures, and private intelligence drops.
          </p>
        </div>

        {/* 3 VIP Assets Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PREMIUM_ASSETS.map((asset, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-xl shadow-black/60 backdrop-blur-sm hover:border-amber-400 hover:shadow-amber-500/10 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md border border-amber-500/40 bg-amber-950/60 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-amber-300 uppercase">
                    {asset.tag}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Crown className="h-3 w-3 fill-amber-400" />
                    <span>VIP Access</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {asset.title}
                </h3>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through">Valued: {asset.valuation}</span>
                  <span className="text-2xl font-black text-amber-300 font-mono">
                    Rs. {asset.priceNpr.toLocaleString()}
                  </span>
                </div>

                <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                  {asset.description}
                </p>

                <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  {asset.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <Button
                  href={`/products/${asset.slug}`}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold text-xs text-slate-950 hover:from-amber-400 hover:to-yellow-500 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                >
                  <span>Unlock VIP Asset</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-950" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
