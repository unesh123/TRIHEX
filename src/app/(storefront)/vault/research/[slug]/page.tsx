import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Scale, ShieldCheck, FileText, ExternalLink, CheckCircle } from "lucide-react";
import { getResearchItemBySlug } from "@/lib/vault/research-registry";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getResearchItemBySlug(slug);

  if (!item) {
    return {
      title: "Record Not Found · TRIHEX DIGITAL",
    };
  }

  return {
    title: `${item.title} · TRIHEX Research Vault`,
    description: item.summary,
    openGraph: {
      title: `${item.title} · TRIHEX Research Vault`,
      description: item.summary,
      url: `https://trihexdigital.shop/vault/research/${item.slug}`,
      siteName: "TRIHEX DIGITAL",
    },
    alternates: {
      canonical: `https://trihexdigital.shop/vault/research/${item.slug}`,
    },
  };
}

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getResearchItemBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/vault/research"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Research Vault
          </Link>
        </div>

        {/* Title Header */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 mb-8 backdrop-blur-xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
              {item.redistributionStatus}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
              {item.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            {item.title}
          </h1>

          <div className="text-sm text-slate-300 flex flex-wrap gap-y-1 gap-x-4">
            <div>Agency: <strong className="text-white">{item.courtOrAgency}</strong></div>
            {item.docketNumber && (
              <div>Docket: <strong className="text-white font-mono">{item.docketNumber}</strong></div>
            )}
            <div>Filing Date: <strong className="text-white font-mono">{item.filingDate}</strong></div>
            {item.unsealedDate && (
              <div>Unsealed Date: <strong className="text-white font-mono">{item.unsealedDate}</strong></div>
            )}
          </div>
        </div>

        {/* Legal & Provenance Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Document Abstract & Scope
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-400" /> Historical & Investigative Significance
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {item.significance}
              </p>
            </div>

            {/* Exhibits / Document Index */}
            {item.keyExhibits && item.keyExhibits.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" /> Key Unsealed Evidentiary Exhibits
                </h2>
                <div className="space-y-3">
                  {item.keyExhibits.map((ex) => (
                    <div
                      key={ex.exhibitNumber}
                      className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{ex.title}</span>
                        <span className="font-mono text-purple-400 font-semibold">{ex.exhibitNumber}</span>
                      </div>
                      <p className="text-xs text-slate-300">{ex.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Legal Provenance Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Legal Provenance
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Legal Right of Access:</span>
                <p className="text-slate-200 leading-relaxed font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-white/5">
                  {item.legalBasis}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Audited By:</span>
                <span className="text-white font-medium">{item.verifiedBy}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Last Audit:</span>
                <span className="text-white font-mono">{new Date(item.lastAuditedAt).toLocaleDateString()}</span>
              </div>

              <div className="pt-3 border-t border-white/10">
                <a
                  href={item.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-md"
                >
                  Official Court Docket
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
