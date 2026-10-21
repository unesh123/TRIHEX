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
  Zap,
  Users2,
  MessageSquare,
  Radio,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const TRIX_VIP_FEATURE_LIST = [
  {
    title: "Advanced VIP Chat Rooms & Mastermind Access",
    tag: "PRIVATE CHANNELS",
    badge: "EXCLUSIVE",
    desc: "Encrypted private developer rooms and Discord channels for senior engineers and founders. Real-time method drops, zero-day alerts, and direct collaboration.",
    bullets: [
      "Encrypted Private Dispatch Channels: Daily operational intel",
      "Private Discord Alpha Guild: Screen shares & code reviews",
      "Direct Founder Hotline: Direct access to Trix for rapid escalation",
    ],
  },
  {
    title: "Lovable Unlimited Full-Stack App Builder Method",
    tag: "UNLIMITED WORKFLOW",
    badge: "HOT",
    desc: "Exclusive engineering blueprint enabling unlimited generative coding runs with Lovable AI. Full Next.js + React + Supabase automation with zero quota locks.",
    bullets: [
      "Zero monthly token quota limits: Unlimited continuous runs",
      "Full Next.js + Supabase architectural automation",
      "Authenticated method execution: No warranty, unthrottled",
    ],
  },
  {
    title: "10-Hour Ethical Hacking & Pentesting Masterclass",
    tag: "OFFENSIVE DEFENSE",
    badge: "VERIFIED",
    desc: "Zero-to-advanced curriculum for security analysts and ethical hackers. Master Kali Linux, Nmap recon, Metasploit, and isolated lab auditing.",
    bullets: [
      "Kali Linux 2026 operational workflow & toolchain",
      "OWASP Top 10 Web App Defense & API auditing",
      "Isolated educational lab simulations & reports",
    ],
  },
];

export function PremiumVaultSection() {
  const waVipUrl = buildWhatsAppUrl(
    "Hello Trix. I am requesting immediate access to the TRIHEX VIP Vault & Private Mastermind Community."
  );

  return (
    <section className="py-16 sm:py-24 bg-[#070914] text-white border-b border-amber-500/20 relative overflow-hidden">
      {/* Golden Luxury & Cyber Glows */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-r from-violet-600/10 via-amber-500/10 to-cyan-500/10 blur-[140px]"
        aria-hidden="true"
      />

      <div className="store-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Crown className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>LAUNCHED BY TRIX · TRIX TV EXCLUSIVE</span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl font-[family-name:var(--font-sora)]">
            TRIHEX VIP Vault &amp; Mastermind
          </h2>

          <p className="mt-3 text-sm text-slate-300 sm:text-base leading-relaxed">
            Reserved for high-level engineers and founders. Advanced encrypted VIP chat rooms, special community access, unlimited generative AI methods, and defensive cybersecurity blueprints.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/vip"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition"
            >
              <Crown className="h-4 w-4" />
              <span>Explore Complete VIP Vault List</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={waVipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <MessageSquare className="h-4 w-4 text-amber-400" />
              <span>Contact Trix on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 3 Featured VIP Vault Inclusions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TRIX_VIP_FEATURE_LIST.map((item, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-slate-900/80 p-6 shadow-xl shadow-black/60 backdrop-blur-md hover:border-amber-400 transition duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md border border-amber-500/40 bg-amber-950/60 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-amber-300 uppercase">
                    {item.tag}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Crown className="h-3 w-3 fill-amber-400" />
                    <span>{item.badge}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>

                <ul className="mt-4 space-y-2 text-xs text-slate-200 border-t border-slate-800 pt-3">
                  {item.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <Link
                  href="/vip"
                  className="w-full h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 font-bold text-xs text-amber-300 hover:bg-amber-400/30 transition flex items-center justify-center gap-1.5"
                >
                  <span>View Details in VIP Vault</span>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
