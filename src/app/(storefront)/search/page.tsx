import { Metadata } from "next";
import Link from "next/link";
import { 
  Search, 
  ShoppingBag, 
  Flame, 
  Sparkles, 
  Cpu, 
  FileText, 
  Scale, 
  Database, 
  ArrowRight,
  Sliders
} from "lucide-react";
import { performUniversalSearch, UniversalSearchResult } from "@/lib/search/universal-search";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import { ProductGrid } from "@/components/storefront/product-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Universal Search · TRIHEX DIGITAL",
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tab?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", tab = "ALL" } = await searchParams;
  const query = q.trim();

  const [searchData, products] = await Promise.all([
    query ? performUniversalSearch(query, 12) : Promise.resolve({ totalCount: 0, groups: [] }),
    query ? getLiveMerchandisingCatalogue({ query }) : Promise.resolve([]),
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return ShoppingBag;
      case "DEAL":
        return Flame;
      case "PROMPT":
        return Sparkles;
      case "SKILL":
        return Cpu;
      case "GUIDE":
        return FileText;
      case "RESEARCH":
        return Scale;
      case "DATASET":
        return Database;
      default:
        return Search;
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Universal Search
          </h1>
          <p className="text-sm text-slate-400">
            Search across software products, verified deals, AI prompts, agent skills, guides, and civic data.
          </p>

          <form action="/search" method="GET" className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search anything (e.g. Cursor, Copilot, ChatGPT, C#, Supabase, Nepal)..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              Search
            </button>
          </form>
        </div>

        {query ? (
          <div className="space-y-10">
            <div className="text-xs font-mono text-slate-400 border-b border-white/10 pb-3">
              Found <strong className="text-white">{searchData.totalCount}</strong> cross-platform results for &ldquo;{query}&rdquo;
            </div>

            {searchData.totalCount === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl border border-white/5 bg-slate-900/40">
                <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white">No results found</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  No items matched &ldquo;{query}&rdquo;. Try another term or browse our categories directly.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {searchData.groups.map((group) => {
                  const Icon = getIcon(group.type);
                  return (
                    <section key={group.type} className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                        <Icon className="w-4 h-4 text-blue-400" />
                        <span>{group.label}</span>
                        <span className="text-slate-500 font-mono">({group.count})</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.results.map((item) => (
                          <Link
                            key={item.id}
                            href={item.url}
                            className="flex flex-col justify-between p-4 rounded-xl border border-white/10 bg-slate-900/70 hover:bg-slate-900 hover:border-blue-500/40 transition group"
                          >
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    item.badgeColor || "bg-slate-800 text-slate-300 border-white/5"
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              </div>
                              <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-400 line-clamp-2">
                                {item.subtitle}
                              </p>
                            </div>

                            <div className="flex items-center justify-end text-xs text-blue-400 group-hover:translate-x-0.5 transition-transform">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {/* If product matches exist, display ProductGrid */}
            {products.length > 0 && (
              <div className="pt-8 border-t border-white/10 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-400" /> Matching Software Storefront Plans ({products.length})
                </h2>
                <ProductGrid products={products} />
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-4">
            <p className="text-sm">
              Type your search query above or press <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-white/10 font-mono text-xs">Cmd + K</kbd> anywhere on the site.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
