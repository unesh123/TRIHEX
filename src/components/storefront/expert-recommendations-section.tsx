import Link from "next/link";
import { 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Flame, 
  Code2, 
  Video, 
  Rocket, 
  Award,
  Layers,
  MessageCircle,
  TrendingUp,
  Cpu
} from "lucide-react";
import { VIP_PRICING_TIERS } from "@/lib/vip/vip-tiers";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const WORKFLOW_PERSONAS = [
  {
    id: "creator",
    title: "Viral Creator & Video Agency",
    tag: "CONTENT & SOCIAL",
    recommendedTitle: "CapCut Pro + ElevenLabs Studio",
    priceRange: "From Rs. 399 / mo",
    description: "Engineered for creators producing TikToks, Reels, YouTube Shorts, and commercial client video ads.",
    highlights: [
      "Auto-captions with animated typography presets",
      "Studio voice cloning with emotional inflection",
      "4K 60fps uncompressed export with zero watermarks",
      "100% replacement warranty with instant email setup"
    ],
    ctaLabel: "Explore Creator Tools",
    ctaUrl: "/products",
    badge: "HIGH ROI",
    accentBorder: "border-blue-500/30",
    icon: Video,
  },
  {
    id: "engineer",
    title: "Full-Stack & AI Software Engineer",
    tag: "DEVELOPMENT & AGENTS",
    recommendedTitle: "Cursor Pro 1-Year + Claude Code",
    priceRange: "Rs. 8,999 (Shared) · Rs. 23,999 (Private)",
    description: "The premier developer stack for Next.js 16, Supabase, Python, and multi-file autonomous coding.",
    highlights: [
      "Agent Composer: multi-file repository codebase indexing",
      "Native Claude 3.7 Sonnet, GPT-4o & DeepSeek V3",
      "Full 365 Days Replacement Warranty guaranteed",
      "Instant email delivery with WhatsApp engineer hotline"
    ],
    ctaLabel: "Get Cursor Pro 1-Year",
    ctaUrl: "/products/cursor-pro-12m",
    badge: "MOST POPULAR",
    accentBorder: "border-cyan-500/30",
    icon: Code2,
  },
  {
    id: "founder-vip",
    title: "High-Level Founder & VIP Elite",
    tag: "FULL UNRESTRICTED ACCESS",
    recommendedTitle: "TRIHEX Full VIP All-Access Pass",
    priceRange: "Rs. 3,999 · Rs. 5,999 · Rs. 7,999 Lifetime",
    description: "Complete unrestricted access to all 130+ agent skills, private method vault, leaks, exclusive databases, and direct hotline.",
    highlights: [
      "Everything in Pro included across all categories",
      "Full VIP Zone (Leaks, Software Blueprints, Unreleased Courses)",
      "Private VIP Database & Untested methods vault (first drops)",
      "Direct Founder / Researcher Hotline on WhatsApp & Discord"
    ],
    ctaLabel: "Unlock VIP Pass",
    ctaUrl: "/vip",
    badge: "⭐ ULTIMATE VALUE",
    isFeatured: true,
    accentBorder: "border-amber-400 shadow-xl shadow-amber-500/10",
    icon: Crown,
  },
];

