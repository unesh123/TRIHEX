import { Metadata } from "next";
import Link from "next/link";
import { getAllVaultEntries } from "@/lib/vault/vault-aggregator";
import { UnifiedVaultHub } from "@/components/vault/unified-vault-hub";
import { ShieldCheck, ArrowRight, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Verified Deals Radar · Software, Cloud Credits & AI Trials",
  description:
    "Discover verified developer software deals, cloud infrastructure credits, student packages, and AI trials in Nepal. Fully integrated into the TRIHEX VAULT.",
  openGraph: {
    title: "TRIHEX Deals Radar · Verified Software & Cloud Perks",
    description: "Verified developer deals, cloud credits, and AI tool trials in Nepal.",
    url: "https://trihexdigital.shop/deals",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/deals",
  },
};

export default function DealsPage() {
  const entries = getAllVaultEntries();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 to-purple-950/60 border-b border-white/10 px-4 py-4 mb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
              <Tag className="w-3 h-3" />
              TRIHEX VAULT · DEALS RADAR
            </span>
            <span className="text-slate-300 font-medium">
              Verified software discounts, serverless credits, and education grants.
            </span>
          </div>
          <Link
            href="/vault"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
          >
            <span>Explore All Vault Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <UnifiedVaultHub initialEntries={entries} defaultTab="deals" />
      </div>
    </main>
  );
}
