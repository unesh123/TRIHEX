import type { Metadata } from "next";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { VaultHub } from "@/components/vault/vault-hub";
import { ShieldCheck, Terminal, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "TRIHEX Classified Digital Vault — Developer Loots, Prompts & Public Archives",
  description:
    "Explore high-value digital developer loots, prompt engineering master archives, cloud perks, verified public records, and inflation simulators at TRIHEX DIGITAL Nepal.",
  openGraph: {
    title: "TRIHEX Classified Digital Vault — Developer Loots & Cloud Drops",
    description:
      "Curated digital bundles, master prompts, free developer cloud perks, and economic simulation tools with instant NPR checkout.",
  },
};

export const dynamic = "force-dynamic";

export default function VaultPage() {
  return (
    <StorefrontPageShell
      title="Classified Vault & Developer Loots"
      description="Exclusive digital bundles, high-ticket prompt packs, free cloud vouchers, verified public legal archives, and interactive economic simulations."
    >
      {/* Header Banner */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-blue-900/40 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-black tracking-wider text-blue-400">
            <Terminal className="h-3.5 w-3.5" />
            TRIHEX UNDERGROUND VAULT
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            VERIFIED LOCAL FULFILLMENT
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
            <Cpu className="h-3.5 w-3.5" />
            DECRYPTION KEYS INCLUDED
          </span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
          Underground Developer Intel, Prompts &amp; Public Archives
        </h1>
        <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          Access heavily discounted developer masterclasses, covert traffic workflows, free cloud serverless promos ($90+ value), unsealed public dockets, and interactive currency decay tools. All paid bundles include master decryption keys delivered directly to your verified order.
        </p>
      </div>

      <VaultHub />
    </StorefrontPageShell>
  );
}
