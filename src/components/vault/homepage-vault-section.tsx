import Link from "next/link";
import { getHomepageVaultEntries } from "@/lib/vault/vault-aggregator";
import { formatRelativeAge } from "@/lib/nepal/forex-shared";
import { ShieldCheck, ArrowRight, Lock, ExternalLink, Flame } from "lucide-react";

export function HomepageVaultSection() {
  const items = getHomepageVaultEntries();

  return (
    <section className="border-b border-slate-200/80 bg-slate-950 py-16 sm:py-20 text-white">
      <div className="store-container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              <Flame className="h-3.5 w-3.5" />
              <span>TRIHEX VAULT DROPS</span>
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-sora)] text-2xl font-bold tracking-tight sm:text-3xl text-white">
              Inside the TRIHEX Vault
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl">
              Curated software bundles, live verified developer perks, master prompt toolkits, and public intelligence records.
            </p>
          </div>

          <Link
            href="/vault"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0 shadow-sm"
          >
            <span>Explore Full Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6-Card Grid: Strictly 1 card per row on mobile (<640px), 2 on md, 3 on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const isExternal = item.priceMode === "EXTERNAL" || item.destinationUrl.startsWith("http");
            const age = formatRelativeAge(item.publishedAt);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-5 hover:border-blue-500/40 hover:bg-slate-900 transition-all shadow-xl"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-white/5 border border-white/10 text-slate-300">
                    {item.provenance}
                  </span>

                  {item.entityType === "DEAL" && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <ShieldCheck className="w-3 h-3" /> Verified {age}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-2 leading-snug">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                  {item.summary}
                </p>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {item.displayPrice}
                  </span>

                  {isExternal ? (
                    <a
                      href={item.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      <span>Claim</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      href={item.destinationUrl}
                      className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white font-semibold"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
