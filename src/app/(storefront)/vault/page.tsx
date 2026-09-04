import type { Metadata } from "next";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { UnifiedVaultHub } from "@/components/vault/unified-vault-hub";
import { getAllVaultEntries } from "@/lib/vault/vault-aggregator";
import { ShieldCheck, Terminal, Cpu, Sparkles, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "TRIHEX VAULT — Premium Resources, Verified Deals, Developer Perks & Research",
  description:
    "Flagship intelligence & discovery hub for Nepal: Premium software bundles, verified vendor deals, free cloud credits, prompt engineering toolkits, and public records.",
  openGraph: {
    title: "TRIHEX VAULT — Premium Resources • Verified Deals • Developer Perks",
    description:
      "One destination for premium tools, verified software deals, free developer perks, and evidence-backed research.",
    url: "https://trihexdigital.shop/vault",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/vault",
  },
};

export const dynamic = "force-dynamic";

export default function VaultPage() {
  const entries = getAllVaultEntries();

  return (
    <StorefrontPageShell
      title="TRIHEX VAULT"
      description="Premium Resources • Verified Deals • Developer Perks • Research"
    >
      {/* Header Banner */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-blue-900/40 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-black tracking-wider text-blue-400">
            <Terminal className="h-3.5 w-3.5" />
            TRIHEX VAULT
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            VERIFIED PROVENANCE
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
            <Tag className="h-3.5 w-3.5" />
            LIVE DEAL RADAR INTEGRATED
          </span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
          Premium Resources • Verified Deals • Developer Perks • Research
        </h1>
        <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          The single discovery destination for TRIHEX Digital: Verified developer deals, VIP software bundles, free cloud serverless credits, prompt engineering packs, and public legal records.
        </p>
      </div>

      <UnifiedVaultHub initialEntries={entries} />
    </StorefrontPageShell>
  );
}
