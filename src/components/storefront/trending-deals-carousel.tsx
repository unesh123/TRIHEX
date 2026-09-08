import Link from "next/link";
import Image from "next/image";
import { 
  Flame, 
  ShieldCheck, 
  Zap, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Clock
} from "lucide-react";
import type { MerchCard } from "@/lib/catalog/merchandising";
import { formatStorePrice } from "@/lib/catalog/merchandising";

interface TrendingDealsProps {
  products: MerchCard[];
}

export function TrendingDealsCarousel({ products }: TrendingDealsProps) {
  // Select flagship trending items
  const trendingSlugs = [
    "chatgpt-plus-1-month-fw",
    "claude-pro-1-month",
    "cursor-pro-12m",
    "capcut-pro-30-days",
    "canva-pro-1-year",
    "gemini-pro-18-months-link",
    "elevenlabs-creator-shared",
    "grok-super-12-months-link",
  ];

  const displayList = products
    .filter((p) => {
      const s = p.slug.toLowerCase();
      return trendingSlugs.some((ts) => s.includes(ts) || ts.includes(s));
    })
    .slice(0, 8);

  // Fallback to top available products if exact slugs differ
  const finalProducts = displayList.length >= 4 ? displayList : products.slice(0, 8);

  return (
    <section id="trending-deals" className="py-14 sm:py-20 bg-white border-b border-border">
      <div className="store-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2">
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>🔥 Trending Premium Deals</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              High-Demand AI Tools &amp; Pro Subscriptions
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Verified accounts, official licenses, and full warranty packages with transparent NPR pricing and instant WhatsApp delivery in Nepal.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
          >
            <span>View all {products.length} products</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {finalProducts.map((p) => {
            const priceLabel = p.priceNprMinor ? formatStorePrice(p.priceNprMinor) : "Rs. 399";
            // Synthetic reference benchmark for high-converting anchor comparison
            const originalNpr = p.priceNprMinor ? Math.round((p.priceNprMinor * 1.5) / 100) : 599;

            return (
              <div
                key={p.slug}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all duration-200"
              >
                {/* Badges Top Bar */}
                <div className="flex items-center justify-between gap-1 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Verified Deal</span>
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                    <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span>Trending</span>
                  </span>
                </div>

                {/* Product Cover Thumbnail */}
                <Link href={`/products/${p.slug}`} className="block relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 mb-3.5">
                  {p.coverPublicPath || p.thumbnailPublicPath ? (
                    <Image
                      src={p.thumbnailPublicPath || p.coverPublicPath!}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-950 text-white font-bold text-sm">
                      {p.title.slice(0, 15)}
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-500 mb-1">
                    <span className="truncate">{p.categoryName}</span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>4.9</span>
                    </span>
                  </div>

                  <Link href={`/products/${p.slug}`} className="block">
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                  </Link>

                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.packageLabel || p.shortDescription || "Full replacement warranty package with dedicated access."}
                  </p>
                </div>

                {/* Pricing & Guarantees */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-2.5">
                    <div>
                      <span className="text-[11px] text-slate-400 line-through mr-1.5 font-mono">
                        Rs. {originalNpr.toLocaleString()}
                      </span>
                      <span className="text-lg font-black text-slate-950 font-mono tracking-tight">
                        {priceLabel}
                      </span>
                    </div>
                    <span className="rounded-full bg-rose-50 border border-rose-200/60 px-2 py-0.5 text-[10px] font-extrabold text-rose-600">
                      SAVE 30%+
                    </span>
                  </div>

                  {/* Trust Micro-Bullets */}
                  <div className="grid grid-cols-2 gap-1 mb-3 text-[10px] text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>Full Warranty</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-blue-600" />
                      <span>Instant Slip QA</span>
                    </span>
                  </div>

                  {/* Buy Now CTA */}
                  <Link
                    href={`/products/${p.slug}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition-all shadow-sm"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
