import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { ALL_SEED_PRODUCTS } from "@/db/seed-data";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/live-merchandising";
import { ExternalLink, Search, Layers, ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCatalogueTraceIndexPage() {
  const merchItems = await getLiveMerchandisingCatalogue();

  // Combine seeds and merch items
  const products = ALL_SEED_PRODUCTS.map((seed) => {
    const merch = merchItems.find((m) => m.slug === seed.slug);
    return {
      slug: seed.slug,
      name: seed.name,
      category: seed.categorySlug,
      priceNpr: merch?.priceNprMinor ? merch.priceNprMinor / 100 : 0,
      variantsCount: seed.variants?.length || 1,
    };
  });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Forensic Catalogue Trace"
        description="Inspect product pipelines, provenance sources, supplier margins, and media integrity."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Active Catalogue Products ({products.length})
            </h2>
            <p className="text-xs text-slate-500">
              Click any product to inspect its complete pipeline, margins, and asset traces.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-600 hover:text-cyan-700"
          >
            <span>Manage Products</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <Link
              key={p.slug}
              href={`/admin/catalogue-trace/${p.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-cyan-300 hover:bg-cyan-50/20 hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-block rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-700">
                    {p.category}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-600 transition" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-cyan-700 transition">
                  {p.name}
                </h3>
                <p className="mt-1 font-mono text-xs text-slate-400">
                  /{p.slug}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-xs text-slate-600">
                <span>{p.variantsCount} variants</span>
                <span className="font-semibold text-slate-900">
                  {p.priceNpr > 0 ? `NPR ${p.priceNpr.toLocaleString()}` : "Dynamic Pricing"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