export function ExpertRecommendationsSection() {
  const vipWhatsAppUrl = buildWhatsAppUrl(
    "Hello Trix. I am interested in the TRIHEX VIP All-Access Pass (Lifetime / 6-Month). Please provide activation details."
  );

  return (
    <section id="expert-recommendations" className="scroll-mt-24 py-16 sm:py-24 bg-slate-950 text-slate-100 border-b border-slate-800 relative overflow-hidden">
      {/* Ambient background glow */}
      <div 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-r from-blue-600/15 via-amber-500/15 to-purple-600/15 blur-[140px]"
        aria-hidden="true"
      />

      <div className="store-container relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 px-4 py-1.5 text-xs font-bold text-amber-300 uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>TRIHEX Chief Intelligence Architect · Decision Board</span>
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-[family-name:var(--font-sora)]">
            Which Software Stack or <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">VIP Pass</span> Fits You?
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Engineered guidance so you don&apos;t waste money on tools you won&apos;t use. Tailored packages for creators, software builders, and high-level founders in Nepal.
          </p>
        </div>

        {/* 3 Persona Recommendation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {WORKFLOW_PERSONAS.map((persona) => {
            const Icon = persona.icon;
            const isVip = persona.isFeatured;

            return (
              <div
                key={persona.id}
                className={`flex flex-col justify-between rounded-3xl p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 border ${
                  isVip
                    ? "bg-gradient-to-b from-amber-950/30 via-slate-900/90 to-slate-950 border-amber-400 shadow-2xl shadow-amber-500/15 ring-1 ring-amber-400/30 scale-[1.02]"
                    : "bg-slate-900/70 border-white/10 hover:border-white/20 shadow-lg"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
                      isVip ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" : "bg-slate-800 text-slate-300 border border-white/5"
                    }`}>
                      {persona.tag}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isVip ? "bg-amber-400 text-slate-950 font-black" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}>
                      {persona.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isVip ? "bg-amber-400/20 text-amber-300" : "bg-slate-800 text-blue-400"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                        {persona.title}
                      </h3>
                      <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                        {persona.priceRange}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 my-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Recommended Stack:
                    </div>
                    <div className="text-sm font-black text-white mt-0.5">
                      {persona.recommendedTitle}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {persona.description}
                  </p>

                  <ul className="space-y-2 text-xs text-slate-200 border-t border-white/5 pt-3 mb-6">
                    {persona.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isVip ? "text-amber-400" : "text-blue-400"
                        }`} />
                        <span className="leading-snug">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Link
                    href={persona.ctaUrl}
                    className={`w-full h-11 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      isVip
                        ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-[1.02]"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
                    }`}
                  >
                    <span>{persona.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── HIGH-LEVEL VIP BOARD TEASER WITH 3 OFFICIAL TIERS ── */}
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/40 via-slate-900/95 to-slate-950 p-6 sm:p-10 shadow-2xl shadow-amber-500/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-amber-500/20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 mb-2">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>TRIHEX Full VIP Mastermind Zone</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-[family-name:var(--font-sora)]">
                Official VIP Membership Tiers
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                One membership unlocks everything: private software methods, 130+ agent skills, unreleased courses, private database access, and 1-on-1 engineer hotline.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/vip#vip-pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black shadow-md hover:scale-105 transition"
              >
                <Crown className="w-4 h-4" />
                <span>Go to VIP Checkout Page</span>
              </Link>
              <a
                href={vipWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp VIP Support</span>
              </a>
            </div>
          </div>

          {/* 3 VIP Pricing Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8">
            {VIP_PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  tier.isPopular
                    ? "bg-slate-900/90 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30"
                    : "bg-slate-900/50 border-white/10 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      {tier.badge}
                    </span>
                    {tier.savingsLabel && (
                      <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {tier.savingsLabel}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{tier.name}</h4>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                      Rs. {tier.priceNpr.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">
                      / {tier.durationLabel}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300 border-t border-white/5 pt-3 mb-5">
                    {tier.features.slice(0, 5).map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{feat}</span>
                      </li>
                    ))}
                    {tier.features.length > 5 && (
                      <li className="text-[11px] text-amber-400/90 font-mono font-semibold pt-1">
                        + {tier.features.length - 5} more exclusive benefits included
                      </li>
                    )}
                  </ul>
                </div>

                <Link
                  href={`/checkout?product=${tier.slug}&sku=${tier.sku}`}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    tier.isPopular
                      ? "bg-amber-400 text-slate-950 hover:bg-amber-300 font-black"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Get VIP — {tier.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
