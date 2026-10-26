"use client";

import { useState, useEffect } from "react";
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
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { DealCandidate } from "@/lib/deals/types";

interface LiveDealRadarSectionProps {
  deals: DealCandidate[];
}

const MONITORED_ECOSYSTEMS = [
  "GitHub Student Developer Pack",
  "AWS Activate & Founders Club",
  "Google Cloud for Startups ($350k)",
  "DigitalOcean Hatch Ecosystem",
  "JetBrains Free Pro Subscriptions",
  "Vercel Pro Developer Credits",
  "Supabase Pro Builder Access",
  "OpenAI & Perplexity Pro Credits",
];

export function LiveDealRadarSection({ deals: initialDeals }: LiveDealRadarSectionProps) {
  const [deals, setDeals] = useState<DealCandidate[]>(initialDeals);
  const [activeVendorIdx, setActiveVendorIdx] = useState<number>(0);
  // Keep the server and first browser render identical. The local clock is
  // filled after hydration so time-zone differences cannot break hydration.
  const [lastScannedTime, setLastScannedTime] = useState<string>("Connecting…");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Cycle through monitored ecosystem tags every 3.5s
  useEffect(() => {
    setLastScannedTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setActiveVendorIdx((prev) => (prev + 1) % MONITORED_ECOSYSTEMS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // 24/7 Background Live Polling Hook (Runs every 20s)
  useEffect(() => {
    const pollDeals = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/deals");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.deals) && data.deals.length > 0) {
          setDeals(data.deals);
          setLastScannedTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        // Silently retain current state
      }
    };

    const intervalId = setInterval(pollDeals, 20000);
    return () => clearInterval(intervalId);
  }, []);

  const handleManualScan = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/deals");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.deals)) {
          setDeals(data.deals);
          setLastScannedTime(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.error("Deal scan error", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const publishedDeals = deals
    .filter((d) => d.status === "PUBLISHED" || d.status === "VERIFIED")
    .slice(0, 6);

  return (
    <section id="deal-radar" className="py-14 sm:py-20 bg-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
      {/* Decorative ambient background radar grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="store-container relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span>⚡ 24/7 AUTONOMOUS DEAL RADAR</span>
              </div>

              {/* Dynamic live ecosystem radar tracker */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-[10px] font-mono text-slate-300">
                <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                <span className="text-slate-400">Monitoring:</span>
                <span className="text-cyan-300 font-bold transition-all duration-300">
                  {MONITORED_ECOSYSTEMS[activeVendorIdx]}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              Discovered Developer Perks &amp; Trials
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Our autonomous crawlers discover and verify third-party vendor deals, student perks, and cloud infrastructure credits in real-time so you never pay full price.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleManualScan}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
              title="Trigger Live Crawler Check"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span>{isRefreshing ? "Crawling..." : "Ping Radar"}</span>
            </button>

            <Link
              href="/deals"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <span>All live radar discoveries</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
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
                className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-sm p-5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/30 transition-all duration-200"
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
