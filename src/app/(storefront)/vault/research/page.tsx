import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, FileText, ExternalLink, ArrowRight, Lock } from "lucide-react";
import { getAllResearchItems } from "@/lib/vault/research-registry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Research Vault · Audited Public Records & Unsealed Dockets",
  description:
    "Audited public domain legal records, federal court dockets, historical treaties, and cybersecurity advisories with strict rights provenance.",
  openGraph: {
    title: "TRIHEX Research Vault · Audited Public Records",
    description: "Public domain court records, unsealed dockets, and historical treaties.",
    url: "https://trihexdigital.shop/vault/research",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/vault/research",
  },
};

export default function ResearchVaultPage() {
  const items = getAllResearchItems();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/vault"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Classified Vault
          </Link>
        </div>

        {/* Banner with Strict Compliance Notice */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-10 mb-8 backdrop-blur-xl">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Scale className="w-3.5 h-3.5" />
              Audited Transparency & Judicial Archive
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Public Records & Research Vault
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Verifiable federal court dockets, unsealed judicial exhibits, historical sovereignty archives, and cybersecurity advisories. 100% lawful public domain records with complete legal provenance.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Zero stolen credentials · Zero private leaks · Verifiable legal basis
            </span>
            <span className="font-mono text-slate-400">
              Audited records: <strong className="text-white">{items.length}</strong>
            </span>
          </div>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-6 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all shadow-lg"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                  {item.redistributionStatus}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {item.category}
                </span>
              </div>

              <h2 className="text-base font-bold text-white mb-2 leading-snug">
                {item.title}
              </h2>

              <div className="text-xs text-slate-400 mb-3 font-medium">
                {item.courtOrAgency}
                {item.docketNumber && <span> · Docket: {item.docketNumber}</span>}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4 flex-1 line-clamp-3">
                {item.summary}
              </p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Audited: {new Date(item.lastAuditedAt).toLocaleDateString()}
                </span>

                <Link
                  href={`/vault/research/${item.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  View Record
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
