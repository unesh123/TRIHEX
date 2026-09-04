import { Metadata } from "next";
import Link from "next/link";
import { getPublishedDeals } from "@/lib/deals/store";
import { DealRadarHub } from "@/components/deals/deal-radar-hub";
import { ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Deal Radar · Verified Developer & AI Deals in Nepal",
  description:
    "Discover verified developer software deals, cloud infrastructure credits, student packages, and AI trials. Checked against vendor terms with automatic expiration.",
  openGraph: {
    title: "TRIHEX Deal Radar · Verified Software & AI Deals",
    description: "Verified developer deals, cloud credits, and AI tool trials in Nepal.",
    url: "https://trihexdigital.shop/deals",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/deals",
  },
};

export default function DealsPage() {
  const publishedDeals = getPublishedDeals();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Vault Unification Notice */}
      <div className="bg-gradient-to-r from-blue-950/60 to-purple-950/60 border-b border-white/10 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase font-mono">
              TRIHEX VAULT
            </span>
            <span>Deal Radar is integrated into our unified flagship discovery center.</span>
          </div>
          <Link
            href="/vault"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
          >
            Explore Full Vault <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <DealRadarHub initialDeals={publishedDeals} />
    </main>
  );
}
