import Link from "next/link";
import { 
  Zap, 
  Radio, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Tag, 
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { DealCandidate } from "@/lib/deals/types";

interface LiveDealRadarSectionProps {
  deals: DealCandidate[];
}

export function LiveDealRadarSection({ deals }: LiveDealRadarSectionProps) {
  const publishedDeals = deals
    .filter((d) => d.status === "PUBLISHED" || d.status === "VERIFIED")
    .slice(0, 6);

  return (
    <section id="deal-radar" className="py-14 sm:py-20 bg-slate-950 text-white border-b border-slate-800">
      <div className="store-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>⚡ Live Deal Radar &amp; Cloud Credits</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              Discovered Developer Perks &amp; Trials
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Our autonomous crawlers discover and verify third-party vendor deals, student perks, and cloud infrastructure credits so you don&apos;t pay full price.
            </p>
          </div>

          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline shrink-0"
          >
            <span>View all live radar discoveries</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Deals Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publishedDeals.map((deal) => {
            const valLabel = deal.detectedValueNprMinor
              ? `~Rs. ${(deal.detectedValueNprMinor / 100).toLocaleString()}`
              : "Free Access";

            return (
              <div
                key={deal.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-cyan-500/40 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2.5">
                    <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                      {deal.vendor}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>{deal.verificationScore ?? 95}% Verified</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                    {deal.title}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[11px] text-slate-400">Detected Value:</span>
                    <span className="font-mono text-xs font-black text-cyan-300">{valLabel}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {deal.summary}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>Eligibility: {deal.eligibility || "Universal"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300 uppercase">
                    {deal.approvalType === "PAID" ? "Store Service" : "Free Claim"}
                  </span>

                  <a
                    href={deal.officialVendorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    <span>Claim Deal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
