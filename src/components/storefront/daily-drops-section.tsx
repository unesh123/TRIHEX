import Link from "next/link";
import { 
  Rocket, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Flame,
  Zap
} from "lucide-react";

interface DropItem {
  id: string;
  badge: string;
  timeAgo: string;
  title: string;
  category: string;
  type: "DEAL" | "PRODUCT" | "VAULT";
  href: string;
  ctaText: string;
}

const TODAY_DROPS: DropItem[] = [
  {
    id: "drop-1",
    badge: "NEW DROP",
    timeAgo: "2 hours ago",
    title: "CapCut Pro 1-Month Plan Price Adjusted to Rs. 399",
    category: "Video Editing",
    type: "PRODUCT",
    href: "/products/capcut-pro-30-days",
    ctaText: "Order for Rs. 399",
  },
  {
    id: "drop-2",
    badge: "FREE PERK",
    timeAgo: "4 hours ago",
    title: "Dropshipping Master Bundle 2026 Direct Vault Link",
    category: "Business Education",
    type: "VAULT",
    href: "#free-vault",
    ctaText: "Unlock Free Access",
  },
  {
    id: "drop-3",
    badge: "VERIFIED DEAL",
    timeAgo: "Today",
    title: "DigitalOcean $200 Infrastructure Cloud Credits",
    category: "Cloud Compute",
    type: "DEAL",
    href: "/deals#digitalocean-200-credits",
    ctaText: "View Terms",
  },
  {
    id: "drop-4",
    badge: "AI TOOL",
    timeAgo: "Today",
    title: "Cursor Pro 12-Month High-Throughput Developer Pass",
    category: "AI Coding",
    type: "PRODUCT",
    href: "/products/cursor-pro-12m",
    ctaText: "Inspect Plan",
  },
];

export function DailyDropsSection() {
  return (
    <section className="py-14 sm:py-18 bg-slate-900 text-white border-b border-slate-800">
      <div className="store-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">
              <Rocket className="h-3.5 w-3.5 text-blue-400" />
              <span>🚀 Today&apos;s Digital Drops</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Fresh Deals &amp; Releases Added Daily
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Synced live with TRIHEX Operations
          </span>
        </div>

        {/* Drops Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {TODAY_DROPS.map((drop) => (
            <Link
              key={drop.id}
              href={drop.href}
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <span className="rounded bg-blue-950 border border-blue-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-300">
                    {drop.badge}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{drop.timeAgo}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                  {drop.title}
                </h3>

                <p className="mt-1 text-[11px] text-slate-400">
                  {drop.category}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-cyan-300">
                <span>{drop.ctaText}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
