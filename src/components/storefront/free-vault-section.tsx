import Link from "next/link";
import { 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Layers,
  Download,
  BookOpen
} from "lucide-react";
import { FreeVaultUnlockModal, FreeVaultItem } from "@/components/vault/free-vault-unlock-modal";

const FEATURED_FREE_DROPS: FreeVaultItem[] = [
  {
    id: "drop-dropshipping-2026",
    title: "Dropshipping Master Bundle 2026",
    category: "Business Education",
    valuation: "Rs. 25,000+",
    description: "Complete 2026 updated master course for e-commerce, product sourcing, TikTok ads blueprint, high-converting store funnels, and winning product selection criteria.",
    highlights: [
      "Step-by-step supplier negotiation guides",
      "Winning product validation spreadsheet",
      "Direct Mega Vault download link (Verified)",
    ],
    accessUrl: "https://mega.nz/folder/QmlCRTRY",
    badge: "VIP LEAKED VAULT",
  },
  {
    id: "drop-prompts-10k",
    title: "10,000+ Production AI Prompts Collection",
    category: "AI Engineering",
    valuation: "Rs. 15,000+",
    description: "Battle-tested system prompt blueprints for Claude 3.7, Cursor IDE, ChatGPT-4o, and Midjourney v6. Optimized for coding, copy, and autonomous agents.",
    highlights: [
      "Custom system prompts for coding copilots",
      "Cold-outreach and agency email formulas",
      "Midjourney photorealistic parameter handbook",
    ],
    accessUrl: "https://trihexdigital.shop/prompts",
    badge: "CURATED TOOLKIT",
  },
  {
    id: "drop-digitalocean-credits",
    title: "DigitalOcean $200 Cloud Credits (60 Days)",
    category: "Cloud Compute",
    valuation: "Rs. 27,000",
    description: "Official cloud infrastructure credits for spinning up Droplets, Kubernetes clusters, Managed Databases, and App Platform instances.",
    highlights: [
      "Deploy production servers at zero initial cost",
      "Valid for 60 days on new verified accounts",
      "Official promo voucher access",
    ],
    accessUrl: "https://www.digitalocean.com/try/free-trial",
    badge: "OFFICIAL PERK",
  },
  {
    id: "drop-github-student-pack",
    title: "GitHub Student Developer Pack (Free Copilot & Tools)",
    category: "Developer Suite",
    valuation: "Rs. 200,000+",
    description: "Massive suite for students containing free GitHub Copilot Pro access, JetBrains IDE licenses, free .me domain from Namecheap, and 1Password.",
    highlights: [
      "Includes GitHub Copilot Pro free subscription",
      "JetBrains All-Products IDE Pack",
      "Requires verified student ID or university email",
    ],
    accessUrl: "https://education.github.com/pack",
    badge: "STUDENT SPECIAL",
  },
];

export function FreeVaultSection() {
  return (
    <section id="free-vault" className="py-14 sm:py-20 bg-slate-900 text-slate-100 border-b border-slate-800 relative overflow-hidden">
      {/* Background Accent */}
      <div 
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" 
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" 
        aria-hidden="true" 
      />

      <div className="store-container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
              <Gift className="h-3.5 w-3.5 text-emerald-400" />
              <span>🎁 Free Digital Vault Ecosystem</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              Curated Free Drops, Courses &amp; Cloud Credits
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              We curate verified high-value courses, prompts, and cloud perks that are 100% free to access. No hidden fees or random sketchy download links.
            </p>
          </div>

          <Link
            href="/vault"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline shrink-0"
          >
            <span>Explore All Vault Entries</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4-Card Free Ecosystem Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_FREE_DROPS.map((drop) => (
            <div
              key={drop.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg backdrop-blur-sm hover:border-emerald-500/40 hover:shadow-emerald-900/10 transition-all duration-200"
            >
              <div>
                {/* Badge & Category */}
                <div className="flex items-center justify-between gap-1 mb-3">
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    {drop.badge || "FREE DROP"}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 truncate">
                    {drop.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {drop.title}
                </h3>

                {/* Valuation */}
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-[11px] text-slate-400">Estimated Value:</span>
                  <span className="font-mono text-sm font-black text-emerald-400">
                    {drop.valuation}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
                  {drop.description}
                </p>

                {/* Feature checklist */}
                <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
                  {drop.highlights.map((hl, i) => (
                    <li key={i} className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Box */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2.5 text-[11px]">
                  <span className="text-slate-400 font-medium">Access Status:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Free</span>
                  </span>
                </div>

                <FreeVaultUnlockModal item={drop} triggerButtonText="Unlock Free Access" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
