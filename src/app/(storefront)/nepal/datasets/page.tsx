import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, ExternalLink, MapPin } from "lucide-react";
import { getOpenDatasets } from "@/lib/nepal/open-data-adapter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nepal Open Datasets Directory · TRIHEX Nepal Pulse",
  description:
    "Curated directory of verified public civic, economic, health, and energy datasets for Nepal from official government sources.",
  alternates: {
    canonical: "https://trihexdigital.shop/nepal/datasets",
  },
};

export default function NepalDatasetsPage() {
  const datasets = getOpenDatasets();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/nepal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Nepal Pulse
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
            <Database className="w-4 h-4" /> Open Data Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Nepal Civic & Geographic Open Datasets
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Standardized open-access datasets from the National Statistics Office, Nepal Rastra Bank, Nepal Electricity Authority, and Ministry of Health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-red-500/30 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-500/10 text-red-300 border border-red-500/20 font-mono">
                  {ds.category}
                </span>
                <div className="flex items-center gap-1">
                  {ds.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono font-semibold"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="text-base font-bold text-white mb-1 leading-snug">
                {ds.title}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed mb-4 flex-1">
                {ds.description}
              </p>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="text-[11px] truncate max-w-[200px]">
                  Source: <span className="text-slate-200">{ds.organization}</span>
                </div>

                {ds.downloadUrl && (
                  <a
                    href={ds.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold transition"
                  >
                    Access Data <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
