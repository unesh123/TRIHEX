import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { NewsCard } from "@/components/news/news-card";
import { VaultEntry } from "@/lib/vault/vault-types";
import { NewsArticle } from "@/lib/news/types";
import { DealCandidate } from "@/lib/deals/types";
import { MerchCard } from "@/lib/catalog/merchandising";
import { ResearchItem } from "@/lib/vault/research-registry";
import { 
  Sparkles, 
  Tag, 
  Newspaper, 
  FileText, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Flame,
  Layers
} from "lucide-react";

interface DiscoveryFeedProps {
  products: MerchCard[];
  vaultDrops: VaultEntry[];
  deals: DealCandidate[];
  news: NewsArticle[];
  researchBriefs: ResearchItem[];
}

export function UnifiedDiscoveryFeed({
  products,
  vaultDrops,
  deals,
  news,
  researchBriefs,
}: DiscoveryFeedProps) {
  const boundedProducts = products.slice(0, 6);
  const boundedVault = vaultDrops.slice(0, 6);
  const boundedDeals = deals.slice(0, 6);
  const boundedNews = news.slice(0, 6);
  const boundedResearch = researchBriefs.slice(0, 3);

  return (
    <div className="space-y-16">
      {/* 1. Six Featured Merchandised Products */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-600">
              <Sparkles className="w-4 h-4" /> Flagship Catalog (6 Top Verified)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Software Licenses with Local Support
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boundedProducts.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* 2. Six Flagship Vault Drops */}
      <section className="space-y-6 rounded-3xl bg-slate-950 p-6 sm:p-8 text-white border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-400">
              <Terminal className="w-4 h-4" /> TRIHEX VAULT (6 Featured Drops)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Curated Tools, Perks &amp; Research Toolkits
            </h2>
          </div>
          <Link
            href="/vault"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition"
          >
            <span>Explore Entire Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boundedVault.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-4 rounded-2xl bg-slate-900/80 border border-white/5 hover:border-blue-500/40 transition space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                    {item.priceMode}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">{item.summary}</p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500">{item.provenance}</span>
                <Link
                  href={item.destinationUrl}
                  className="inline-flex items-center gap-1 text-blue-400 font-semibold hover:underline text-xs"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Six Verified Software Deals */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              <Tag className="w-4 h-4" /> Deal Radar (6 Verified Deals)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Verified Developer Deals &amp; Cloud Credits
            </h2>
          </div>
          <Link
            href="/deals"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {boundedDeals.map((deal) => (
            <div
              key={deal.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase font-mono text-slate-500">
                    {deal.vendor}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {deal.dealType.replace("_", " ")}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {deal.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {deal.summary}
                </p>
                {deal.eligibility && (
                  <p className="text-[11px] text-amber-700 font-medium">
                    Eligibility: {deal.eligibility}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 font-mono text-xs">
                  {deal.detectedValueNprMinor
                    ? `~NPR ${(deal.detectedValueNprMinor / 100).toLocaleString()}`
                    : "Free Perk"}
                </span>
                <a
                  href={deal.officialVendorUrl || deal.sourceClaimUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-emerald-600 transition"
                >
                  <span>Claim</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Six Live News Intelligence Headlights */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-purple-600">
              <Newspaper className="w-4 h-4" /> Live Intelligence (6 Latest Briefings)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Nepal Tech Ecosystem &amp; AI Intelligence
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 transition"
          >
            <span>Open Intelligence Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {boundedNews.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* 5. Three Evidence-Backed Research Briefings */}
      <section className="space-y-6 rounded-3xl bg-slate-900/40 p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-700">
              <FileText className="w-4 h-4" /> Deep Research (3 Evidence Briefings)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Grounded Civic &amp; Economic Records
            </h2>
          </div>
          <Link
            href="/nepal/research"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
          >
            <span>Run Custom Research</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {boundedResearch.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[150px]">{item.courtOrAgency}</span>
                <a
                  href={item.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline shrink-0"
                >
                  <span>Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
